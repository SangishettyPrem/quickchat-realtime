import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import envConfig from "../config/envConfig.js";

const ensuredAuthenticated = (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - No token provided'
            })
        }
        const decoded = jwt.verify(token, envConfig.jwtSecert);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error("Error occured while verifying the Token: ", error);
        return res.status(500).json({ message: error?.message, success: false });
    }
}

export default ensuredAuthenticated;