import mongoose from 'mongoose'

const SittingSchema=new mongoose.Schema({
    date:{
        type:Date,
        required:true,
    },
    day:{
        type:String,
        required:true,
        enum:["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        
    },
    coursecode: {
        type: String,
        required: true,
    },
    shift:{
        type: String,
        enum: ["Morning", "Evening"],
        required: true,
    },
    roomno:{
        type: String,
        required: true,
    },
    rollnolist:{
        type: String, 
        required: true,
    },
});
export default mongoose.model('Sitting', SittingSchema);