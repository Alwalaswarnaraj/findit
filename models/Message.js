// models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoundItem', // optional: we can also allow chat under a specific found item
  }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

export default Message;
