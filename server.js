import express, { json } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import connectDB from './config/db.js';
import userRouter from './routes/userRoutes.js';
import http from 'http';
//import { Server } from 'socket.io';  // Remove this import

import lostItemRouter from './routes/lostItemsRoutes.js';
import foundItemRouter from './routes/foundItemRoutes.js';
import feedRoutes from './routes/feed.js';
import conversationRoutes from './routes/conversationRoutes.js';
import { initializeSocketIO } from './controllers/conversationCon.js'; // Import initializeSocketIO
// import { deleteOldConversations } from './controllers/conversationCon.js'; // Import deleteOldConversations

config();

const app = express();
app.use(cors());
app.use(json());

app.get('/', (req, res) => {
  res.send('Find It backend running');
});

connectDB(process.env.MONGO_URI);

app.use('/api/users', userRouter);
app.use('/api/found', foundItemRouter);
app.use('/api/lost', lostItemRouter);
app.use('/api/feed', feedRoutes);
app.use('/api/conversations', conversationRoutes);

const server = http.createServer(app);

initializeSocketIO(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
//   deleteOldConversations(); // Start deleting old conversations
});