// import dotenv from 'dotenv';
// dotenv.config();
import slugify from "slugify";
import { deleteImage, uploadImage } from "../utils/image.js";
import { locationModel } from "../models/locationModel.js";
import { replaceMongoIdInArray } from "../utils/mongoDB.js";
import { removeLocalFile } from "../utils/fs-utils.js";

export const create = async (req, res) => {
  try {
    // console.log('req.body = ', req.body);
    // console.log("req.file = ", req.file);
    const { name } = req.body;

    // Validate the name field
    if (!name && !name?.trim().length) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Check if the location already exists
    const isLocationExists = await locationModel.findOne({
      slug: slugify(name.trim()),
    });
    if (isLocationExists) {
      return res.status(400).json({
        message: "Location with this name already exists",
      });
    }

    // Handle image upload if a file is provided
    let imageUrl = null;
    if (req?.file?.path) {
      const image = await uploadImage(req.file.path);
      imageUrl = image.secure_url;
    }

    // Create the location
    await locationModel.create({
      name: name.trim(),
      slug: slugify(name.trim()),
      icon: imageUrl,
    });

    return res.status(201).json({ message: "Location created successfully" });
  } catch (error) {
    console.error("Error creating location:", error);
    return res.status(500).json({ message: "Server error occurred" });
  } finally {
    if (req?.file?.path) {
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

    // if (/^[0-9a-fA-F]{24}$/.test(keyword)) {
    //   // If keyword is a valid ObjectId, search by _id or name
    //   query.$or = [{ _id: keyword }, { name: { $regex: keywordRegex } }];
    // } else {
    //   // Otherwise, search only by name using regex
    //   query.$or = [{ name: { $regex: keywordRegex } }];
    // }
  }

  try {
    // Get the total count of documents
    const count = await locationModel.countDocuments(query);

    // Get the paginated and sorted data
    const dataFromMongodb = await locationModel
      .find(query)
      .select(["name", "icon"])
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
    const locationId = req.params.id;

    // Validate location ID
    if (!/^[0-9a-fA-F]{24}$/.test(locationId)) {
      return res.status(400).json({ message: "Invalid location ID" });
    }

    // Find and delete the location by ID
    const deletedLocation = await locationModel.findByIdAndDelete(locationId);

    if (!deletedLocation) {
      return res
        .status(400)
        .json({ message: "No location found with the provided ID" });
    }

    // If the location has an associated icon, delete it
    if (deletedLocation.icon) {
      deleteImage(deletedLocation.icon);
    }

    return res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("Error deleting location:", error);
    return res.status(500).json({ message: "Server error occurred" });
  }
};

export const update = async (req, res) => {
  const locationId = req.params.id;
  const { name } = req.body;

  // Validate input fields
  if (!name && !req.file) {
    return res.status(400).json({ message: "No fields to update" });
  }

  // Validate location ID
  if (!/^[0-9a-fA-F]{24}$/.test(locationId)) {
    return res.status(400).json({ message: "Invalid location ID" });
  }

  try {
    // Find the existing location by ID
    const existingLocation = await locationModel.findById(locationId);
    if (!existingLocation) {
      return res
        .status(404)
        .json({ message: "No location found with the provided ID" });
    }

    let imageUrl = null;

    // Handle image upload if a file is provided
    if (req.file?.path) {
      // Delete the old image if it exists
      if (existingLocation.icon) {
        deleteImage(existingLocation.icon);
      }

      try {
        const image = await uploadImage(req.file.path);
        imageUrl = image.secure_url;
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    // Update the location document
    await locationModel.findByIdAndUpdate(locationId, {
      name: name ? name.trim() : existingLocation.name,
      slug: name ? slugify(name.trim()) : existingLocation.slug,
      icon: imageUrl || existingLocation.icon,
    });

    // Successfully updated
    return res.status(200).json({ message: "Location updated successfully" });
  } catch (error) {
    console.error("Error updating location:", error);
    return res.status(500).json({ message: "Server error occurred" });
  } finally {
    // Ensure local file is removed if it exists
    if (req.file?.path) {
      removeLocalFile(req.file.path);
    }
  }
};
