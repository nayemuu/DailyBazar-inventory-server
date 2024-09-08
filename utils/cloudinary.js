import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    throw new Error("Provide Valid localFilePath");
  }
  const response = await cloudinary.uploader.upload(localFilePath);
  return response;
};

const deleteFromCloudinary = async (public_id) => {
  try {
    if (!public_id) {
      throw new Error("Provide Valid public_id");
    }
    cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.log("error = ", error);
  }
};
