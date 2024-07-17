import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel.js';
import { connectToDatabase } from '../connectToDatabase.js';
dotenv.config();

export const register = async (req, res) => {
  // console.log('req.body = ', req.body);
  try {
    let connection = await connectToDatabase();
    const { name, password, email } = req.body; // সব সময় req.body থেকে object destructuring এর মাধ্যমে প্রয়োজনীয় property destructure করে ব্যবহার করব
    // যাতে পরবর্তীতে কি কি properties ব্যবহার করতেছো, তা জানার জন্য front-end ঘাটাঘাটি না করতে হয়
    // express module টি দেখেই যাতে বুঝতে পারি যে কি কি properties নিয়ে কাজ করতেছি

    if (!name?.trim()) {
      return res.status(500).json({ message: 'Name is required' });
    }
    // trim() method call করার কারণ হচ্ছে express/nodejs extra specingকে ও valid character হিসেবে count করে
    // return করার কারণ হচ্ছে if codition fullfail হলে code execution যেন ওখানেই হয়, পরবর্তী লাইনে যেন না যায়
    if (!email?.trim()) {
      return res.status(500).json({ message: 'email is required' });
    }

    if (!password || password?.trim().length < 6) {
      return res
        .status(400)
        .json({ message: 'password must have at least 6 characters' });
    }

    const isUserExists = await userModel.findOne({ email });
    if (isUserExists) {
      return res.status(400).json({
        message: 'user already exists with this email',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });
    const JsonWebToken = jwt.sign({ id: newUser._id }, process.env.SIGNATURE, {
      expiresIn: '24h',
    });

    res.status(200).json({
      name: name.trim(),
      email: email.trim(),
      accessToken: JsonWebToken,
    });
  } catch (error) {
    if (error?.message) {
      res.status(500).json({ message: error.message });
      console.log({ message: error.message });
    } else {
      res.status(500).json({ message: 'Signup failed!' });
      console.log({ message: 'Signup failed!' });
    }
  }
};

export const login = async (req, res) => {
  try {
    await connectToDatabase();
    const { email, password } = req.body;
    const userFound = await userModel.findOne({ email });
    // console.log('email = ', email);
    // console.log('userFound = ', userFound);
    if (userFound && userFound.role === 'admin') {
      const isValidPassword = await bcrypt.compare(
        password,
        userFound.password
      );
      if (isValidPassword) {
        const JsonWebToken = jwt.sign(
          { id: userFound.id, name: userFound.name },
          process.env.SIGNATURE,
          {
            expiresIn: '24h',
          }
        );
        res.status(200).json({
          name: userFound.name,
          email: userFound.email,
          accessToken: JsonWebToken,
        });
      } else {
        res.status(401).json({
          message: 'Please provide valid password',
        });
      }
    } else {
      res.status(500).json({
        message: 'No user found with this gmail',
      });
    }
  } catch (err) {
    res.status(401).json({
      message: 'Authentication failed!',
    });
  }
};
