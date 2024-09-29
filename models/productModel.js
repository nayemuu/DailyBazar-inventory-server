import mongoose from "mongoose";
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    product_name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 400,
      unique: true,
    },
    generic: {
      type: mongoose.Types.ObjectId,
      ref: "Generic", // This Generic is reffering your Generic model name which you passed in mongoose.model() method
      default: null,
    },
    sub_catagory_1: {
      type: mongoose.Types.ObjectId,
      ref: "Subcategory", // This Subcategory is reffering your Subcategory model name which you passed in mongoose.model() method
      unique: true,
    },
    sub_catagory_2: {
      type: mongoose.Types.ObjectId,
      ref: "Subcategory", // This Subcategory is reffering your Subcategory model name which you passed in mongoose.model() method
      default: null,
    },
    sub_catagory_3: {
      type: mongoose.Types.ObjectId,
      ref: "Subcategory", // This Subcategory is reffering your Subcategory model name which you passed in mongoose.model() method
      default: null,
    },
    unit_size: {
      type: String,
      trim: true,
      required: true,
      maxLength: 100,
    },
    pack_size: {
      type: String,
      trim: true,
      required: true,
      maxLength: 100,
      default: "1",
    },
    supplier: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Supplier", // This Supplier is reffering your Supplier model name which you passed in mongoose.model() method
    },

    barcode: {
      type: String,
      trim: true,
      required: true,
      maxLength: 40,
      unique: true,
    },

    barcode_type: {
      type: String,
      default: "manual",
      enum: ["auto generate", "manual"],
    },

    barcode_image: {
      type: String,
      default: null,
    },

    product_image: {
      type: String,
      default: null,
    },
    product_image_alt: {
      type: String,
      default: null,
    },
    warehouse_stock: {
      type: Number,
      default: 0,
    },
    retail_stock: {
      type: Number,
      default: 0,
    },
    sale_price: {
      type: Number,
    },
    new_sale_price: {
      type: Number,
    },
    sale_vat: {
      type: Number,
    },
    purchase_price: {
      type: Number,
    },
    new_purchase_price: {
      type: Number,
    },
    purchase_vat: {
      type: Number,
    },
    product_type: {
      type: String,
      default: "Local",
      enum: ["Local", "Foreign"],
    },
    brand: {
      type: mongoose.Types.ObjectId,
      ref: "Brand", // This Brand is reffering your Brand model name which you passed in mongoose.model() method
    },
    discount: {
      type: Number,
    },
    profit: {
      type: Number,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 1000,
    },
    seo_discription: {
      type: String,
      trim: true,
      maxLength: 1000,
    },
    meta_discription: {
      type: String,
      trim: true,
      maxLength: 1000,
    },
    meta_tags: {
      type: String,
      trim: true,
      maxLength: 1000,
    },
    status: {
      type: String,
      default: "In Active",
      enum: ["Active", "In Active"],
    },
    require_prescription: {
      type: String,
      default: "No",
      enum: ["Yes", "No"],
    },
  },
  { timestamps: true }
);

export const productModel = mongoose.model("Product", productSchema);
