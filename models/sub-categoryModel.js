import mongoose from "mongoose";
const { Schema } = mongoose;

const subCategorySchema = new Schema(
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
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category", // This Category is reffering your Category model name which you passed in mongoose.model() method
      required: true,
    },
  },
  { timestamps: true }
);

export const subCategoryModel = mongoose.model(
  "Subcategory",
  subCategorySchema
);
