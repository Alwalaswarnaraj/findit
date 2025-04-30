// controllers/lostItemController.js
import LostItem from '../models/LostItems.js';

// @desc    Create a new lost item
// @route   POST /api/lost
// @access  Public (later can make protected)
export const createLostItem = async (req, res) => {
  try {
    const { title, description, location, dateLost, contactInfo } = req.body;
    const image = req.file?.path;
    const lostItem = new LostItem({
      title,
      description,
      image,
      location,
      dateLost,
      contactInfo,
      user: req.user._id, // if you have authMiddleware later
    });

    const savedItem = await lostItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error creating lost item:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all lost items
// @route   GET /api/lost
// @access  Public
// export const getLostItems = async (req, res) => {
//   try {
//     const lostItems = await LostItem.find().sort({ createdAt: -1 });
//     res.json(lostItems);
//   } catch (error) {
//     console.error('Error fetching lost items:', error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// @desc    Get all lost items (with optional search, location, and pagination)
// @route   GET /api/lost
// @access  Public
export const getLostItems = async (req, res) => {
    try {
      const pageSize = Number(req.query.pageSize) || 10; // items per page
      const page = Number(req.query.pageNumber) || 1; // current page number
  
      const keyword = req.query.keyword
        ? {
            title: { $regex: req.query.keyword, $options: 'i' },
          }
        : {};
  
      const locationFilter = req.query.location
        ? {
            location: { $regex: req.query.location, $options: 'i' },
          }
        : {};
  
      const filter = { ...keyword, ...locationFilter };
  
      const count = await LostItem.countDocuments(filter);
  
      const lostItems = await LostItem.find(filter)
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));
  
      res.json({
        lostItems,
        page,
        pages: Math.ceil(count / pageSize),
        totalItems: count,
      });
    } catch (error) {
      console.error('Error fetching lost items:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  

// @desc    Get a single lost item by ID
// @route   GET /api/lost/:id
// @access  Public
export const getLostItemById = async (req, res) => {
  const { id } = req.params;

  // Check if the provided ID is a valid ObjectId
  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   return res.status(400).json({ message: 'Invalid Item ID format' });
  // }

  try {
    const lostItem = await LostItem.findById(id).populate('user', 'name email'); // Populate user details if needed
    // const lostItem = await LostItem.findById(id); // If you don't need user details

    if (!lostItem) {
      return res.status(404).json({ message: 'Lost Item not found' });
    }

    res.json(lostItem);
  } catch (error) {
    console.error('Error fetching lost item:', error);  
    res.status(500).json({ message: 'Server Error' });
  }
};



// @desc    Update a lost item
// @route   PUT /api/lost/:id
// @access  Private
export const updateLostItem = async (req, res) => {
    try {
      const item = await LostItem.findById(req.params.id);
  
      if (!item) {
        return res.status(404).json({ message: 'Lost item not found' });
      }
  
      // Ownership check
      if (item.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }
  
      // Update fields
      const fields = ['title', 'description', 'image', 'location', 'dateLost', 'contactInfo'];
      fields.forEach(field => {
        if (req.body[field]) item[field] = req.body[field];
      });
  
      const updatedItem = await item.save();
      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating lost item:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // @desc    Delete a lost item
  // @route   DELETE /api/lost/:id
  // @access  Private
  export const deleteLostItem = async (req, res) => {
    try {
      const item = await LostItem.findById(req.params.id);
  
      if (!item) {
        return res.status(404).json({ message: 'Lost item not found' });
      }
  
      // Ownership check
      if (item.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }
  
      await item.deleteOne();
      res.json({ message: 'Lost item deleted' });
    } catch (error) {
      console.error('Error deleting lost item:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

  // @desc    Get lost items created by the logged-in user
// @route   GET /api/lost/mine
// @access  Private
export const getMyLostItems = async (req, res) => {
    try {
      const items = await LostItem.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.json(items);
    } catch (error) {
      console.error('Error fetching user\'s lost items:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
