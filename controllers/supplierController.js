import slugify from "slugify";
import { supplierModel } from "../models/supplierModel.js";
import { replaceMongoIdInArray } from "../utils/mongoDB.js";

export const create = async (req, res) => {
  const {
    supplier_name,
    category_of_supplier,
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

  try {
    // Check if the supplier already exists
    const existingSupplier = await supplierModel.findOne({
      slug: slugify(supplier_name.trim()),
    });
    if (existingSupplier) {
      return res
        .status(400)
        .json({ message: "Supplier with this name already exists" });
    }

    // Create the supplier
    const newSupplier = await supplierModel.create({
      supplier_name: supplier_name.trim(),
      slug: slugify(supplier_name.trim()),
      category_of_supplier: category_of_supplier.trim(),
      supplier_product_category: supplier_product_category.trim(),
      status: status.trim(),
      supplier_address: req.body.supplier_address
        ? req.body.supplier_address.trim()
        : null,
      contact_number: req.body.contact_number
        ? req.body.contact_number.trim()
        : null,
      email_address: req.body.email_address
        ? req.body.email_address.trim()
        : null,
      contact_person: req.body.contact_person
        ? req.body.contact_person.trim()
        : null,
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

export const list = async (req, res) => {
  let { limit = 10, offset = 0, keyword = "" } = req.query;

  limit = parseInt(limit);
  offset = parseInt(offset);
  keyword = keyword.trim();

  if (isNaN(limit) || isNaN(offset) || limit < 0 || offset < 0) {
    return res.status(400).json({ error: "Invalid limit or offset value" });
  }

  let query = {};
  if (keyword) {
    const keywordRegex = new RegExp(keyword, "i");
    query.$or = [
      { supplier_name: { $regex: keywordRegex } },
      { slug: { $regex: keywordRegex } },
    ];
  }

  try {
    const count = await supplierModel.countDocuments(query);
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

export const singleData = async (req, res) => {
  const supplierId = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(supplierId)) {
    return res.status(400).json({ message: "Invalid supplier ID" });
  }

  try {
    let data = await supplierModel.findById(supplierId);
    console.log("data = ", data);
    if (data) {
      return res.status(200).json({ data: data });
    }
    return res
      .status(400)
      .json({ message: "No supplier found with the provided ID" });
  } catch (error) {
    console.error("Error getting single supplier data:", error);
    return res.status(500).json({ message: "Server error occurred" });
  }
};

export const remove = async (req, res) => {
  const supplierId = req.params.id;

  if (!/^[0-9a-fA-F]{24}$/.test(supplierId)) {
    return res.status(400).json({ message: "Invalid supplier ID" });
  }

  try {
    const deletedSupplier = await supplierModel.findByIdAndDelete(supplierId);

    if (!deletedSupplier) {
      return res
        .status(404)
        .json({ message: "No supplier found with the provided ID" });
    }

    return res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return res.status(500).json({ message: "Server error occurred" });
  }
};

export const update = async (req, res) => {
  const supplierId = req.params.id;
  const {
    supplier_name,
    category_of_supplier,
    supplier_product_category,
    status,
  } = req.body;

  if (!/^[0-9a-fA-F]{24}$/.test(supplierId)) {
    return res.status(400).json({ message: "Invalid supplier ID" });
  }

  try {
    const existingSupplier = await supplierModel.findById(supplierId);
    if (!existingSupplier) {
      return res
        .status(404)
        .json({ message: "No supplier found with the provided ID" });
    }

    // Check if a new name is provided and ensure it's unique
    if (supplier_name) {
      const existingBySlug = await supplierModel.findOne({
        slug: slugify(supplier_name.trim()),
        _id: { $ne: supplierId },
      });
      if (existingBySlug) {
        return res
          .status(400)
          .json({ message: "A supplier with this name already exists" });
      }
    }

    // Update the supplier
    await supplierModel.findByIdAndUpdate(supplierId, {
      supplier_name: supplier_name
        ? supplier_name.trim()
        : existingSupplier.supplier_name,
      slug: supplier_name
        ? slugify(supplier_name.trim())
        : existingSupplier.slug,
      category_of_supplier: category_of_supplier
        ? category_of_supplier.trim()
        : existingSupplier.category_of_supplier,
      supplier_product_category: supplier_product_category
        ? supplier_product_category.trim()
        : existingSupplier.supplier_product_category,
      status: status ? status.trim() : existingSupplier.status,
      supplier_address: req.body.supplier_address
        ? req.body.supplier_address.trim()
        : existingSupplier.supplier_address,
      contact_number: req.body.contact_number
        ? req.body.contact_number.trim()
        : existingSupplier.contact_number,
      email_address: req.body.email_address
        ? req.body.email_address.trim()
        : existingSupplier.email_address,
      contact_person: req.body.contact_person
        ? req.body.contact_person.trim()
        : existingSupplier.contact_person,
    });

    return res.status(200).json({ message: "Supplier updated successfully" });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return res.status(500).json({ message: "Server error occurred" });
  }
};
