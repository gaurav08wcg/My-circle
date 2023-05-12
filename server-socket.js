module.exports = {
    createRoom : function(){
        return io.on("connection", (socket) =>{
            console.log("Socket Connected...");
            // console.log("socket id =>",socket.id);
            // console.log("query =>",socket.handshake.query);            
            socket.join(socket.handshake.query.userId);
            // console.log("rooms =>", socket.rooms);  
        })
    }
}