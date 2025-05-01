import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { Server } from 'socket.io'; // Import Socket.IO Server

let io;

export const initializeSocketIO = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000", // Adjust if needed
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Socket connected", socket.id);

        socket.on("join", (conversationId) => {
            socket.join(conversationId);
            console.log(`User joined room: ${conversationId}`);
        });

        socket.on("sendMessage", async (data) => {
            const { conversationId, message } = data;
            try {
                const newMessage = new Message({
                    conversationId: conversationId,
                    sender: message.sender._id, // Assuming sender has _id
                    text: message.text
                });

                const savedMessage = await newMessage.save();

                // Populate sender details before emitting
                const populatedMessage = await Message.findById(savedMessage._id).populate('sender', 'name');

                io.to(conversationId).emit("receiveMessage", populatedMessage);
            } catch (error) {
                console.error("Error saving and sending message:", error);
            }
        });

        socket.on('typing', (conversationId) => {
            socket.to(conversationId).emit('typing');
        });

        socket.on('stopTyping', (conversationId) => {
            socket.to(conversationId).emit('stopTyping');
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected", socket.id);
        });
    });
};


export const createConversation = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId } = req.body;

        if (!receiverId) {
            return res.status(400).json({ message: 'Receiver ID is required' });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        res.status(201).json(conversation);
    } catch (error) {
        console.error('Conversation error:', error);
        res.status(500).json({ message: 'Server error while starting conversation' });
    }
};

export const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      deleted: false
    }).populate('participants', 'name email').populate({
      path: 'messages',
      options: { sort: { createdAt: -1 }, limit: 1 }
    });
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Conversation error:', error);
    res.status(500).json({ message: 'Server error while getting conversations' });
  }
};


export const sendMessage = async (req, res) => {
    const { conversationId } = req.params;
    const { text } = req.body;

    try {
        const message = new Message({
            conversationId,
            sender: req.user._id, // Use req.user._id after authMiddleware
            text
        });
        await message.save();

        // Populate sender details
        const populatedMessage = await Message.findById(message._id).populate('sender', 'name');

        io.to(conversationId).emit("receiveMessage", populatedMessage);  // Emit to socket

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
      deleted: false, // Filter out deleted messages
    })
      .populate('sender', 'name email');
    res.status(200).json(messages);
  } catch (error) {
    console.error('Conversation error:', error);
    res.status(500).json({ message: 'Server error while getting messages' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    // Only the sender can delete the message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    message.deleted = true;
    await message.save();

    // Emit a socket.io event to notify other clients in the conversation
    io.to(message.conversationId.toString()).emit('messageDeleted', req.params.messageId);

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error while deleting message' });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if the user is a participant
    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    conversation.deleted = true;
    await conversation.save();

    // Optionally, mark all messages in the conversation as deleted
    await Message.updateMany(
      { conversationId: req.params.conversationId },
      { deleted: true }
    );

    res.status(200).json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Server error while deleting conversation' });
  }
};



export const deleteOldConversations = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Find conversations with no messages in the last 30 days
    const oldConversations = await Conversation.find({
      'messages.createdAt': { $lte: thirtyDaysAgo },
      deleted: false
    }).populate('messages');

    for (const conversation of oldConversations) {
      conversation.deleted = true;
      await conversation.save();
      await Message.updateMany(
        { conversationId: conversation._id },
        { deleted: true }
      );
      console.log(`Deleted conversation ${conversation._id}`);
    }
  } catch (error) {
    console.error('Error deleting old conversations:', error);
  }
};

// Run this function every 24 hours (in milliseconds)
setInterval(deleteOldConversations, 24 * 60 * 60 * 1000);