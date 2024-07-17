import { imageModel } from "../models/imageModel.js";

export const imageUploadOnDB = async (imageCredentials) => {
  // console.log("imageCredentials = ", imageCredentials);
  try {
    await imageModel.create(imageCredentials);
  } catch (error) {
    throw new Error(error);
  }
};
