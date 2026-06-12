import http from "http"
import express from "express"
import { Server } from "socket.io"
const app=express()
const server=http.createServer(app)

const io=new Server(server,{
    cors:{
        origin:"http://localhost:5173",
        methods:["GET","POST"]
    }
})

const userSocketMap={} 

export const getSocketId=(receiverId)=>{
 return userSocketMap[receiverId]
}

io.on("connection",(socket)=>{
   const userId=socket.handshake.query.userId
   if (userId!=undefined){
    userSocketMap[userId]=socket.id
   }

 io.emit('getOnlineUsers',Object.keys(userSocketMap))


socket.on('disconnect',()=>{
    delete userSocketMap[userId]
    io.emit('getOnlineUsers',Object.keys(userSocketMap))
})

// Video/Audio Call Events
socket.on("callUser", ({ userToCall, signalData, from, name, callType }) => {
    const receiverSocketId = getSocketId(userToCall);
    console.log(`Call from ${from.userName} to ${userToCall}. Receiver Socket: ${receiverSocketId}`);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("callUser", { signal: signalData, from, name, callType });
    }
});

socket.on("answerCall", (data) => {
    const receiverSocketId = getSocketId(data.to);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("callAccepted", data.signal);
    }
});

socket.on("ice-candidate", (data) => {
    const receiverSocketId = getSocketId(data.to);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("ice-candidate", data.candidate);
    }
});

socket.on("endCall", ({ to }) => {
    const receiverSocketId = getSocketId(to);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("endCall");
    }
});

})

export {app,io, server} 