// routes/lostItemRoutes.js
import express from 'express';
import { createLostItem, getLostItems, getLostItemById, updateLostItem, deleteLostItem, getMyLostItems } from '../controllers/lostItemController.js';
import upload from '../middleware/upload.js';
// import authMiddleware from '../middlewares/authMiddleware.js' (later if you want to protect create)

const lostItemRouter = express.Router();

// Public routes
lostItemRouter.get('/', getLostItems);          // GET all lost items
lostItemRouter.get('/:id', getLostItemById);    // GET one lost item by ID
lostItemRouter.post('/', upload.single('image'), createLostItem);       // POST a new lost item (can be protected later)
lostItemRouter.put('/:id', updateLostItem);     // PUT to update the lost item
lostItemRouter.delete('/:id', deleteLostItem);  // DELETE the item
lostItemRouter.get('/mine', getMyLostItems);

export default lostItemRouter;
