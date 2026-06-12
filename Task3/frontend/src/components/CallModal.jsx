import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoCall, IoVideocam, IoVideocamOff, IoMic, IoMicOff, IoClose, IoDesktop, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { resetCall, setCall } from '../redux/callSlice';
import dp from "../assets/dp.webp";

const CallModal = () => {
    const { isCalling, receivingCall, caller, callerSignal, callAccepted, callType, remoteUser } = useSelector(state => state.call);
    const { socket } = useSelector(state => state.socket);
    const { userData } = useSelector(state => state.user);
    const dispatch = useDispatch();

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCamOff, setIsCamOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
    const [volume, setVolume] = useState(1);

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const peerConnection = useRef();
    const ringtoneRef = useRef(null);
    const screenStreamRef = useRef(null);

    useEffect(() => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.volume = isSpeakerMuted ? 0 : volume;
        }
    }, [volume, isSpeakerMuted]);

    useEffect(() => {
        if (!ringtoneRef.current) {
            // Using a direct MP3 link that is known to work
            ringtoneRef.current = new Audio("https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=iPhone+Ringtone&filename=mt/mtIphone-1262-1114.mp3");
            ringtoneRef.current.loop = true;
        }

        const playRingtone = async () => {
            if (receivingCall && !callAccepted) {
                try {
                    console.log("ATTEMPTING TO PLAY RINGTONE...");
                    ringtoneRef.current.volume = 0.5;
                    await ringtoneRef.current.play();
                    console.log("RINGTONE PLAYING SUCCESSFULLY");
                } catch (e) {
                    console.error("Ringtone auto-play blocked by browser. Click the page to allow audio.", e);
                }
            } else {
                console.log("STOPPING RINGTONE");
                ringtoneRef.current.pause();
                ringtoneRef.current.currentTime = 0;
            }
        };

        playRingtone();

        return () => {
            if (ringtoneRef.current) {
                ringtoneRef.current.pause();
            }
        };
    }, [receivingCall, callAccepted]);

    const servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
    };

    useEffect(() => {
        if (isCalling && !callAccepted && !peerConnection.current) {
            handleStartCall();
        }
        if (receivingCall && !callAccepted && !localStream) {
            setupMedia();
        }
    }, [isCalling, receivingCall]);

    useEffect(() => {
        if (callAccepted && remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [callAccepted, remoteStream]);

    useEffect(() => {
        if (localStream && localVideoRef.current && !localVideoRef.current.srcObject) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, callAccepted]);

    const setupMedia = async () => {
        try {
            if (localStream) {
                if (localVideoRef.current && !localVideoRef.current.srcObject) {
                    localVideoRef.current.srcObject = localStream;
                }
                return localStream;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: callType === 'video',
                audio: true,
            });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.error("Error accessing media devices:", err);
        }
    };

    const stopMedia = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (peerConnection.current) {
            peerConnection.current.close();
        }
    };

    const initializePeerConnection = async (stream) => {
        const pc = new RTCPeerConnection(servers);
        peerConnection.current = pc;

        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
            console.log("RECEIVED REMOTE TRACK", event.streams[0]);
            const incomingStream = event.streams[0];
            setRemoteStream(incomingStream);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = incomingStream;
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("SENDING ICE CANDIDATE");
                socket.emit("ice-candidate", {
                    to: isCalling ? remoteUser._id : (caller?._id || remoteUser?._id),
                    candidate: event.candidate,
                });
            }
        };

        return pc;
    };

    const handleStartCall = async () => {
        try {
            const stream = await setupMedia();
            const pc = await initializePeerConnection(stream);
            
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            console.log("Sending call offer to backend...");
            socket.emit("callUser", {
                userToCall: remoteUser._id,
                signalData: offer,
                from: userData,
                name: userData.name,
                callType
            });
        } catch (err) {
            console.error("Error in handleStartCall:", err);
            handleEndCall();
        }
    };

    const handleAnswerCall = async () => {
        const stream = localStream || await setupMedia();
        const pc = await initializePeerConnection(stream);

        await pc.setRemoteDescription(new RTCSessionDescription(callerSignal));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("answerCall", {
            signal: answer,
            to: caller._id
        });
        dispatch(setCall({ callAccepted: true }));
    };

    useEffect(() => {
        if (socket) {
            const handleCallAccepted = async (signal) => {
                if (peerConnection.current) {
                    try {
                        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
                        dispatch(setCall({ callAccepted: true }));
                    } catch (err) {
                        console.error("Error setting remote description:", err);
                    }
                }
            };

            const handleIceCandidate = async (candidate) => {
                if (peerConnection.current) {
                    try {
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (e) {
                        console.error("Error adding ice candidate", e);
                    }
                }
            };

            const handleEndCallEvent = () => {
                handleEndCall();
            };

            socket.on("callAccepted", handleCallAccepted);
            socket.on("ice-candidate", handleIceCandidate);
            socket.on("endCall", handleEndCallEvent);

            return () => {
                socket.off("callAccepted", handleCallAccepted);
                socket.off("ice-candidate", handleIceCandidate);
                socket.off("endCall", handleEndCallEvent);
            };
        }
    }, [socket, dispatch]);

    const handleEndCall = () => {
        socket.emit("endCall", { to: remoteUser?._id || caller?._id });
        stopMedia();
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
        }
        dispatch(resetCall());
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks()[0].enabled = isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleCam = () => {
        if (localStream && callType === 'video') {
            localStream.getVideoTracks()[0].enabled = isCamOff;
            setIsCamOff(!isCamOff);
        }
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ 
                    video: {
                        cursor: "always"
                    },
                    audio: false 
                });
                screenStreamRef.current = stream;
                const videoTrack = stream.getVideoTracks()[0];

                if (peerConnection.current) {
                    const senders = peerConnection.current.getSenders();
                    const sender = senders.find(s => s.track && s.track.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(videoTrack);
                    }
                }

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                videoTrack.onended = () => {
                    stopScreenShare();
                };

                setIsScreenSharing(true);
            } catch (err) {
                console.error("Error sharing screen:", err);
            }
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
        }
        
        const videoTrack = localStream.getVideoTracks()[0];
        if (peerConnection.current) {
            const senders = peerConnection.current.getSenders();
            const sender = senders.find(s => s.track && s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(videoTrack);
            }
        }
        
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
        
        setIsScreenSharing(false);
    };

    const toggleSpeaker = () => {
        setIsSpeakerMuted(!isSpeakerMuted);
    };

    if (!isCalling && !receivingCall && !callAccepted) return null;

    console.log("RENDERING CALL MODAL - receivingCall:", receivingCall, "isCalling:", isCalling);

    return (
        <div className='fixed inset-0 z-[1000] bg-black/90 flex flex-col items-center justify-center p-5'>
            <div className='w-full max-w-4xl flex flex-col items-center gap-8'>
                
                {/* User Info */}
                <div className='flex flex-col items-center gap-4'>
                    <div className='w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500'>
                        <img src={(remoteUser?.profileImage || caller?.profileImage) || dp} alt="" className='w-full h-full object-cover'/>
                    </div>
                    <h2 className='text-white text-2xl font-bold'>
                        {remoteUser?.name || caller?.name}
                    </h2>
                    <p className='text-gray-400'>
                        {callAccepted ? "In Call" : receivingCall ? "Incoming Call..." : "Calling..."}
                    </p>
                </div>

                {/* Video Area */}
                <div className='relative w-full aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center'>
                    
                    {/* Remote Video (Main View) */}
                    <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        playsInline 
                        className={`w-full h-full object-cover ${(callType === 'video' && callAccepted) ? 'block' : 'hidden'}`}
                        onLoadedMetadata={(e) => e.target.play()}
                    />

                    {/* Local Video (Small Preview) */}
                    <div className={`absolute bottom-4 right-4 w-1/4 aspect-video bg-black rounded-xl overflow-hidden border border-white/20 shadow-lg ${callType === 'video' ? 'block' : 'hidden'}`}>
                        <video 
                            ref={localVideoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className='w-full h-full object-cover'
                            onLoadedMetadata={(e) => e.target.play()}
                        />
                    </div>

                    {/* Audio Call UI */}
                    {callType === 'audio' && callAccepted && (
                        <div className='flex flex-col items-center gap-4'>
                            <div className='w-32 h-32 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse'>
                                <IoCall className='w-16 h-16 text-purple-500'/>
                            </div>
                            <p className='text-purple-500 font-medium'>Audio Call Active</p>
                        </div>
                    )}

                    {/* Call Signaling UI (Ringing/Calling) */}
                    {!callAccepted && (
                        <div className='flex flex-col items-center gap-6'>
                            <div className='relative'>
                                <div className='absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-20'></div>
                                <div className='w-32 h-32 rounded-full bg-purple-500/10 flex items-center justify-center relative z-10'>
                                    {callType === 'video' ? <IoVideocam className='w-16 h-16 text-purple-500'/> : <IoCall className='w-16 h-16 text-purple-500'/>}
                                </div>
                            </div>
                            <p className='text-gray-400 text-lg'>
                                {receivingCall ? "Wants to talk to you" : "Waiting for answer..."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className='flex items-center gap-6'>
                    {receivingCall && !callAccepted ? (
                        <>
                            <button onClick={handleAnswerCall} className='w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-3xl hover:bg-green-600 transition-colors shadow-lg'>
                                <IoCall/>
                            </button>
                            <button onClick={handleEndCall} className='w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white text-3xl hover:bg-red-600 transition-colors shadow-lg'>
                                <IoClose/>
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl transition-all ${isMuted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                {isMuted ? <IoMicOff/> : <IoMic/>}
                            </button>
                            
                            {callType === 'video' && (
                                <>
                                    <button onClick={toggleCam} className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl transition-all ${isCamOff ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                        {isCamOff ? <IoVideocamOff/> : <IoVideocam/>}
                                    </button>
                                    <button onClick={toggleScreenShare} className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl transition-all ${isScreenSharing ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                        <IoDesktop/>
                                    </button>
                                </>
                            )}

                            <div className='flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2'>
                                <button onClick={toggleSpeaker} className='text-white text-xl'>
                                    {isSpeakerMuted || volume === 0 ? <IoVolumeMute/> : <IoVolumeHigh/>}
                                </button>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.1" 
                                    value={isSpeakerMuted ? 0 : volume} 
                                    onChange={(e) => {
                                        setVolume(parseFloat(e.target.value));
                                        if (isSpeakerMuted) setIsSpeakerMuted(false);
                                    }}
                                    className='w-24 accent-purple-500 cursor-pointer'
                                />
                            </div>

                            <button onClick={handleEndCall} className='w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white text-3xl hover:bg-red-600 transition-colors shadow-lg'>
                                <IoClose/>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CallModal;
