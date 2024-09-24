import express from "express";
import { requiredLogin } from "../middlewares/common/authorization-middleware.js";
import {
  create,
  list,
  update,
  remove,
} from "../controllers/locationController.js";
import { upload } from "../utils/multer.js";

const Route = express.Router();
Route.get("/", requiredLogin, list);
Route.post("/", requiredLogin, upload.single("icon"), create);
Route.patch("/:id", requiredLogin, upload.single("icon"), update);
Route.delete("/:id", requiredLogin, remove);

export default Route;
