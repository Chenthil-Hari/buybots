import express from 'express';
import Project from '../models/Project.js';

const router = express.Router();

// Get all open projects
router.get('/open', async (req, res) => {
    try {
        const projects = await Project.find({ status: 'open' }).sort({ isPinned: -1, createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a project
router.post('/', async (req, res) => {
    try {
        const newProject = new Project(req.body);
        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get user's projects (as buyer)
router.get('/user/:userId', async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get seller's projects
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const projects = await Project.find({ sellerId: req.params.sellerId }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update project status (e.g. accept, deliver, complete)
router.patch('/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        );
        res.json(project);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Place a bid
router.post('/:id/bid', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        
        // Check for duplicate bids
        const existingBid = project.bids.find(b => b.sellerId === req.body.sellerId);
        if (existingBid) return res.status(400).json({ error: 'Already bid on this project' });

        project.bids.push(req.body);
        await project.save();
        res.json(project);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Accept a bid
router.post('/:id/accept-bid', async (req, res) => {
    try {
        const { bidId } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const bid = project.bids.id(bidId);
        if (!bid) return res.status(404).json({ error: 'Bid not found' });

        project.status = 'in-progress';
        project.sellerId = bid.sellerId;
        project.sellerName = bid.sellerName;
        project.budget = bid.bidAmount;
        project.platformFee = bid.bidAmount * 0.10;
        project.totalCost = bid.bidAmount * 1.10;
        project.acceptedAt = new Date();
        
        await project.save();
        res.json(project);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a project
router.delete('/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
