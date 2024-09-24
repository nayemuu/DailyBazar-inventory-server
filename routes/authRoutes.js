import express from "express";
import { login, register } from "../controllers/authController.js";
import { requiredLogin } from "../middlewares/common/authorization-middleware.js";

const Route = express.Router();
Route.post("/register", register);
Route.post("/login", login);
Route.get("/test", requiredLogin, (req, res) => {
  res.send({
    data: "This is private route. This means, you have successfully logged in",
  });
});

export default Route;
