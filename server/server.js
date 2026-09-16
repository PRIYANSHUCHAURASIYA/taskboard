import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import BoardRoutes from './routes/board.js';
import listRoutes from './routes/list.js';
import cardRoutes from './routes/card.js'
import commentRoutes from './routes/comment.js'

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/boards' , BoardRoutes);
app.use('/api/lists' , listRoutes);
app.use('/api/cards' , cardRoutes);
app.use('/api/comments' , commentRoutes);
app.get('/api/health', (req, res) => {
  res.status(200).json({  message: 'Server is running' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});
