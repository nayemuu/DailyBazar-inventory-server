import express from "express";
import { requiredLogin } from "../middlewares/common/authorization-middleware.js";
import {
  create,
  list,
  update,
  remove,
  singleData,
} from "../controllers/supplierController.js";

const Route = express.Router();
Route.get("/", requiredLogin, list);
Route.post("/", requiredLogin, create);
Route.patch("/:id", requiredLogin, update);
Route.delete("/:id", requiredLogin, remove);
Route.get("/:id", requiredLogin, singleData);

export const supplierRoute = Route;
