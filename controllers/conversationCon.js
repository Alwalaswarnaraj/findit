import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export const createConversation = async (req, res) => {
  const { recipientId } = req.body;

  try {
    const exists = await Conversation.findOne({
      participants: { $all: [req.userId, recipientId] }
    });

    if (exists) return res.status(200).json(exists);

    const newConv = new Conversation({
      participants: [req.userId, recipientId]
    });
    await newConv.save();
    res.status(201).json(newConv);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId
    }).populate('participants', 'name email');
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { text } = req.body;

  try {
    const message = new Message({
      conversationId,
      sender: req.userId,
      text
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('sender', 'name email');
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
