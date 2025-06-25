import { DataTypes } from "sequelize";
import sequelize from "../config/dbConnection.js";

const ConversationModel = sequelize.define('conversations', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user1_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user2_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'conversations',
    timestamps: false,
    indexes: [
        {
            name: 'unique_users',
            unique: true,
            fields: ['user1_id', 'user2_id']
        }
    ]
});

export default ConversationModel;