import mongoose from "mongoose";
const { Schema } = mongoose;

const brandSchema = new Schema(
  {
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
      default: null,
    },
  },
  { timestamps: true }
);

export const brandModel = mongoose.model("Brand", brandSchema);
