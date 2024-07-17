import mongoose from 'mongoose';
const { Schema } = mongoose;

const locationSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    maxLength: 50,
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  icon: {
    type: String,
  },
  slug: {
    type: String,
    lowercase: true,
  },
});

export const locationModel = mongoose.model('Location', locationSchema);
