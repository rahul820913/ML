
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import User from "../Models/StudentModel.js";
import Sitting from "../Models/Sitting.js"; 
import ShiftTiming from "../Models/ShiftTiming.js"
import ClassTimeTable from "../Models/ClassTimeTable.js"
import multer from "multer";
import XLSX from "xlsx";
import moment from "moment"
import Department from "../Models/Department.js"
const registerUser = async (req, res) => {

    try {
        const { name, email, password, RollNo } = req.body;
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }
        if (!validator.isEmail(email) || !email.endsWith("@iitp.ac.in")) {
            return res.json({ success: false, message: "Please enter a valid IITP email (@iitp.ac.in)" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt)


        const joiningYear = 2000 + parseInt(RollNo.substring(0, 2));
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;  
        let academicYear = currentYear - joiningYear;
        if (currentMonth < 7) {
            academicYear -= 1; 
        }
        academicYear += 1;


        const departmentcode=RollNo.substring(4,6);

        const department= await Department.findOne({departmentcode:{ $regex: new RegExp(`\\b${departmentcode}\\b`, 'i') }});
        const userData = {
            RollNo,
            name,
            email,
            password: hashedPassword,
            department:department.departmentname,
            currentyear:academicYear,
        }

        const newUser = new User(userData)
        const user = await newUser.save()
        const token = jwt.sign({ RollNo: user.RollNo }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ RollNo: user.RollNo}, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const storage = multer.memoryStorage(); 
const upload = multer({ storage });

const createExam = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        if (jsonData.length === 0) {
            return res.status(400).json({ message: "Empty Excel file" });
        }

        const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        const exams = jsonData.slice(1).map(row => {
            const dayValue = row[1]?.trim();

            if (!validDays.includes(dayValue)) {
                throw new Error(`Invalid day value: ${dayValue}`);
            }

            const dateValue = row[0]?.trim();
            const parsedDate = moment(dateValue, ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"], true);

            if (!parsedDate.isValid()) {
                throw new Error(`Invalid date format: ${dateValue}`);
            }

            return {
                subjectCode: row[6] || "Unknown",
                date: parsedDate.toDate(),
                day: dayValue,
                shift: row[2] || "Unknown",
                coursecode: row[3] || "Unknown",
                roomno: row[4],
                rollnolist: row[5],
            };
        });
        await Sitting.deleteMany({});
        await Sitting.insertMany(exams);

        res.json({ success: true, message: "Excel data uploaded successfully!" });
    } catch (error) {
        console.error("Error processing Excel:", error);
        res.status(500).json({ success: false, message: "Error uploading data", error: error.message });
    }
};

const getExamByRollNo = async (req, res) => {
    try {
        const { rollno } = req.params;

        if (!rollno) {
            return res.status(400).json({ success: false, message: "Roll number is required" });
        }

        const exams = await Sitting.find({ rollnolist: { $regex: new RegExp(`\\b${rollno}\\b`, 'i') } });

        if (exams.length === 0) {
            return res.status(404).json({ success: false, message: "No exams found for the given roll number" });
        }

        const shiftTimings = await ShiftTiming.find(); 

        const updatedExams = exams.map(exam => {
            const shiftTime = shiftTimings.find(st => st.shift === exam.shift);
            return {
                ...exam._doc,
                shiftStartTime: shiftTime ? shiftTime.startTime : "N/A",
                shiftEndTime: shiftTime ? shiftTime.endTime : "N/A"
            };
        });

        res.json({ success: true, exams: updatedExams });
    } catch (error) {
        console.error("Error fetching exam data:", error);
        res.status(500).json({ success: false, message: "Error retrieving data", error: error.message });
    }
};


const createShiftTiming = async (req, res) => {
    try {
        const { shift, startTime, endTime } = req.body;

        if (!shift || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        await ShiftTiming.deleteMany({});

        const newShiftTiming = new ShiftTiming({ shift, startTime, endTime });
        await newShiftTiming.save();

        res.status(201).json({ 
            success: true, 
            message: "Shift timing created successfully", 
            shiftTiming: newShiftTiming 
        });

    } catch (error) {
        console.error("Error creating shift timing:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error creating shift timing", 
            error: error.message 
        });
    }
};


const createTimetable = async (req, res) => {
    try {
        const { department, year, schedule } = req.body;

        if (!department || !year || !Array.isArray(schedule) || schedule.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid data provided" });
        }
        const timetableEntries = schedule.map((entry) => ({
            department,
            year,
            subjectCode: entry.subject,
            startTime: entry.startTime,
            endTime: entry.endTime,
            day: entry.day,
            room: entry.room,
        }));
        await ClassTimeTable.insertMany(timetableEntries);

        res.status(201).json({ success: true, message: "Timetable created successfully!", data: timetableEntries });
    } catch (error) {
        console.error("Error creating timetable:", error);
        res.status(500).json({ success: false, message: "Error creating timetable", error: error.message });
    }
};

const getTimetable=async(req,res)=>{
    try {
        const { year, department } = req.query;
        if (!year || !department) {
          return res.status(400).json({ success: false, message: "Year and department are required" });
        }
        const Y = Number(year);
        const timetable = await ClassTimeTable.find({ year:Y, department });
        res.json(timetable);
      } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching timetable", error: error.message });
      }
};

const getprofile = async (req, res) => {
    try {
        const {RollNo} = req.user;
        if (!RollNo) {
            return res.status(400).json({ success: false, message: "User ID not provided" });
        }

        const user = await User.findOne({RollNo});
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error in getprofile:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};



export { registerUser, loginUser ,createExam,upload,getExamByRollNo,createShiftTiming ,createTimetable,getTimetable,getprofile}