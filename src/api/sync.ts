import express from 'express';
import { authMiddleware } from './middleware/auth.js';
import { LedgerEntry } from '../contexts/DataContext.js';
import mongoose from 'mongoose';

const router = express.Router();

// Define a simple schema for syncing
const syncSchema = new mongoose.Schema({
    userId: String,
    data: mongoose.Schema.Types.Mixed,
    lastSynced: Date
});

const SyncModel = mongoose.models.Sync || mongoose.model('Sync', syncSchema);

router.post('/', authMiddleware, async (req, res) => {
    const { userId, data } = req.body;
    console.log(`Sync request received for user: ${userId}`);

    if (mongoose.connection.readyState !== 1) {
        console.error('MongoDB not connected');
        return res.status(503).json({ error: 'Database not connected' });
    }

    if (!userId || !data) {
        console.error('Missing userId or data in request body');
        return res.status(400).json({ error: 'Missing userId or data' });
    }

    try {
        const result = await SyncModel.findOneAndUpdate(
            { userId } as any,
            { 
                $set: { 
                    lastSynced: new Date(),
                    data: data 
                } 
            },
            { upsert: true, new: true }
        ) as any;
        
        if (result) {
            console.log(`Sync successful for user: ${userId}. Document ID: ${result._id}`);
            res.json({ status: 'success', id: result._id });
        } else {
            throw new Error('Sync operation returned null');
        }
    } catch (error) {
        console.error('Sync failed:', error);
        res.status(500).json({ error: 'Sync failed', details: error.message });
    }
});

export default router;
