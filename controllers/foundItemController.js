// controllers/foundItemController.js
import FoundItem from '../models/FoundItem.js';

// @desc Create a new found item
// @route POST /api/found
// @access Public
export const createFoundItem = async (req, res) => {
  try {
    const { title, description, location, dateFound, contactInfo } = req.body;

    const image = req.file?.path || null;

    const foundItem = new FoundItem({
      title,
      description,
      image,
      location,
      dateFound,
      contactInfo,
      user: req.user._id  , // or 'user' depending on your schema
    });

    const savedItem = await foundItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error creating found item:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc Get all found items
// @route GET /api/found
// @access Public
// export const getFoundItems = async (req, res) => {
//   try {
//     const foundItems = await FoundItem.find().sort({ createdAt: -1 });
//     res.json(foundItems);
//   } catch (error) {
//     console.error('Error fetching found items:', error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// @desc    Get all found items (with optional search, location, and pagination)
// @route   GET /api/found
// @access  Public
export const getFoundItems = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;

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

    const count = await FoundItem.countDocuments(filter);

    const foundItems = await FoundItem.find(filter)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      foundItems,
      page,
      pages: Math.ceil(count / pageSize),
      totalItems: count,
    });
  } catch (error) {
    console.error('Error fetching found items:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};



// @desc Get a single found item by ID
// @route GET /api/found/:id
// @access Public
export const getFoundItemById = async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id);

    if (!foundItem) {
      return res.status(404).json({ message: 'Found Item not found' });
    }

    res.json(foundItem);
  } catch (error) {
    console.error('Error fetching found item:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Update a found item
// @route   PUT /api/found/:id
// @access  Private
export const updateFoundItem = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Found item not found' });
    }

    // Ownership check
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update fields
    const fields = ['title', 'description', 'image', 'location', 'dateFound', 'contactInfo'];
    fields.forEach(field => {
      if (req.body[field]) item[field] = req.body[field];
    });

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating found item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a found item
// @route   DELETE /api/found/:id
// @access  Private
export const deleteFoundItem = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Found item not found' });
    }

    // Ownership check
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await item.deleteOne();
    res.json({ message: 'Found item deleted' });
  } catch (error) {
    console.error('Error deleting found item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Get found items created by the logged-in user
// @route   GET /api/found/mine
// @access  Private
export const getMyFoundItems = async (req, res) => {
  try {
    const items = await FoundItem.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching user\'s found items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
