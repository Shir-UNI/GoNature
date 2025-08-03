const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');

// Load routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const groupRoutes = require('./routes/groupRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());


// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/groups', groupRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
