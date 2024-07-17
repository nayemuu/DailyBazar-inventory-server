import express from 'express';
import { login, register } from '../controllers/authController.js';
import { checkLogin } from '../middlewares/common/checkLogin.js';

const Route = express.Router();
Route.post('/register', register);
Route.post('/login', login);
Route.get('/test', checkLogin, (req, res) => {
  res.send({
    data: 'This is private route. This means, you have successfully logged in',
  });
});

export default Route;
