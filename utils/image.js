import { imageModel } from "../models/imageModel.js";
import { deleteFromCloudinary } from "./cloudinary.js";

export const imageUploadOnDB = async (imageCredentials) => {
  // console.log("imageCredentials = ", imageCredentials);
  try {
    await imageModel.create(imageCredentials);
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteImage = async (imageUrl) => {
  // console.log("imageCredentials = ", imageCredentials);
  try {
    let imageDetails = await imageModel.findOneAndDelete({
      secure_url: imageUrl,
    });

    console.log("imageDetails = ", imageDetails);
    if (imageDetails.public_id) {
      deleteFromCloudinary(imageDetails.public_id);
    }
  } catch (error) {
    console.log("error on deleteImageFromDBandClouds = ", error);
    // throw new Error(error);
  }
};
