import logger from "../utils/logger.js"
import UserModel from "../Models/UserModel.js";
import sequelize from "../config/dbConnection.js";


export const fetchUsers = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        const users = await UserModel.findAll({ transaction });
        const [unReadMsgCount] = await sequelize.query(
            `SELECT sender_id,COUNT(*) AS unreadCount FROM messages where isRead = 0 group by sender_id;
        `);
        await transaction.commit();
        return res.status(200).json({ users, unReadMsgCount, success: true });
    } catch (error) {
        await transaction?.rollback();
        logger.error("Error while fetching Users: ", error);
        return res.status(500).json({ message: error?.message || "Error while fetching Users", success: false });
    }
}