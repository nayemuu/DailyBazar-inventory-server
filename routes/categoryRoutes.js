import express from "express";
import { checkLogin } from "../middlewares/common/checkLogin.js";
import { list, create } from "../controllers/categoryController.js";
import { upload } from "../utils/multer.js";

const Route = express.Router();
Route.get("/", checkLogin, list);
Route.post("/", checkLogin, upload.single("icon"), create);

export const categoryRoutes = Route;
