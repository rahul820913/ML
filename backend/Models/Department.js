import mongoose from "mongoose";

const departmentschema = new mongoose.Schema({
    departmentcode:{
        type:String,
        required:true,
    },
    departmentname:{
        type:String,
        required:true,
    },
});

export default mongoose.model("Department",departmentschema);