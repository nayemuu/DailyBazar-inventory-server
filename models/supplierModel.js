import mongoose from "mongoose";
const { Schema } = mongoose;

const supplierSchema = new Schema(
  {
    supplier_name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 300,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    }, // supplier_name
    supplier_address: {
      default: null,
      type: String,
      trim: true,
      maxLength: 500,
    },
    category_of_supplier: {
      required: true,
      type: String,
      trim: true,
      maxLength: 200,
    },
    contact_number: {
      default: null,
      type: String,
      trim: true,
      maxLength: 100,
    },
    email_address: {
      default: null,
      type: String,
      trim: true,
      maxLength: 200,
    },
    contact_person: {
      default: null,
      type: String,
      trim: true,
      maxLength: 200,
    },
    supplier_product_category: {
      required: true,
      type: String,
      trim: true,
      maxLength: 100,
    },
    status: {
      required: true,
      type: String,
      trim: true,
      maxLength: 50,
    },
  },
  { timestamps: true }
);

export const supplierModel = mongoose.model("Supplier", supplierSchema);
