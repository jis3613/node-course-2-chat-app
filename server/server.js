const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);


app.use(express.static(publicPath));

io.on('connection',(socket)=>{
  console.log('New user connected');
  //on은 듣는거 emit은 보내는거
  socket.emit('newMessage',{
    from: 'John',
    text: 'See you then',
    createdAt: 1123123
  });

  socket.emit('newEmail',{
    from: 'mike@example.com',
    text: 'Hey, whatsssup',
    createdAt: 123
  });

  socket.on('createMessage',(message) => {
    console.log('createMessage',message);
  });

  socket.on('disconnect', () =>{
    console.log('User was disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
