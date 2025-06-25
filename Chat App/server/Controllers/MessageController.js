import sequelize from "../config/dbConnection.js"
import MessageModel from "../Models/Messages.model.js";
import logger from "../utils/logger.js";

export const sendMessage = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        const { conversationId, senderId, message, receiverId } = req.body;

        const newMessage = await MessageModel.create({
            conversation_id: conversationId,
            sender_id: senderId,
            receiver_id: receiverId,
            message
        }, { transaction });
        const [unReadCount] = await sequelize.query(`
            SELECT sender_id, COUNT(*) AS unreadCount
            FROM messages
            WHERE receiver_id = ${receiverId} AND isRead = 0
            GROUP BY sender_id;
        `, { transaction });
        global.io.to(String(receiverId)).emit('receive-message', { ...newMessage?.dataValues });
        global.io.to(String(receiverId)).emit('update-unread-count', unReadCount);
        await transaction.commit();
        return res.status(200).json({ message: newMessage, success: true });
    } catch (error) {
        await transaction.rollback();
        logger.error("Error while Sending Message: ", error);
        return res.status(500).json({ message: error?.message || "Failed to Send Message", success: false })
    }
}

export const getMessages = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        const conversationId = req.params?.conversationId;
        const messages = await MessageModel.findAll({ where: { conversation_id: conversationId }, transaction });
        await transaction.commit();
        return res.status(200).json({ messages, success: true });

    } catch (error) {
        if (transaction) await transaction.rollback();
        logger.error("Error while retrieving  Message: ", error);
        return res.status(500).json({ message: error?.message || "Failed to retrive Message", success: false })
    }
}

export const markMessagesAsRead = async (req, res) => {
    let transaction
    try {
        transaction = await sequelize.transaction();
        const id = req.params.id;
        const receiverId = req.user?.user.id;
        await MessageModel.update(
            { isRead: 1 },
            {
                where: {
                    sender_id: id,
                    receiver_id: receiverId,
                    isRead: 0,
                }, transaction
            }
        );
        const [unReadCount] = await sequelize.query(`
            SELECT sender_id, COUNT(*) AS unreadCount
            FROM messages
            WHERE receiver_id = ${receiverId} AND isRead = 0
            GROUP BY sender_id;
        `, { transaction });
        await transaction.commit();
        global.io.to(String(receiverId)).emit('update-unread-count', unReadCount);
        return res.status(200).json({ success: true });
    } catch (error) {
        if (transaction) await transaction.rollback();
        logger.error("Error while retrieving  Message: ", error);
        return res.status(500).json({ message: error?.message || "Failed to retrive Message", success: false })
    }
}