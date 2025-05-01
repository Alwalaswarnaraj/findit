// routes/feed.js
import express from 'express';
import { getRecentLostItems, getRecentFoundItems } from '../controllers/feedController.js';

const feedRoutes = express.Router();

feedRoutes.get('/lost', getRecentLostItems);
feedRoutes.get('/found', getRecentFoundItems);

export default feedRoutes;
