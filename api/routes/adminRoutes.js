import express from 'express';

const router = express.Router();

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
        return res.status(500).json({ message: 'Admin credentials not configured on server' });
    }

    if (username === validUsername && password === validPassword) {
        // In a production app, return a signed JWT.
        // For simplicity, we return a simple success token flag.
        res.status(200).json({ token: 'buybots_admin_auth_success' });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

export default router;
