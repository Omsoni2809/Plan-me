require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Routes
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// --- DYNAMIC CORS CONFIGURATION ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://plan-me-seven.vercel.app', 
  'https://plan-b1tp85kov-om-soni1.vercel.app',
  process.env.FRONTEND_URL // Keeps your env variable working
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or postman) 
    // OR if the origin is in our allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// System Route
app.get('/', (req, res) => {
  res.json({ message: 'Plan Me Server is running with MongoDB Atlas!' });
});

// Mount Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});