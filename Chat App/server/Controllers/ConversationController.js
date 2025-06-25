import sequelize from "../config/dbConnection.js";
import logger from "../utils/logger.js";

export const getOrCreateConversation = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        const { userId, selectedUserId } = req.body;
        const conversation = await sequelize.query(`
            SELECT * FROM conversations
            WHERE (user1_id = LEAST(:userId, :selectedUserId) AND user2_id = GREATEST(:userId, :selectedUserId))
            `, {
            replacements: { userId, selectedUserId },
            type: sequelize.QueryTypes.SELECT,
            transaction
        });
        if (conversation?.length > 0) {
            await transaction.commit();
            return res.status(200).json({ conversationId: conversation[0].id, success: true });
        }
        const result = await sequelize.query(`
            INSERT INTO conversations (user1_id, user2_id)
            VALUES (LEAST(:userId, :selectedUserId), GREATEST(:userId, :selectedUserId))
            `, {
            replacements: { userId, selectedUserId },
            type: sequelize.QueryTypes.INSERT,
            transaction
        });
        await transaction.commit();
        return res.status(200).json({ conversationId: result[0], success: true });
    } catch (error) {
        await transaction.rollback();
        logger.error("Error while Creating Conversation: ", error);
        return res.status(500).json({ message: error?.message || "Error while Conversation", success: false })
    }
}
