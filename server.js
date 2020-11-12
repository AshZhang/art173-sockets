const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
let circles = new Map();
class Circle {
    constructor(id, x, y, size, col, clicked, freq) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.size = size;
        this.col = col;
        this.clicked = clicked;

    }
}

io.on('connection', function (socket) {
    console.log('client connected:', socket.id);
    socket.on('start', (data) => {
        const circle = new Circle(socket.id, data.x, data.y, data.size, data.col, data.clicked, data.freq)
        circles.set(socket.id, circle);
    });

    socket.on('update', (data) => {
        circles.set(socket.id, data);
    });

    socket.on('disconnect', function () {
        console.log(`Client ${socket.id} has disconnected`);
        circles.delete(socket.id);
    });
});
app.use('/', express.static(__dirname + "/simple-sound-circle-game-main"));

http.listen(process.env.PORT || 7000);
console.log(`Server is running on ${process.env.PORT}`);

setInterval(heartbeat, 33);

function heartbeat() {
    io.sockets.emit('heartbeat', JSON.stringify(Array.from(circles)));
}
