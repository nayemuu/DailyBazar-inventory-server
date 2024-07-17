// import dotenv from 'dotenv';
// dotenv.config();
import fs from 'fs';
import slugify from 'slugify';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { imageUploadOnDB } from '../utils/image.js';
import { locationModel } from '../models/locationModel.js';
import { replaceMongoIdInArray } from '../utils/mongoDB.js';
import { connectToDatabase } from '../connectToDatabase.js';

export const create = async (req, res) => {
  try {
    await connectToDatabase();
    // console.log("req.file = ", req.file);
    const { name } = req.body;
    // console.log('req.body = ', req.body);

    if (!name && !name?.trim().length) {
      return res.status(400).json({ message: 'name is required' });
    }

    const isUserExists = await locationModel.findOne({
      slug: slugify(name.trim()),
    });
    if (isUserExists) {
      return res
        .status(400)
        .json({ message: 'location with this name already exist' });
    }

    res.status(201).json({ message: 'Location created successfully' });

    if (req?.file?.path) {
      console.log('logo = ', logo);
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
          console.log('uploadOnCloudinary, fsmodule error = ', error);
        }
      });
    }
  }
};

export const list = async (req, res) => {
  try {
    await connectToDatabase();
    const dataFromMongodb = await locationModel
      .find({})
      .select(['name', 'icon'])
      .lean();

    res.status(200).json(replaceMongoIdInArray(dataFromMongodb));
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.message);
  }
};
