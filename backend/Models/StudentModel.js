import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    RollNo: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@iitp\.ac\.in$/,
            "Please enter a valid email address"
        ],
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["Admin", "User"],  
        default: "User",  
        trim: true
    },
    currentyear:{
        type:Number,
        required:true,
    },
    department:{
        type:String,
        required:true,
    },
});

export default mongoose.model("User", UserSchema);
