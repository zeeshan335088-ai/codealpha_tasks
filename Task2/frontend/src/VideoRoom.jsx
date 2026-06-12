import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { socket } from './socket';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Monitor, User } from 'lucide-react';

const VideoRoom = forwardRef(({ roomId, userId }, ref) => {
  const [peers, setPeers] = useState({});
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const localVideoRef = useRef();
  const streamRef = useRef();
  const screenStreamRef = useRef();
  const peersRef = useRef({});

  // Expose stopCall to parent via ref
  useImperativeHandle(ref, () => ({
    stopCall
  }));

  // Auto-start call when component mounts
  useEffect(() => {
    startCall();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCall();
    };
  }, []);

    // Socket listeners
    useEffect(() => {
        if (!isInCall) return;

        const onUserJoined = async ({ userId: joinedUserId, socketId }) => {
            console.log('User joined:', joinedUserId);
            const pc = createPeerConnection(socketId, streamRef.current);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('offer', { offer, to: socketId, userId });
        };

        const onOffer = async ({ offer, from, userId: offerUserId }) => {
            console.log('Received offer from:', offerUserId);
            const pc = createPeerConnection(from, streamRef.current);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer', { answer, to: from });
        };

        const onAnswer = async ({ answer, from }) => {
            console.log('Received answer from:', from);
            const pc = peersRef.current[from];
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        };

        const onIceCandidate = async ({ candidate, from }) => {
            const pc = peersRef.current[from];
            if (pc) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error('Error adding ice candidate', e);
                }
            }
        };

        const onUserLeft = ({ socketId }) => {
            console.log('User left:', socketId);
            if (peersRef.current[socketId]) {
                peersRef.current[socketId].close();
                delete peersRef.current[socketId];
                setPeers(prev => {
                    const next = { ...prev };
                    delete next[socketId];
                    return next;
                });
            }
        };

        socket.on('user-joined', onUserJoined);
        socket.on('offer', onOffer);
        socket.on('answer', onAnswer);
        socket.on('ice-candidate', onIceCandidate);
        socket.on('user-left', onUserLeft);

        return () => {
            socket.off('user-joined', onUserJoined);
            socket.off('offer', onOffer);
            socket.off('answer', onAnswer);
            socket.off('ice-candidate', onIceCandidate);
            socket.off('user-left', onUserLeft);
        };
    }, [isInCall, roomId, userId]);

    // Ensure local video is set and playing when isInCall changes
    useEffect(() => {
        if (isInCall && streamRef.current && localVideoRef.current) {
            localVideoRef.current.srcObject = streamRef.current;
            localVideoRef.current.play().catch(err => console.error("Video play error:", err));
        }
    }, [isInCall]);

    const startCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: !isVideoOff, 
                audio: !isMuted 
            });
            streamRef.current = stream;
            
            setIsInCall(true);
            socket.connect();
            socket.emit('join-room', roomId, userId);
        } catch (err) {
            console.error('Error accessing media devices:', err);
            alert('Could not access camera or microphone');
        }
    };

    const stopCall = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        Object.values(peersRef.current).forEach(pc => pc.close());
        peersRef.current = {};
        setPeers({});
        setIsInCall(false);
        socket.disconnect();
    };

    const createPeerConnection = (socketId, stream) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peersRef.current[socketId] = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, to: socketId });
            }
        };

        pc.ontrack = (event) => {
            setPeers(prev => ({
                ...prev,
                [socketId]: event.streams[0]
            }));
        };

        return pc;
    };

    const toggleMute = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        } else {
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        } else {
            setIsVideoOff(!isVideoOff);
        }
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];

                // Replace video track in all peer connections
                Object.values(peersRef.current).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(screenTrack);
                    }
                });

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream;
                }

                screenTrack.onended = () => {
                    stopScreenShare();
                };

                setIsScreenSharing(true);
            } catch (err) {
                console.error('Error sharing screen:', err);
            }
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack) {
            Object.values(peersRef.current).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            });
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = streamRef.current;
        }

        setIsScreenSharing(false);
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 rounded-3xl overflow-hidden relative shadow-2xl border border-slate-800">
            {/* Video Area */}
            <div className="flex-1 relative min-h-0">
                {isInCall ? (
                    <div className="w-full h-full relative">
                        {/* Remote Videos (Main View) */}
                        <div className="w-full h-full">
                            {Object.entries(peers).length > 0 ? (
                                Object.entries(peers).map(([socketId, stream]) => (
                                    <RemoteVideo key={socketId} stream={stream} socketId={socketId} />
                                ))
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                    <div className="text-center">
                                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                            <User size={48} className="text-slate-600" />
                                        </div>
                                        <p className="text-slate-400 font-medium">Waiting for others to join...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Local Video (Small Overlay) */}
                        <div className="absolute top-6 right-6 w-32 md:w-48 aspect-[3/4] bg-slate-800 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl z-20">
                            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                            <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white">
                                You
                            </div>
                        </div>

                        {/* Call Info Overlay */}
                        <div className="absolute top-6 left-6 z-10">
                            <div className="bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/5">
                                <h3 className="text-white font-bold text-sm">Main Room</h3>
                                <p className="text-white/60 text-[10px] flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> 04:20
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-slate-900 to-slate-950">
                        <div className="w-32 h-32 bg-blue-600/10 rounded-full flex items-center justify-center mb-8 relative">
                            <Video size={56} className="text-blue-500" />
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-950 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-3">Video Call</h3>
                        <p className="text-slate-400 max-w-sm mx-auto mb-10 leading-relaxed">
                            Start a high-quality video call with your team. Secure, end-to-end encrypted communication.
                        </p>
                        <button 
                            onClick={startCall}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-xl shadow-blue-600/20 flex items-center gap-3"
                        >
                            <Phone size={24} />
                            Start / Join Call
                        </button>
                    </div>
                )}
            </div>

            {/* Call Controls Overlay */}
            {isInCall && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                    <div className="bg-black/30 backdrop-blur-2xl p-4 rounded-3xl border border-white/10 flex items-center gap-4 shadow-2xl">
                        <button 
                            onClick={toggleMute}
                            className={`p-4 rounded-2xl transition-all ${isMuted ? 'bg-red-500 shadow-lg shadow-red-500/20' : 'bg-white/10 hover:bg-white/20'}`}
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
                        </button>
                        
                        <button 
                            onClick={toggleVideo}
                            className={`p-4 rounded-2xl transition-all ${isVideoOff ? 'bg-red-500 shadow-lg shadow-red-500/20' : 'bg-white/10 hover:bg-white/20'}`}
                            title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                        >
                            {isVideoOff ? <VideoOff size={24} className="text-white" /> : <Video size={24} className="text-white" />}
                        </button>

                        <button 
                            onClick={toggleScreenShare}
                            className={`p-4 rounded-2xl transition-all ${isScreenSharing ? 'bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/10 hover:bg-white/20'}`}
                            title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
                        >
                            <Monitor size={24} className="text-white" />
                        </button>

                        <div className="w-px h-8 bg-white/10 mx-1" />

                        <button 
                            onClick={stopCall}
                            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-500/30"
                        >
                            <PhoneOff size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

const RemoteVideo = ({ stream, socketId }) => {
    const videoRef = useRef();
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => console.error("Remote video play error:", err));
        }
    }, [stream]);

    return (
        <div className="w-full h-full bg-slate-900">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-32 left-8 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white border border-white/5">
                User {socketId.slice(0, 4)}
            </div>
        </div>
    );
};

export default VideoRoom;
