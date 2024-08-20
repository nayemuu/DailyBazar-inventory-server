// import dotenv from 'dotenv';
// dotenv.config();
import fs from "fs";
import slugify from "slugify";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { imageUploadOnDB } from "../utils/image.js";
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

  let { limit = 10, offset = 0, keyword = "" } = req.query; // Default to 10 items per page and 0 items skipped

  // Convert limit and offset to numbers
  limit = parseInt(limit);
  offset = parseInt(offset);
  keyword = keyword.trim(); // Trim keyword to remove extra spaces

  // Validate limit and offset
  if (isNaN(limit) || isNaN(offset) || limit < 0 || offset < 0) {
    return res.status(400).json({ error: "Invalid limit or offset value" });
  }

  // Build the query
  // const keywordRegex = new RegExp(keyword, "i");
  // let query = { name: { $regex: keywordRegex } };

  // let query = {};
  // if (keyword) {
  //   const keywordRegex = new RegExp(keyword, "i");
  //   query = {
  //     $or: [
  //       { name: { $regex: keywordRegex } },
  //       { _id: { $regex: keywordRegex } },
  //     ],
  //   };
  // }

  // Build the query
  let query = {};
  if (keyword) {
    if (/^[0-9a-fA-F]{24}$/.test(keyword)) {
      // If keyword is a valid ObjectId, search by _id
      query._id = keyword;
    } else {
      // Otherwise, search by name with regex
      const keywordRegex = new RegExp(keyword, "i");
      query.$or = [{ name: { $regex: keywordRegex } }];
    }
  }

  try {
    // Get the total count of documents
    const count = await locationModel.countDocuments(query);

    // Get the paginated data
    const dataFromMongodb = await locationModel
      .find(query)
      .select(["name", "icon"])
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
