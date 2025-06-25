import { DataTypes } from "sequelize";
import sequelize from "../config/dbConnection.js";

const UserModel = sequelize.define("users", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    profile_image: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM('online', 'offline', 'busy'),
        defaultValue: 'offline'
    },
    last_seen: {
        type: DataTypes.DATE,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users',
    timestamps: false,
    underscored: true
});

export default UserModel;