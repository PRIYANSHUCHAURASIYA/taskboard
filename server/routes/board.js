import express from 'express';
import Board from '../models/Board.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All board routes require login
router.use(authMiddleware);

// CREATE a board
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    const board = await Board.create({
      title,
      owner: req.userId,
      members: [req.userId],
    });
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all boards for logged-in user
router.get('/', async (req, res) => {
  try {
    const boards = await Board.find({ members: req.userId }).sort({ createdAt: -1 });
    res.json(boards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single board (only if user is a member)
router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, members: req.userId });
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a board (only owner can delete)
router.delete('/:id', async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.userId });
    if (!board) return res.status(404).json({ message: 'Board not found or not authorized' });
    await board.deleteOne();
    res.json({ message: 'Board deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
