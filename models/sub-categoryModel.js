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
      // location is field name, Not Your Schema Name
      type: mongoose.Types.ObjectId,
      ref: "Category", // This Category is reffering your Schema
      required: true,
    },
  },
  { timestamps: true }
);

export const subCategoryModel = mongoose.model(
  "Subcategory",
  subCategorySchema
);
