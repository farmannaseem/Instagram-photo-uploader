const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/instagram-clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once('open', () => {
  console.log('Connected to MongoDB');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

let posts = [];

app.get('/posts', (req, res) => {
  res.json(posts);
});

app.post('/upload', upload.single('file'), (req, res) => {
  try {
    const post = {
      _id: Date.now().toString(),
      imageUrl: `http://localhost:3001/uploads/${req.file.filename}`,
      description: req.body.description,
      likes: 0,
      comments: [],
    };
    posts.push(post);
    io.emit('updatePost', post);
    res.sendStatus(201);
  } catch (error) {
    console.error('Error while uploading file:', error);
    res.sendStatus(500);
  }
});

app.post('/posts/:id/like', (req, res) => {
  const post = posts.find((p) => p._id === req.params.id);
  if (post) {
    post.likes += 1;
    io.emit('updatePost', post);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.post('/posts/:id/comment', (req, res) => {
  const post = posts.find((p) => p._id === req.params.id);
  if (post) {
    post.comments.push(req.body.comment);
    io.emit('updatePost', post);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});
