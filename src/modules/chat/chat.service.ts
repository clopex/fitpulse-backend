import { sequelize } from '../../config/db';
import { QueryTypes } from 'sequelize';

export const getConversations = async (userId: string) => {
  const result = await sequelize.query(
    `SELECT DISTINCT ON (other_user.id)
            other_user.id, other_user.name, other_user.avatar_url,
            m.content as last_message, m.created_at as last_message_at,
            (SELECT COUNT(*) FROM chat_messages cm
             WHERE cm.sender_id = other_user.id
             AND cm.receiver_id = $1
             AND cm.is_read = false) as unread_count
     FROM chat_messages m
     JOIN users other_user ON other_user.id = CASE
       WHEN m.sender_id = $1 THEN m.receiver_id
       ELSE m.sender_id
     END
     WHERE m.sender_id = $1 OR m.receiver_id = $1
     ORDER BY other_user.id, m.created_at DESC`,
    { bind: [userId], type: QueryTypes.SELECT }
  );

  return result;
};

export const getMessages = async (userId: string, otherUserId: string, page = 1, limit = 50) => {
  const offset = (page - 1) * limit;

  const messages = await sequelize.query(
    `SELECT m.id, m.content, m.is_read, m.created_at,
            m.sender_id, u.name as sender_name, u.avatar_url as sender_avatar
     FROM chat_messages m
     JOIN users u ON u.id = m.sender_id
     WHERE (m.sender_id = $1 AND m.receiver_id = $2)
        OR (m.sender_id = $2 AND m.receiver_id = $1)
     ORDER BY m.created_at DESC
     LIMIT $3 OFFSET $4`,
    { bind: [userId, otherUserId, limit, offset], type: QueryTypes.SELECT }
  );

  // Oznaci kao procitano
  await sequelize.query(
    `UPDATE chat_messages SET is_read = true
     WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false`,
    { bind: [otherUserId, userId], type: QueryTypes.SELECT }
  );

  return messages;
};

export const sendMessage = async (senderId: string, receiverId: string, content: string) => {
  // Provjeri da receiver postoji
  const user = await sequelize.query(
    'SELECT id FROM users WHERE id = $1',
    { bind: [receiverId], type: QueryTypes.SELECT }
  ) as any[];

  if (!user[0]) throw new Error('Receiver not found');

  const result = await sequelize.query(
    `INSERT INTO chat_messages (sender_id, receiver_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    { bind: [senderId, receiverId, content], type: QueryTypes.SELECT }
  ) as any[];

  return result[0];
};

export const markMessagesAsRead = async (senderId: string, receiverId: string) => {
  await sequelize.query(
    `UPDATE chat_messages SET is_read = true
     WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false`,
    { bind: [senderId, receiverId], type: QueryTypes.SELECT }
  );
};

export const deleteMessage = async (id: string, userId: string) => {
  const result = await sequelize.query(
    'DELETE FROM chat_messages WHERE id = $1 AND sender_id = $2 RETURNING id',
    { bind: [id, userId], type: QueryTypes.SELECT }
  ) as any[];

  if (!result[0]) throw new Error('Message not found');
};