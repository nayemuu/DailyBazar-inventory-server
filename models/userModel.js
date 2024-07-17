import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            minLength: 6,
            maxLength: 40,
        },

        password: {
            type: String,
            required: true,
            trim: true,
            minLength: 6,
        },

        role: {
            type: String,
            enum: ["admin", "staff", "normal"],
            default: "normal",
          },

    },
    { timestamps: true }
);

export const userModel = mongoose.model("User", userSchema);
