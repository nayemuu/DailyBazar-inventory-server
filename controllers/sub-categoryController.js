import slugify from "slugify";
import { deleteImage, uploadImage } from "../utils/image.js";
import { replaceMongoIdInArray } from "../utils/mongoDB.js";
import { removeLocalFile } from "../utils/fs-utils.js";
import { categoryModel } from "../models/categoryModel.js";
import { subCategoryModel } from "../models/sub-categoryModel.js";

export const create = async (req, res) => {
  const { name, categoryId } = req.body;

  // Validate input fields
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }

  if (!categoryId) {
    return res.status(400).json({ message: "Category ID is required" });
  }

  if (!/^[0-9a-fA-F]{24}$/.test(categoryId)) {
    return res.status(400).json({ message: "Invalid Category ID" });
  }

  try {
    // Check if the Category exists

    const existingCategory = await categoryModel.findById(categoryId);
    if (!existingCategory) {
      return res.status(400).json({
        message: "Category does not exist",
      });
    }

    // Check if the Category already exists
    const existingSubCategory = await subCategoryModel.findOne({
      slug: slugify(name.trim()),
    });

    if (existingSubCategory) {
      return res.status(400).json({
        message: "A Sub Category with this name already exists",
      });
    }

    // Handle image upload if a file is provided
    let imageUrl = null;
    if (req.file?.path) {
      try {
        const image = await uploadImage(req.file.path);
        imageUrl = image.secure_url;
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    // Create the category
    await subCategoryModel.create({
      name: name.trim(),
      slug: slugify(name.trim()),
      icon: imageUrl,
      category_id: categoryId,
    });

    return res
      .status(201)
      .json({ message: "Sub Category created successfully" });
  } catch (error) {
    console.error("Error creating Sub Category:", error);
    return res.status(500).json({ message: "Server error occurred" });
  } finally {
    // Ensure local file is removed if it exists
    if (req.file?.path) {
      removeLocalFile(req.file.path);
    }
  }
};

export const list = async (req, res) => {
  // console.log("req.query = ", req.query);

  // Destructure query parameters with default values
  let { limit = 10, offset = 0, keyword = "" } = req.query;

  // Convert limit and offset to numbers
  limit = parseInt(limit);
  offset = parseInt(offset);
  keyword = keyword.trim(); // Trim keyword to remove extra spaces

  // Validate limit and offset
  if (isNaN(limit) || isNaN(offset) || limit < 0 || offset < 0) {
    return res.status(400).json({ error: "Invalid limit or offset value" });
  }

  // Initialize query object
  let query = {};

  if (keyword) {
    const keywordRegex = new RegExp(keyword, "i");

    query.$or = [{ name: { $regex: keywordRegex } }];

    // Check if keyword is a valid ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(keyword)) {
      query.$or.push({ _id: keyword });
    }
  }

  try {
    // Get the total count of documents
    const count = await subCategoryModel.countDocuments(query);

    // Get the paginated and sorted data

    const dataFromMongodb = await subCategoryModel
      .find(query)
      .select(["name", "icon"])
      .populate("category_id", "name")
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .limit(limit)
      .skip(offset)
      .lean();

    // console.log("dataFromMongodb = ", dataFromMongodb);

    res.status(200).json({
      results: replaceMongoIdInArray(dataFromMongodb),
      limit,
      offset,
      count,
    });
  } catch (error) {
    console.log("error = ", error);
    if (error?.messag) {
      res.status(500).json(error.message);
    } else {
      console.error("Error listing Sub Category:", error);
      return res.status(500).json({ message: "Server error occurred" });
    }
  }
};

export const remove = async (req, res) => {
  try {
    const subCategoryId = req.params.id;

    // Validate location ID
    if (!/^[0-9a-fA-F]{24}$/.test(subCategoryId)) {
      return res.status(400).json({ message: "Invalid Sub Category ID" });
    }

    // Find and delete the location by ID
    const deletedSubCategory = await subCategoryModel.findByIdAndDelete(
      subCategoryId
    );

    if (!deletedSubCategory) {
      return res
        .status(400)
        .json({ message: "No Sub Category found with the provided ID" });
    }

    // If the location has an associated icon, delete it
    if (deletedSubCategory.icon) {
      deleteImage(deletedSubCategory.icon);
    }

    return res
      .status(200)
      .json({ message: "Sub Category  deleted successfully" });
  } catch (error) {
    console.error("Error deleting Sub Category :", error);
    return res.status(500).json({ message: "Server error occurred" });
  }
};

export const update = async (req, res) => {
  const subCategoryId = req.params.id;
  const { name, categoryId } = req.body;

  // Validate input fields
  if (!name && !categoryId && !req.file) {
    return res.status(400).json({ message: "No fields to update" });
  }

  // Validate sub-category ID
  if (!/^[0-9a-fA-F]{24}$/.test(subCategoryId)) {
    return res.status(400).json({ message: "Invalid Sub Category ID" });
  }

  try {
    // Find the existing sub-category
    const subCategory = await subCategoryModel.findById(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: "Sub Category not found" });
    }

    // Check if the new category exists
    if (categoryId) {
      const existingCategory = await categoryModel.findById(categoryId);
      if (!existingCategory) {
        return res.status(400).json({ message: "Category does not exist" });
      }
    }

    // Check for a new name and ensure it's unique
    if (name) {
      const existingSubCategory = await subCategoryModel.findOne({
        slug: slugify(name.trim()),
        _id: { $ne: subCategoryId },
      });

      if (existingSubCategory) {
        return res
          .status(400)
          .json({ message: "A Sub Category with this name already exists" });
      }
    }

    let imageUrl = null;

    // Handle image upload if a file is provided
    if (req.file?.path) {
      try {
        const image = await uploadImage(req.file.path);
        imageUrl = image.secure_url;
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    // Update the sub-category
    await subCategoryModel.findByIdAndUpdate(subCategoryId, {
      name: name ? name.trim() : subCategory.name,
      slug: name ? slugify(name.trim()) : subCategory.slug,
      icon: imageUrl || subCategory.icon,
      category: categoryId || subCategory.category,
    });

    // Successfully updated
    return res
      .status(200)
      .json({ message: "Sub Category updated successfully" });
  } catch (error) {
    console.error("Error updating Sub Category:", error);
    return res.status(500).json({ message: "Server error occurred" });
  } finally {
    // Ensure local file is removed if it exists
    if (req.file?.path) {
      removeLocalFile(req.file.path);
    }
  }
};
