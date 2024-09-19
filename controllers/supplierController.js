import slugify from "slugify";
import { supplierModel } from "../models/supplierModel.js";
import { replaceMongoIdInArray } from "../utils/mongoDB.js";

export const createSupplier = async (req, res) => {
  try {
    const {
      supplier_name,
      supplier_address,
      category_of_supplier,
      contact_number,
      email_address,
      contact_person,
      supplier_product_category,
      status,
    } = req.body;

    // Validate required fields
    if (!supplier_name || !supplier_name.trim()) {
      return res.status(400).json({ message: "Supplier name is required" });
    }
    if (!category_of_supplier || !category_of_supplier.trim()) {
      return res
        .status(400)
        .json({ message: "Category of supplier is required" });
    }
    if (!supplier_product_category || !supplier_product_category.trim()) {
      return res
        .status(400)
        .json({ message: "Supplier product category is required" });
    }
    if (!status || !status.trim()) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Create the slug
    const slug = slugify(supplier_name.trim());

    // Check if the supplier already exists by slug
    const existingSupplier = await supplierModel.findOne({ slug });
    if (existingSupplier) {
      return res
        .status(400)
        .json({ message: "Supplier with this name already exists" });
    }

    // Create the supplier
    const newSupplier = await supplierModel.create({
      supplier_name: supplier_name.trim(),
      slug,
      supplier_address,
      category_of_supplier,
      contact_number,
      email_address,
      contact_person,
      supplier_product_category,
      status,
    });

    return res.status(201).json({
      message: "Supplier created successfully",
      supplier: newSupplier,
    });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return res.status(500).json({ message: "Server error occurred" });
  }
};

export const listSuppliers = async (req, res) => {
  try {
    let { limit = 10, offset = 0, keyword = "" } = req.query;

    // Convert limit and offset to numbers
    limit = parseInt(limit);
    offset = parseInt(offset);
    keyword = keyword.trim();

    // Validate limit and offset
    if (isNaN(limit) || isNaN(offset) || limit < 0 || offset < 0) {
      return res.status(400).json({ error: "Invalid limit or offset value" });
    }

    // Initialize query object
    let query = {};

    if (keyword) {
      const keywordRegex = new RegExp(keyword, "i");
      query.$or = [{ supplier_name: { $regex: keywordRegex } }];
    }

    // Get the total count of documents
    const count = await supplierModel.countDocuments(query);

    // Get the paginated and sorted data
    const suppliers = await supplierModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    res.status(200).json({
      results: replaceMongoIdInArray(suppliers),
      limit,
      offset,
      count,
    });
  } catch (error) {
    console.error("Error listing suppliers:", error);
    return res.status(500).json({ message: "Server error occurred" });
  }
};

export const updateSupplier = async (req, res) => {
  const supplierId = req.params.id;
  const {
    supplier_name,
    supplier_address,
    category_of_supplier,
    contact_number,
    email_address,
    contact_person,
    supplier_product_category,
    status,
  } = req.body;

  // Validate supplier ID
  if (!/^[0-9a-fA-F]{24}$/.test(supplierId)) {
    return res.status(400).json({ message: "Invalid supplier ID" });
  }

  // Check if the supplier exists
  const existingSupplier = await supplierModel.findById(supplierId);
  if (!existingSupplier) {
    return res
      .status(404)
      .json({ message: "No supplier found with the provided ID" });
  }

  // Validate required fields
  if (supplier_name && !supplier_name.trim()) {
    return res.status(400).json({ message: "Supplier name cannot be empty" });
  }
  if (category_of_supplier && !category_of_supplier.trim()) {
    return res
      .status(400)
      .json({ message: "Category of supplier cannot be empty" });
  }
  if (supplier_product_category && !supplier_product_category.trim()) {
    return res
      .status(400)
      .json({ message: "Supplier product category cannot be empty" });
  }
  if (status && !status.trim()) {
    return res.status(400).json({ message: "Status cannot be empty" });
  }

  // Update the supplier document
  const updatedSupplier = await supplierModel.findByIdAndUpdate(
    supplierId,
    {
      supplier_name: supplier_name
        ? supplier_name.trim()
        : existingSupplier.supplier_name,
      slug: supplier_name
        ? slugify(supplier_name.trim())
        : existingSupplier.slug,
      supplier_address:
        supplier_address !== undefined
          ? supplier_address
          : existingSupplier.supplier_address,
      category_of_supplier: category_of_supplier
        ? category_of_supplier.trim()
        : existingSupplier.category_of_supplier,
      contact_number:
        contact_number !== undefined
          ? contact_number
          : existingSupplier.contact_number,
      email_address:
        email_address !== undefined
          ? email_address
          : existingSupplier.email_address,
      contact_person:
        contact_person !== undefined
          ? contact_person
          : existingSupplier.contact_person,
      supplier_product_category: supplier_product_category
        ? supplier_product_category.trim()
        : existingSupplier.supplier_product_category,
      status: status ? status.trim() : existingSupplier.status,
    },
    { new: true }
  ); // Return the updated document

  return res.status(200).json({
    message: "Supplier updated successfully",
    supplier: updatedSupplier,
  });
};

export const removeSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;

    // Validate supplier ID
    if (!/^[0-9a-fA-F]{24}$/.test(supplierId)) {
      return res.status(400).json({ message: "Invalid supplier ID" });
    }

    // Find and delete the supplier by ID
    const deletedSupplier = await supplierModel.findByIdAndDelete(supplierId);

    if (!deletedSupplier) {
      return res
        .status(400)
        .json({ message: "No supplier found with the provided ID" });
    }

    return res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return res.status(500).json({ message: "Server error occurred" });
  }
};
