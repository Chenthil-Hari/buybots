import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    deadline: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['open', 'in-progress', 'delivered', 'completed'], 
        default: 'open' 
    },
    userId: { type: String, required: true }, // Clerk User ID
    userName: { type: String, required: true },
    category: { type: String, default: 'Other' },
    fulfillmentType: { type: String, default: null },
    
    // Parts list / BOM for Physical Robot
    partsList: [{
        name: String,
        qty: Number
    }],
    
    // Shipping address for physical deliveries
    shippingAddress: { type: String, default: null },
    
    // Category-specific fields
    categoryFields: { type: Map, of: String, default: null },
    
    // Estimated delivery info
    estimatedDelivery: {
        min: Number,
        max: Number,
        label: String
    },
    
    // Seller bids
    bids: [{
        sellerId: String,
        sellerName: String,
        bidAmount: Number,
        message: String,
        estimatedDays: Number,
        createdAt: { type: Date, default: Date.now }
    }],
    
    // Assigned Seller info
    sellerId: { type: String, default: null },
    sellerName: { type: String, default: null },
    deliverable: { type: String, default: null },
    
    // Admin features
    isPinned: { type: Boolean, default: false },
    
    // Timing
    acceptedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    
    // Rating
    rating: { type: Number, default: null },
    reviewText: { type: String, default: null }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;
