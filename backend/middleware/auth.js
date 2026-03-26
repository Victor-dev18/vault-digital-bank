const jwt = require('jsonwebtoken');

// This is our security guard function
module.exports = function(req, res, next) {
    // 1. Ask the user for their VIP Pass (Token)
    // In APIs, tokens are usually sent in the "Authorization" header
    const token = req.header('Authorization');

    // 2. If they didn't bring a token at all, kick them out
    if (!token) {
        return res.status(401).json({ message: "Access Denied. You must be logged in!" });
    }

    try {
        // 3. If they have a token, check if it's real or a fake!
        // We strip away the word "Bearer " which Postman usually adds to the front
        const cleanToken = token.replace("Bearer ", "");
        const verified = jwt.verify(cleanToken, process.env.JWT_SECRET);

        // 4. The token is real! Attach the user's ID to the request so we know who it is
        req.user = verified;
        
        // 5. Open the door and let them proceed to the next step
        next(); 
    } catch (error) {
        // If the token is fake or expired
        res.status(400).json({ message: "Invalid or expired VIP pass." });
    }
};