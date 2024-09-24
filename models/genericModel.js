import mongoose from "mongoose";
const { Schema } = mongoose;

const genericSchema = new Schema(
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
  },
  { timestamps: true }
);

export const genericModel = mongoose.model("Generic", genericSchema);
