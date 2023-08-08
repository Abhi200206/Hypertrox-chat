const express = require('express');
const app = express();
var mysql = require('mysql2');
const bodyParser = require('body-parser');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
const url=__dirname ;
//
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
//
io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('storeClientInfo', userId => {
    connectedClients[userId] = socket;
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const userId = Object.keys(connectedClients).find(key => connectedClients[key] === socket);
    if (userId) {
      delete connectedClients[userId];
    }
  });

  socket.on('chatMessage', ({ senderId, receiverId, message }) => {
    const senderSocket = connectedClients[senderId];
    const receiverSocket = connectedClients[receiverId];

    if (senderSocket && receiverSocket) {
      senderSocket.emit('chatMessage', { senderId, receiverId, message });
      receiverSocket.emit('chatMessage', { senderId, receiverId, message });
    }
  });
});

//
app.get('/', (req, res) => {
  res.sendFile(url+'/public/index.html');
});
app.get('/login.html', (req, res) => {
  res.sendFile(__dirname+'/public/login.html');
});
app.get('/signup.html', (req, res) => {

  res.sendFile(url+'/public/signup.html');
});
app.post('/submit-form',(req,res)=>{
  console.log(req.body);
  const username = req.body.us;
  const password = req.body.psw;
  console.log(username);
  const con = mysql.createConnection({
    host: "localhost",
    user: "user1",
    password: "pswd123",
    database: "user"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    const sql = "select * from hypertrox where username = ? and password=?;";
    con.query(sql,[username,password],  function (err, result) {
      if (err)
      throw err;
      console.log("Result:", result);
      if (result.length === 0) {
        
        res.send('Invalid username or password');
      } else {
        const user = result[0];
        console.log("user:",user);
        res.redirect(`/user.html?username=${user.username}&email=${user.email}&Name=${user.Name}`);
      }
      
    });
  
  });
  

})
app.post('/signup',(req,res)=>{
  console.log(req.body);
  const username = req.body.user;
  const password = req.body.pass;
  const name = req.body.name;
  const email=req.body.email;
  console.log(username);
  const con = mysql.createConnection({
    host: "localhost",
    user: "user1",
    password: "pswd123",
    database: "user"
  });
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    const sql = "INSERT INTO hypertrox VALUES (?, ?,?,?)";
    con.query(sql,[name,username,email,password],  function (err, result) {
      if (err)
      throw err;
      console.log("1 record inserted");
      
      res.redirect('/login.html');

      
      
    });
     
    });


});
app.get('/user.html',(req,res)=> {
  const username = req.query.username;
  

  res.render('user', { username });
});
app.post('/search',(req,res)=>{
  const usersearch=req.body.usersearch;
  const con = mysql.createConnection({
    host: "localhost",
    user: "user1",
    password: "pswd123",
    database: "user"
  });
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    const sql = "select username from hypertrox where username = ?;";
    con.query(sql,[usersearch],  function (err, result) {
      if (err)
      throw err;
      console.log("fetched sucessfully");
      const user = result[0];
      console.log(result);
      console.log("user:",user);
      res.redirect(`/search.html?username=${user.username}`);
    });
  });
});



const port = 3000; 
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
