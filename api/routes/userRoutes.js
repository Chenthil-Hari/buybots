import express from 'express';
import User from '../models/User.js';
import { sendWelcomeEmail } from '../utils/emailService.js';

const router = express.Router();

// Sync user data from Clerk to MongoDB
router.post('/sync', async (req, res) => {
    const { clerkId, email, name, role, capabilities } = req.body;

    try {
        // Find user by clerkId or email and update, or create if not found
        const user = await User.findOneAndUpdate(
            { clerkId },
            { 
                email, 
                name, 
                role, 
                capabilities,
                updatedAt: new Date()
            },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: 'User synced successfully',
            user
        });
    } catch (err) {
        console.error('Error syncing user:', err);
        res.status(500).json({ message: 'Error syncing user data', error: err.message });
    }
});

// Get user data
router.get('/:clerkId', async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.params.clerkId });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user', error: err.message });
    }
});
// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
});

// Delete user (Admin action)
router.delete('/:clerkId', async (req, res) => {
    try {
        const result = await User.deleteOne({ clerkId: req.params.clerkId });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
});

// Send Welcome Email
router.post('/welcome-email', async (req, res) => {
    const { email, name } = req.body;
    if (!email || !name) {
        return res.status(400).json({ message: 'Email and name are required' });
    }

    try {
        const result = await sendWelcomeEmail(email, name);
        if (result.success) {
            res.json({ message: 'Welcome email sent successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send email', error: result.error });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

export default router;
