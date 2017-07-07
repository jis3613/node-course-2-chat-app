const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();


app.use(express.static(publicPath));

io.on('connection',(socket)=>{
  console.log('New user connected');
  //on은 듣는거 emit은 보내는거
  // socket.emit('newMessage',{
  //   from: 'John',
  //   text: 'See you then',
  //   createdAt: 1123123
  // });
  //socket.emit은 emit event to a single connection
  // socket.emit('newEmail',{
  //   from: 'mike@example.com',
  //   text: 'Hey, whatsssup',
  //   createdAt: 123
  // });

  // socket.emit('newMessage',{
  //   from: 'Admin',
  //   text: 'Welcome to the chat app',
  //   createdAt: new Date().getTime()
  // });

  // socket.broadcast.emit('newMessage',{
  //   from: 'Admin',
  //   text: 'New user joined',
  //   createdAt: new Date().getTime()
  // });


  socket.on('join',(params, callback)=>{
    if(!isRealString(params.name) || !isRealString(params.room)){
      return callback('Name and room name are required.');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    //socket.leave('The Office Fans');
    //io.emit  emitting to everyon connected->io.to('The Office Fans').emit //to emit to everybody in the office room
    //socket.broadcast.emit  -> socket.boradcast.to('The Office Fans').emit //to emit to everybody in the office room except the current user
    //socket.emit
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage',generateMessage('Admin', `${params.name} has joined.`));
    callback();
  });

  socket.on('createMessage',(message,callback) => {
    // console.log('createMessage',message);
    var user = users.getUser(socket.id);
    if(user && isRealString(message.text)){
      io.to(user.room).emit('newMessage',generateMessage(user.name, message.text));
    }

    callback();
    //io.emit은 emit event to every single connection
    // io.emit('newMessage',{
    //   from: message.from,
    //   text: message.text,
    //   createdAt: new Date().getTime()
    // });

    //broadcast 나뺴고 나머지한테 다 보내는거
    // socket.broadcast.emit('newMessage',{
    //   from: message.from,
    //   text: message.text,
    //   createdAt: new Date().getTime()
    // })
  });

  socket.on('createLocationMessage', (coords)=>{
    var user = users.getUser(socket.id);
    if(user){
      io.to(user.room).emit('newLocationMessage',generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });

  socket.on('disconnect', () =>{
    // console.log('User was disconnected');
    var user = users.removeUser(socket.id);

    if(user){
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has left`));
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
