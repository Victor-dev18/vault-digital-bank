const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'Success' },
    
    // NEW: Fraud Detection Flag (Defaults to false because most transactions are safe)
    isFlagged: { type: Boolean, default: false }, 
    
    createdAt: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('Transaction', transactionSchema);