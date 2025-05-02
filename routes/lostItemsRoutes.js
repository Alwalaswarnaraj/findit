// routes/lostItemRoutes.js
import express from 'express';
import { createLostItem, getLostItems, getLostItemById, updateLostItem, deleteLostItem, getMyLostItems } from '../controllers/lostItemController.js';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/authmiddleware.js';

const lostItemRouter = express.Router();

// Public routes
lostItemRouter.post('/',protect, upload.single('image'), createLostItem);       // POST a new lost item (can be protected later)
lostItemRouter.get('/', getLostItems);          // GET all lost items
lostItemRouter.get('/mine',protect, getMyLostItems);
lostItemRouter.get('/:id', getLostItemById);    // GET one lost item by ID
lostItemRouter.put('/:id', updateLostItem);     // PUT to update the lost item
lostItemRouter.delete('/:id',protect, deleteLostItem);  // DELETE the item

export default lostItemRouter;
