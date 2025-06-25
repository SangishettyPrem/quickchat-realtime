import Sequelize from 'sequelize';
import ConversationModel from './Conversation.model.js';
import MessageModel from './Messages.model.js';
import UserModel from './UserModel.js';

const sequelize = new Sequelize('your_db', 'username', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

// Initialize models
const User = UserModel(sequelize);
const Conversation = ConversationModel(sequelize);
const Message = MessageModel(sequelize);

// Associations
Conversation.belongsTo(User, { foreignKey: 'user1_id', as: 'User1' });
Conversation.belongsTo(User, { foreignKey: 'user2_id', as: 'User2' });

Message.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });

Conversation.hasMany(Message, { foreignKey: 'conversation_id' });

export {
    sequelize,
    User,
    Conversation,
    Message
};
