import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    role: {
        type: String,
        enum: ['user', 'seller'],
        default: 'user'
    },
    capabilities: {
        canAssemble: { type: Boolean, default: false },
        hasPartsInStock: { type: Boolean, default: false }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

export default User;
