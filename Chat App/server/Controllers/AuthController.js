import sequelize from "../config/dbConnection.js";
import UserModel from "../Models/UserModel.js";
import logger from "../utils/logger.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import envConfig from "../config/envConfig.js";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from "fs"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SignUpController = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        const { name, email, password } = req.body;
        const isEmailExists = await UserModel.findOne({ where: { email }, transaction });
        if (isEmailExists) {
            return res.status(409).json({ message: "Email Already Exists", success: false });
        }
        const HashedPassword = await bcrypt.hash(password, 10);
        const isUserCreated = await UserModel.create({ name, email, password: HashedPassword }, { transaction });
        await transaction.commit();
        if (isUserCreated) {
            return res.status(201).json({ message: "Welcome", success: true });
        } else {
            return res.status(500).json({ message: "Failed to create user", success: false });
        }
    } catch (error) {
        await transaction?.rollback();
        logger.error("Error occured while signup: ", error);
        return res.status(500).json({ message: error?.message || "Error while Signup.", success: false });
    }
}

export const LoginController = async (req, res) => {
    let transaction;
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ where: { email }, transaction });
        if (!user) {
            return res.status(409).json({ message: "Email Not found", success: false });
        }
        const isPasswordMatch = await bcrypt.compare(password, user?.password);
        if (!isPasswordMatch) {
            return res.status(409).json({ message: "Invalid Password", success: false });
        }
        const payload = { user };
        const token = jwt.sign(payload, envConfig.jwtSecert, {
            expiresIn: "1d"
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.status(200).json({ message: "Login Success", user, success: true });
    } catch (error) {
        await transaction.rollback();
        logger.error("Error occured while Login: ", error);
        return res.status(500).json({ message: error?.message || "Error while Login.", success: false });
    }
}

export const VerifyUser = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token found", success: false });
        }
        const decoded = await jwt.verify(token, envConfig.jwtSecert);
        const user = await UserModel.findOne({ where: { id: decoded?.user?.id }, transaction });
        await transaction.commit();
        return res.status(200).json({
            message: "User Verified Successfully",
            success: true,
            user: user?.dataValues,
        })
    } catch (error) {
        await transaction.rollback();
        logger.error("Error occured while Login: ", error);
        return res.status(500).json({ message: error?.message || "Error while Login.", success: false });
    }
}

export const Logout = (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "strict",
            secure: envConfig.nodeENV === "production",
        });

        return res.status(200).json({ message: "Token removed successfully", success: true });
    } catch (error) {
        logger.error('Error while doing Logout: ', error);
        return res.status(500).json({ message: error?.message || "Failed to logout", success: false });
    }
}

export const UpdateProfile = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        const id = req.params.id;
        if (!id) {
            return res.status(409).json({ message: "ID Not Found", success: false });
        }
        const userObj = await UserModel.findOne({ where: { id }, transaction });
        if (!userObj) {
            return res.status(409).json({ message: "User Not Found", success: false })
        }
        const { name, bio } = req.body;
        const file = req.file;
        let ProfilePath;
        if (file) {
            ProfilePath = `/uploads/${file.filename}`;
            const user = userObj?.dataValues;
            const oldProfileImage = user?.profile_image;
            if (oldProfileImage) {
                const imagePath = path.join(__dirname, '..', oldProfileImage);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }
        const updateUserProfile = {
            name,
            bio,
            ...(file && { profile_image: ProfilePath })
        }
        await UserModel.update(updateUserProfile, { where: { id }, transaction });
        const updatedUser = await UserModel.findOne({ where: { id }, transaction });
        await transaction.commit();
        return res.status(200).json({ message: "Updated Successfully", user: updatedUser, success: true });
    } catch (error) {
        if (transaction) await transaction.rollback();
        if (req.file) {
            try {
                const imagePath = path.join(__dirname, '..', 'uploads', req.file.filename);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            } catch (error) {
                logger.error("Error occurred while Updating profile: ", error);
                return res.status(500).json({ message: error?.message || "Error while Updating Profile", success: false })
            }

        }
        logger.error("Error occurred while Updating profile: ", error);
        return res.status(500).json({ message: error?.message || "Error while Updating Profile", success: false })
    }
}