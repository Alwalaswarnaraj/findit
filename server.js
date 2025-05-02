import express, { json } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import connectDB from './config/db.js';
import userRouter from './routes/userRoutes.js';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import lostItemRouter from './routes/lostItemsRoutes.js';
import foundItemRouter from './routes/foundItemRoutes.js';
import feedRoutes from './routes/feed.js';
import conversationRoutes from './routes/conversationRoutes.js';
import { initializeSocketIO } from './controllers/conversationCon.js';

config();

const app = express();

// CORS setup
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://findit-frontend-theta.vercel.app']
    : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(json());

// MongoDB
connectDB(process.env.MONGO_URI);

// API Routes
app.use('/api/users', userRouter);
app.use('/api/found', foundItemRouter);
app.use('/api/lost', lostItemRouter);
app.use('/api/feed', feedRoutes);
app.use('/api/conversations', conversationRoutes);

// Optional health check
app.get('/', (req, res) => {
  res.send('Find It backend running');
});

// Static frontend (if you're hosting frontend with backend — optional)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'))
  );
}

// Create HTTP server and init Socket.IO
const server = http.createServer(app);
initializeSocketIO(server);

// Server Listen
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
