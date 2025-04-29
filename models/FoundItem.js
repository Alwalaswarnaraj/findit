// models/FoundItem.js
import mongoose from "mongoose";

const foundItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String, // URL to the uploaded image (Cloudinary)
    },
    location: {
      type: String,
      required: true,
    },
    dateFound: {
      type: Date,
      required: true,
    },
    contactInfo: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const FoundItem = mongoose.model("FoundItem", foundItemSchema);

export default FoundItem;