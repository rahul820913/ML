import mongoose from 'mongoose';

const classTimeTableSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true,
        trim: true,
    },
    year: {
        type: Number,
        required: true,
        min: 1, 
        max: 5, 
    },
    subjectCode: {
        type: String,
        required: true,
        trim: true,
    },
    startTime: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
            },
        },
    },
    endTime: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
            },
        },
    },
    day: {
        type: String,
        required: true,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    room: {
        type: String,
        required: true,
        trim: true,
    },
    status: { 
        type: String, 
        enum: ["Scheduled", "Cancelled", "Extra Class"], 
        default: "Scheduled" 
    },
    createdAt: { type: Date,
         default: Date.now
    },
});

export default mongoose.model('ClassTimeTable', classTimeTableSchema);