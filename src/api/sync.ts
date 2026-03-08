import express from 'express';
import { authenticateToken } from './middleware/auth.js';
import { LedgerEntry } from '../contexts/DataContext.js';
import mongoose from 'mongoose';

const router = express.Router();

const syncSchema = new mongoose.Schema({
    userId: String,
    data: Object,
    lastSynced: Date
});

const SyncModel = mongoose.model('Sync', syncSchema);

router.post('/', authenticateToken, async (req, res) => {
    const { userId, data } = req.body;

    try {
        await SyncModel.findOneAndUpdate(
            { userId },
            { data, lastSynced: new Date() },
            { upsert: true }
        );

        res.json({ status: 'success' });
    } catch (error) {
        res.status(500).json({ error: 'Sync failed' });
    }
});

export default router;