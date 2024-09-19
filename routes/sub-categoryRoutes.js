import express from "express";
import { requiredLogin } from "../middlewares/common/requiredLogin.js";
import {
  list,
  create,
  update,
  remove,
} from "../controllers/sub-categoryController.js";
import { upload } from "../utils/multer.js";

const Route = express.Router();
Route.get("/", requiredLogin, list);
Route.post("/", requiredLogin, upload.single("icon"), create);
Route.patch("/:id", requiredLogin, upload.single("icon"), update);
Route.delete("/:id", requiredLogin, remove);

export const subCategoryRoutes = Route;
