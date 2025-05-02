// // routes/foundItemRoutes.js
import express from 'express';
import { createFoundItem, getFoundItemById, getFoundItems, updateFoundItem, deleteFoundItem, getMyFoundItems} from '../controllers/foundItemController.js'
import upload from '../middleware/upload.js';
import { protect } from '../middleware/authmiddleware.js'; // we'll create this middleware next


const foundItemRouter = express.Router();

// // Public routes
foundItemRouter.route('/').get(getFoundItems);     // GET all found items
foundItemRouter.post('/', protect, upload.single('image'), createFoundItem);       // POST a new found item
foundItemRouter.get('/mine',protect, getMyFoundItems);
foundItemRouter.get('/:id', getFoundItemById);    // GET one found item by ID
foundItemRouter.put('/:id', updateFoundItem);     // PUT to update the item
foundItemRouter.delete('/:id', protect, deleteFoundItem);  // DELETE to delete the item

export default foundItemRouter;