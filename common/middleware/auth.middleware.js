import jwt from "jsonwebtoken";
import User from "../../modules/user/user.model.js";

export const requireSignin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            //Handle Errors
            if (err) {
                if (err.name === 'TokenExpiredError')
                    return res.status(401).json({ error: "Authentication Expired" })

                if (err.name === 'JsonWebTokenError')
                    return res.status(401).json({ error: "Invalid Authentication" })

                if (err.name === 'NotBeforeError')
                    return res.status(401).json({ error: "Invalid Authentication" })

            } else {
                //proceed
                req.user = decoded;
                next();
            }
        });
    } else {
        // Handle the case where the token is missing or invalid
        return res.status(400).json({ error: 'Permission Denied for this request' });
    }
}

export const authMiddleware = async (req, res, next) => {
    // const authUserId = req.user._id;
    if (req.user?._id) {
        try {
            const user = await User.findById({ _id: req.user?._id }).exec();
            if (!user) {
                return res.status(401).json({
                    error: "Requesting user invalid"
                });
            }
            req.profile = user;
            next();
        } catch (err) {
            return res.status(401).json({ error: "Invalid Authentication" });
        }
    } else {
        return res.status(401).json({ error: "Invalid Authentication" });
    }


};