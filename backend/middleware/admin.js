const User = require('../models/User');

// This bouncer runs AFTER the first one, so we already know they are logged in.
module.exports = async function(req, res, next) {
    try {
        // Find the specific user in the vault
        const user = await User.findById(req.user.userId);

        // Check their role badge
        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Access Denied. Manager clearance required!" });
        }

        // If they are an admin, open the VIP door!
        next(); 
    } catch (error) {
        res.status(500).json({ message: "Server error checking admin status." });
    }
};