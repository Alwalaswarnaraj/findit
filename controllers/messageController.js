// controllers/messageController.js
import Message from '../models/Message.js';

export const sendMessage = async (req, res) => {
  try {
    const { recipientId, itemId, text } = req.body;

    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      item: itemId,
      text,
    });

    const saved = await message.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ item: req.params.itemId })
      .populate('sender', 'name')
      .populate('recipient', 'name')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};
