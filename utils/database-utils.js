import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.DATABASEADDRESS);
    console.log('connection success');
  } catch (err) {
    console.log(err);
  }
};

export const checkDatabaseConnection = async (req, res, next) => {
  try {
    // Check if the database connection is alive
    if (mongoose.connection.readyState === 0) {
      console.log('Database disconnected. Reconnecting...');
      await connectToDatabase(); // Reconnect
    }
    next();
  } catch (error) {
    next(new Error('Database connection error'));
  }
};

//readyState value meaning

// 0: disconnected
// 1: connected
// 2: connecting
// 3: disconnecting
