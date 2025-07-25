import express, { json } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import connectDB from './config/db.js';
import userRouter from './routes/userRoutes.js';
import http from 'http';
import path from 'path';
//import { Server } from 'socket.io';  // Remove this import

import lostItemRouter from './routes/lostItemsRoutes.js';
import foundItemRouter from './routes/foundItemRoutes.js';
import feedRoutes from './routes/feed.js';
import conversationRoutes from './routes/conversationRoutes.js';
import { initializeSocketIO } from './controllers/conversationCon.js'; // Import initializeSocketIO
// import { deleteOldConversations } from './controllers/conversationCon.js'; // Import deleteOldConversations
import deleteUnverifiedUsers from './cronJobs/cleanupUnverifiedUsers.js'; // Import the cron job
import otpvericationRoute from './routes/optverificationRoutes.js';
config();

const app = express();
deleteUnverifiedUsers();

const allowedOrigins=[
    "https://findit-frontend-theta.vercel.app",
    "http://localhost:3000",
];


app.use(cors({
    origin: allowedOrigins,
    credentials : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    preflightContinue: false,
    optionsSuccessStatus: 204 // For legacy browser support
}));
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
// app.use('/api/otp', otpvericationRoute);

// const server = http.createServer(app);

// app.use(express.static(path.join(__dirname, "../client/build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/build/index.html"));
// });

// initializeSocketIO(server);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
//   deleteOldConversations(); // Start deleting old conversations
});