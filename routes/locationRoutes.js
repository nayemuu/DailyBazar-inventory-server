import express from "express";
import { checkLogin } from "../middlewares/common/checkLogin.js";
import {
  create,
  list,
  update,
  remove,
} from "../controllers/locationController.js";
import { upload } from "../utils/multer.js";

const Route = express.Router();
Route.get("/", checkLogin, list);
Route.post("/", checkLogin, upload.single("icon"), create);
Route.patch("/:id", upload.single("icon"), update);
Route.delete("/:id", remove);

export default Route;
