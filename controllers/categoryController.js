import slugify from "slugify";
import { deleteImage, uploadImage } from "../utils/image.js";
import { replaceMongoIdInArray } from "../utils/mongoDB.js";
import { removeLocalFile } from "../utils/fs-utils.js";
import { categoryModel } from "../models/categoryModel.js";
import { locationModel } from "../models/locationModel.js";

export const create = async (req, res) => {
  try {
    const { name, locationId } = req.body;

    // Validate input fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!locationId) {
      return res.status(400).json({ message: "Location ID is required" });
    }

    if (!/^[0-9a-fA-F]{24}$/.test(locationId)) {
      return res.status(400).json({ message: "Invalid Location ID" });
    }

    // Check if the location exists
    const existingLocation = await locationModel.findById(locationId);
    if (!existingLocation) {
      return res.status(400).json({
        message: "Location does not exist",
      });
    }

    // Check if the Category already exists
    const existingCategory = await categoryModel.findOne({
      slug: slugify(name.trim()),
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "A category with this name already exists",
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
    await categoryModel.create({
      name: name.trim(),
      slug: slugify(name.trim()),
      icon: imageUrl,
      location: locationId,
    });

    return res.status(201).json({ message: "Category created successfully" });
  } catch (error) {
    console.error("Error creating category:", error);
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
    const count = await categoryModel.countDocuments(query);

    // Get the paginated and sorted data

    const dataFromMongodb = await categoryModel
      .find(query)
      .select(["name", "icon"])
      .populate("location", "name")
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
      console.error("Error listing locations:", error);
      return res.status(500).json({ message: "Server error occurred" });
    }
  }
};

export const remove = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Validate location ID
    if (!/^[0-9a-fA-F]{24}$/.test(categoryId)) {
      return res.status(400).json({ message: "Invalid Category ID" });
    }

    // Find and delete the location by ID
    const deletedCategory = await categoryModel.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res
        .status(400)
        .json({ message: "No category found with the provided ID" });
    }

    // If the location has an associated icon, delete it
    if (deletedCategory.icon) {
      deleteImage(deletedCategory.icon);
    }

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting Category:", error);
    return res.status(500).json({ message: "Server error occurred" });
  }
};

export const update = async (req, res) => {
  const categoryId = req.params.id;
  const { name, locationId } = req.body;

  // Validate input fields
  if (!name && !locationId && !req.file) {
    return res.status(400).json({ message: "No fields to update" });
  }

  // Validate category ID
  if (!/^[0-9a-fA-F]{24}$/.test(categoryId)) {
    return res.status(400).json({ message: "Invalid Category ID" });
  }

  try {
    // Find the existing category
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if the new location exists
    if (locationId) {
      const existingLocation = await locationModel.findById(locationId);
      if (!existingLocation) {
        return res.status(400).json({ message: "Location does not exist" });
      }
    }

    // Check for a new name and ensure it's unique
    if (name) {
      const existingCategory = await categoryModel.findOne({
        slug: slugify(name.trim()),
        _id: { $ne: categoryId },
      });

      if (existingCategory) {
        return res
          .status(400)
          .json({ message: "A Category with this name already exists" });
      }
    }

    let imageUrl = null;

    // Handle image upload if a file is provided
    if (req.file?.path) {
      // Delete the old image if it exists
      if (category.icon) {
        deleteImage(category.icon);
      }

      try {
        const image = await uploadImage(req.file.path);
        imageUrl = image.secure_url;
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    // Update the category
    await categoryModel.findByIdAndUpdate(categoryId, {
      name: name ? name.trim() : category.name,
      slug: name ? slugify(name.trim()) : category.slug,
      icon: imageUrl || category.icon,
      location: locationId || category.location,
    });

    // Successfully updated
    return res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    console.error("Error updating Category:", error);
    return res.status(500).json({ message: "Server error occurred" });
  } finally {
    // Ensure local file is removed if it exists
    if (req.file?.path) {
      removeLocalFile(req.file.path);
    }
  }
};
