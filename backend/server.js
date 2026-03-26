require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const cors = require('cors');
// --- Blueprints & Security Guards ---
const User = require('./models/User'); 
const Transaction = require('./models/Transaction'); 
const auth = require('./middleware/auth'); 
const adminAuth = require('./middleware/admin'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to read incoming JSON data
app.use(express.json());
app.use(express.json());
app.use(cors()); // NEW: Allows your Next.js frontend to talk to this API!

// ---------------------------------------------------
// 1. DATABASE CONNECTION
// ---------------------------------------------------
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Vault Successfully!'))
    .catch((err) => console.log('❌ Database connection error:', err));


// ---------------------------------------------------
// 2. PUBLIC ROUTES (No Login Required)
// ---------------------------------------------------

// REGISTER
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists!" });

        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            balance: 0 
        });
        await newUser.save();

        res.status(201).json({ message: "Secure bank account created successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        // Check if the Admin froze this account
        if (user.isBlocked) {
            return res.status(403).json({ 
                message: "Access Denied: Your account has been suspended. Please contact support." 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: "Login successful!", token: token });
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
});


// ---------------------------------------------------
// 3. PROTECTED ROUTES (Requires Standard VIP Pass)
// ---------------------------------------------------

// GET BALANCE
app.get('/api/balance', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "Bank account not found." });

        res.json({ name: user.name, email: user.email, balance: user.balance, currency: "INR" });
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

// DEPOSIT MONEY
app.post('/api/deposit', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount." });

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "Bank account not found." });

        user.balance += amount;
        await user.save();

        res.json({ message: `Successfully deposited ${amount} INR!`, newBalance: user.balance });
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

// TRANSFER MONEY (With Fraud Engine)
app.post('/api/transfer', auth, async (req, res) => {
    try {
        const { receiverEmail, amount } = req.body;
        if (!receiverEmail || !amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid transfer details." });
        }

        const sender = await User.findById(req.user.userId);
        if (sender.email === receiverEmail) {
            return res.status(400).json({ message: "You cannot transfer money to yourself." });
        }

        const receiver = await User.findOne({ email: receiverEmail });
        if (!receiver) return res.status(404).json({ message: "Receiver not found." });

        if (sender.balance < amount) {
            return res.status(400).json({ message: "Insufficient balance!" });
        }

        // Fraud Detection
        let suspiciousActivity = false;
        if (amount > 50000) {
            suspiciousActivity = true;
            console.log(`🚨 FRAUD ALERT: Large transaction of ${amount} INR detected from ${sender.name}!`);
        }

        // Move the money
        sender.balance -= amount;
        receiver.balance += amount;
        await sender.save();
        await receiver.save();

        // Write the receipt
        const transaction = new Transaction({
            sender: sender._id,
            receiver: receiver._id,
            amount: amount,
            isFlagged: suspiciousActivity
        });
        await transaction.save(); 

        res.json({
            message: `Successfully transferred ${amount} INR to ${receiver.name}!`,
            fraudWarning: suspiciousActivity ? "This transaction has been flagged for review." : "Clear",
            yourNewBalance: sender.balance
        });

    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

// GET TRANSACTION HISTORY
app.get('/api/transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [{ sender: req.user.userId }, { receiver: req.user.userId }]
        })
        .populate('sender', 'name email')
        .populate('receiver', 'name email')
        .sort({ createdAt: -1 }); 

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
});


// ---------------------------------------------------
// 4. ADMIN DASHBOARD ROUTES (Requires VIP Pass + Admin Badge)
// ---------------------------------------------------

// VIEW FLAGGED TRANSACTIONS
app.get('/api/admin/flagged', auth, adminAuth, async (req, res) => {
    try {
        const flaggedTransactions = await Transaction.find({ isFlagged: true })
            .populate('sender', 'name email')
            .populate('receiver', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            message: "Welcome to the Admin Dashboard",
            totalFlagged: flaggedTransactions.length,
            alerts: flaggedTransactions
        });
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

// FREEZE / UNFREEZE ACCOUNT
app.put('/api/admin/block/:id', auth, adminAuth, async (req, res) => {
    try {
        const userToBlock = await User.findById(req.params.id);
        if (!userToBlock) return res.status(404).json({ message: "User not found." });

        if (userToBlock._id.toString() === req.user.userId) {
            return res.status(400).json({ message: "You cannot block yourself." });
        }

        userToBlock.isBlocked = !userToBlock.isBlocked;
        await userToBlock.save();

        const status = userToBlock.isBlocked ? "Frozen 🚫" : "Active ✅";
        res.json({ message: `Account for ${userToBlock.name} is now ${status}` });

    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
});


// ---------------------------------------------------
// 5. START SERVER
// ---------------------------------------------------
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});