// import dotenv from 'dotenv';
// dotenv.config();
import fs from "fs";
import slugify from "slugify";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteImage, imageUploadOnDB } from "../utils/image.js";
import { locationModel } from "../models/locationModel.js";
import { replaceMongoIdInArray } from "../utils/mongoDB.js";

export const create = async (req, res) => {
  try {
    // console.log("req.file = ", req.file);
    const { name } = req.body;
    // console.log('req.body = ', req.body);

    if (!name && !name?.trim().length) {
      return res.status(400).json({ message: "name is required" });
    }

    const isLocationExists = await locationModel.findOne({
      slug: slugify(name.trim()),
    });
    if (isLocationExists) {
      return res
        .status(400)
        .json({ message: "location with this name already exist" });
    }

    res.status(201).json({ message: "Location created successfully" });

    if (req?.file?.path) {
      const logo = await uploadOnCloudinary(req.file.path);
      imageUploadOnDB({ ...logo });
      locationModel.create({
        name,
        slug: slugify(name),
        icon: logo.secure_url,
      });
    } else {
      locationModel.create({ name, slug: slugify(name.trim()) });
    }
  } catch (error) {
    console.log(error);
  } finally {
    if (req?.file?.path) {
      fs.unlink(req.file.path, (error) => {
        if (error) {
          console.log("uploadOnCloudinary, fsmodule error = ", error);
        }
      });
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

    if (/^[0-9a-fA-F]{24}$/.test(keyword)) {
      // If keyword is a valid ObjectId, search by _id or name
      query.$or = [{ _id: keyword }, { name: { $regex: keywordRegex } }];
    } else {
      // Otherwise, search only by name using regex
      query.$or = [{ name: { $regex: keywordRegex } }];
    }
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
  } catch (err) {
    console.log("err = ", err);
    if (err?.messag) {
      res.status(500).json(err.message);
    } else {
      res
        .status(500)
        .json({ error: "An error occurred while processing your request" });
    }
  }
};

export const remove = async (req, res) => {
  try {
    console.log("req.params.id = ", req.params.id);
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      const deletedData = await locationModel.findByIdAndDelete(req.params.id);

      console.log("deletedData = ", deletedData);
      if (deletedData) {
        // imageModel.findByIdAndDelete(req.params.id);
        // deleteFromCloudinary(deletedData.thumbnail);
        // deleteFromCloudinary(deletedData.logo);

        res.status(200).json({ message: "deleted successfully" });

        if (deletedData.icon) {
          deleteImage(deletedData.icon);
        }
      } else {
        res.status(400).json({ message: "Provide vaild id" });
      }
    } else {
      res.status(400).json({ message: "Provide vaild id" });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};
