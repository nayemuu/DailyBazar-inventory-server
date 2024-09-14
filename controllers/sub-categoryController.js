import slugify from "slugify";
import { deleteImage, uploadImage } from "../utils/image.js";
import { replaceMongoIdInArray } from "../utils/mongoDB.js";
import { removeLocalFile } from "../utils/fs-utils.js";
import { categoryModel } from "../models/categoryModel.js";
import { subCategoryModel } from "../models/sub-categoryModel.js";

export const create = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    // Validate input fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

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
      category: categoryId,
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
      .populate("category", "name")
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
  const categoryId = req.params.id;
  const { name, locationId } = req.body;
  // console.log("req.body = ", req.body);
  // console.log("req.file = ", req.file);

  try {
    // Validate category ID
    if (!/^[0-9a-fA-F]{24}$/.test(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Find the existing category by ID
    const existingCategory = await categoryModel.findById(categoryId);
    if (!existingCategory) {
      return res
        .status(404)
        .json({ message: "No category found with the provided ID" });
    }

    // Check if the location exists if provided
    if (locationId) {
      const existingLocation = await locationModel.findById(locationId);
      if (!existingLocation) {
        return res.status(400).json({ message: "Location does not exist" });
      }
      existingCategory.location = locationId;
    }

    // Update the name if provided
    if (name && name.trim()) {
      const isNameTaken = await categoryModel.findOne({
        slug: slugify(name.trim()),
        _id: { $ne: categoryId }, // Ensure we are not finding the current category
      });

      if (isNameTaken) {
        return res
          .status(400)
          .json({ message: "Category with this name already exists" });
      }

      existingCategory.name = name.trim();
      existingCategory.slug = slugify(name.trim());
    }

    // Handle image update if a new file is provided
    if (req?.file?.path) {
      // Delete the old image if it exists
      if (existingCategory.icon) {
        deleteImage(existingCategory.icon);
      }

      const image = await uploadImage(req.file.path);
      existingCategory.icon = image.secure_url;
    }

    // Save the updated category
    await existingCategory.save();

    return res.status(200).json({
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ message: "Server error occurred" });
  } finally {
    // Remove the uploaded file from local storage if any
    if (req?.file?.path) {
      removeLocalFile(req.file.path);
    }
  }
};
