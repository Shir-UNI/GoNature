const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');

// Load routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const groupRoutes = require('./routes/groupRoutes');
const authRoutes = require('./routes/authRoutes');
const feedRoutes = require('./routes/feedRoutes');
const pageRoutes = require('./routes/pageRoutes');


require('custom-env').env(process.env.NODE_ENV, './config');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.urlencoded({extended : true}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultSecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use('/uploads', express.static('public/uploads'));

app.locals.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;


// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// routes
app.use('/', pageRoutes); // mounted at root, so /feed will work
app.use('/api/auth', authRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/groups', groupRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
