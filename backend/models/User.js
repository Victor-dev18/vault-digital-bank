const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    
    // NEW: Role-Based Access
    role: { type: String, default: 'user' }, 
    
    // NEW: Account Status
    isBlocked: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);