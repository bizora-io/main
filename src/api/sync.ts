import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { LedgerEntry } from '../contexts/DataContext.js';
import mongoose from 'mongoose';
import connectDB from '../lib/db.js'; // <-- new

const router = express.Router();

// Schema
const syncSchema = new mongoose.Schema({
    userId: String,
    data: Object,
    lastSynced: Date
});

const SyncModel = mongoose.models.Sync || mongoose.model('Sync', syncSchema);

router.post('/', authMiddleware, async (req, res) => {
    await connectDB(); // <-- Add this

    const { userId, data } = req.body;

    try {
        await SyncModel.findOneAndUpdate(
            { userId },
            { data, lastSynced: new Date() },
            { upsert: true }
        );
        res.json({ status: 'success' });
    } catch (error) {
        console.error(error); // <-- see error in logs
        res.status(500).json({ error: 'Sync failed' });
    }
});

export default router;