import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

// Get a setting by key
router.get('/:key', async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: req.params.key });
        if (!setting) return res.json({ key: req.params.key, value: false }); // Default to false
        res.json(setting);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching setting', error: err.message });
    }
});

// Update or create a setting (Admin restricted in practice)
router.post('/', async (req, res) => {
    const { key, value } = req.body;
    try {
        const setting = await Settings.findOneAndUpdate(
            { key },
            { value, updatedAt: new Date() },
            { upsert: true, new: true }
        );
        res.json(setting);
    } catch (err) {
        res.status(500).json({ message: 'Error updating setting', error: err.message });
    }
});

export default router;
