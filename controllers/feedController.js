import LostItem from '../models/LostItems.js';
import FoundItem from '../models/FoundItem.js';

export const getRecentLostItems = async (req, res) => {
  try {
    const items = await LostItem.find()
      .sort({ createdAt: -1 }) // Newest first
      .limit(10) // Adjust as needed
      .populate('user', 'name');

    res.json(items);
  } catch (error) {
    console.error('Error fetching lost items:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getRecentFoundItems = async (req, res) => {
  try {
    const items = await FoundItem.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name');

    res.json(items);
  } catch (error) {
    console.error('Error fetching found items:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
