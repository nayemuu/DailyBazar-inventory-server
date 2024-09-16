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
    supplier_address: {
      default: null,
      type: String,
      trim: true,
      maxLength: 500,
    },
    category_of_supplier: {
      default: null,
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
      default: null,
      type: String,
      trim: true,
      maxLength: 100,
    },
    status: {
      default: null,
      type: String,
      trim: true,
      maxLength: 50,
    },
  },
  { timestamps: true }
);

export const supplierModel = mongoose.model("Supplier", supplierSchema);
