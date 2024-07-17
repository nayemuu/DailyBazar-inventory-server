import mongoose from 'mongoose';
const { Schema } = mongoose;

const imageSchema = new Schema({
  secure_url: {
    type: String,
    trim: true,
    required: true,
  },
  public_id: {
    type: String,
    trim: true,
    required: true,
  },
});

export const imageModel = mongoose.model('Image', imageSchema);
