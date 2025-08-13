import mongoose from "mongoose";

const ShiftTimingSchema = new mongoose.Schema({
    shift:{
        type: String,
        enum: ["Morning", "Evening"],
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
});

export default mongoose.model("ShiftTiming", ShiftTimingSchema);