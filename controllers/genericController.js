import slugify from "slugify";
import { genericModel } from "../models/genericModel.js";
import { replaceMongoIdInArray } from "../utils/mongoDB.js";

export const create = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate the name field
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required." });
    }

    // Check if the generic entry already exists
    const existingGeneric = await genericModel.findOne({
      slug: slugify(name.trim()),
    });
    if (existingGeneric) {
      return res.status(400).json({
        message: `Generic '${name.trim()}' already exists. Please choose another name.`,
      });
    }

    // Create the generic entry
    await genericModel.create({
      name: name.trim(),
      slug: slugify(name.trim()),
    });

    return res.status(201).json({ message: "Generic created successfully." });
  } catch (error) {
    console.error("Error creating generic:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

export const list = async (req, res) => {
  try {
    let { limit = 10, offset = 0, keyword = "" } = req.query;

    // Convert limit and offset to numbers
    limit = parseInt(limit);
    offset = parseInt(offset);
    keyword = keyword.trim();

    // Validate limit and offset
    if (isNaN(limit) || isNaN(offset) || limit < 0 || offset < 0) {
      return res
        .status(400)
        .json({ message: "Invalid limit or offset value." });
    }

    // Initialize query object
    let query = {};
    if (keyword) {
      const keywordRegex = new RegExp(keyword, "i");
      query.name = { $regex: keywordRegex };
    }

    // Get the total count of documents
    const count = await genericModel.countDocuments(query);

    // Get the paginated and sorted data
    const dataFromMongodb = await genericModel
      .find(query)
      .select(["name"])
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .limit(limit)
      .skip(offset)
      .lean();

    res.status(200).json({
      results: replaceMongoIdInArray(dataFromMongodb),
      limit,
      offset,
      count,
    });
  } catch (error) {
    console.error("Error listing generics:", error);
    return res.status(500).json({ message: "Server error occurred." });
  }
};

export const remove = async (req, res) => {
  try {
    const genericId = req.params.id;

    // Validate generic ID
    if (!/^[0-9a-fA-F]{24}$/.test(genericId)) {
      return res.status(400).json({ message: "Invalid generic ID." });
    }

    // Find and delete the generic by ID
    const deletedGeneric = await genericModel.findByIdAndDelete(genericId);
    if (!deletedGeneric) {
      return res
        .status(404)
        .json({ message: "No generic found with the provided ID." });
    }

    return res.status(200).json({ message: "Generic deleted successfully." });
  } catch (error) {
    console.error("Error deleting generic:", error);
    return res.status(500).json({ message: "Server error occurred." });
  }
};

export const update = async (req, res) => {
  const genericId = req.params.id;
  const { name } = req.body;

  // Validate input fields
  if (!name) {
    return res.status(400).json({ message: "Name is required for update." });
  }

  // Validate generic ID
  if (!/^[0-9a-fA-F]{24}$/.test(genericId)) {
    return res.status(400).json({ message: "Invalid generic ID." });
  }

  try {
    // Find the existing generic by ID
    const existingGeneric = await genericModel.findById(genericId);
    if (!existingGeneric) {
      return res
        .status(404)
        .json({ message: "No generic found with the provided ID." });
    }

    // Update the generic document
    await genericModel.findByIdAndUpdate(genericId, {
      name: name.trim(),
      slug: slugify(name.trim()),
    });

    return res.status(200).json({ message: "Generic updated successfully." });
  } catch (error) {
    console.error("Error updating generic:", error);
    return res.status(500).json({ message: "Server error occurred." });
  }
};
