
import dotenv from "dotenv";
import mongoose from 'mongoose';

dotenv.config();

export const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.DATABASEADDRESS);
        console.log('connection success');
    } catch (err) {
        console.log(err);
    }
}

