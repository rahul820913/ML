// controllers/userController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import User from "../Models/StudentModel.js";
import Sitting from "../Models/Sitting.js";
import ShiftTiming from "../Models/ShiftTiming.js";
import ClassTimeTable from "../Models/ClassTimeTable.js";
import multer from "multer";
import XLSX from "xlsx";
import moment from "moment";
import Department from "../Models/Department.js";
import axios from "axios";
import csv from "csv-parser";
import { Readable } from "stream";

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------------------- Auth ----------------------
const registerUser = async (req, res) => {
  try {
    const { name, email, password, RollNo } = req.body;
    if (!name || !email || !password || !RollNo) {
      return res.status(400).json({ success: false, message: "Missing Details" });
    }
    if (!validator.isEmail(email) || !email.endsWith("@iitp.ac.in")) {
      return res.status(400).json({ success: false, message: "Please enter a valid IITP email (@iitp.ac.in)" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Please enter a strong password (min 8 chars)" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Derive joining year and academic year
    const joiningYear = 2000 + parseInt(RollNo.substring(0, 2), 10);
    const now = new Date();
    let academicYear = now.getFullYear() - joiningYear;
    if (now.getMonth() + 1 < 7) academicYear -= 1;
    academicYear += 1;

    const departmentcode = RollNo.substring(4, 6);
    const department = await Department.findOne({
      departmentcode: { $regex: new RegExp(`\\b${departmentcode}\\b`, "i") },
    });

    const userData = {
      RollNo,
      name,
      email,
      password: hashedPassword,
      department: department ? department.departmentname : "Unknown",
      currentyear: academicYear,
    };

    const newUser = new User(userData);
    const user = await newUser.save();
    const token = jwt.sign({ RollNo: user.RollNo }, process.env.JWT_SECRET);

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error("registerUser error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const joiningYear = 2000 + parseInt(user.RollNo.substring(0, 2), 10);
    const now = new Date();
    let academicYear1 = now.getFullYear() - joiningYear;
    if (now.getMonth() + 1 < 7) academicYear1 -= 1;
    academicYear1 += 1;

    if (user.currentyear !== academicYear1) {
      user.currentyear = academicYear1;
      await user.save();
    }

    const token = jwt.sign({ RollNo: user.RollNo }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.error("loginUser error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ---------------------- Get Exam By RollNo ----------------------
const getExamByRollNo = async (req, res) => {
  try {
    const { rollno } = req.params;
    if (!rollno) return res.status(400).json({ success: false, message: "Roll number is required" });

    const exams = await Sitting.find({ rollnolist: { $regex: new RegExp(`\\b${rollno}\\b`, "i") } });
    if (!exams || exams.length === 0) return res.status(404).json({ success: false, message: "No exams found for the given roll number" });

    const shiftTimings = await ShiftTiming.find();
    const updatedExams = exams.map(exam => {
      const st = shiftTimings.find(s => s.shift === exam.shift);
      return {
        ...exam._doc,
        shiftStartTime: st ? st.startTime : "N/A",
        shiftEndTime: st ? st.endTime : "N/A",
      };
    });

    res.json({ success: true, exams: updatedExams });
  } catch (error) {
    console.error("getExamByRollNo error:", error);
    res.status(500).json({ success: false, message: "Error retrieving data", error: error.message });
  }
};

// ---------------------- Create Shift Timing ----------------------
const createShiftTiming = async (req, res) => {
  try {
    const { shift, startTime, endTime } = req.body;
    if (!shift || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Optionally remove old timings or keep them. You had deleteMany previously.
    await ShiftTiming.deleteMany({});
    const newShiftTiming = new ShiftTiming({ shift, startTime, endTime });
    await newShiftTiming.save();

    res.status(201).json({ success: true, message: "Shift timing created successfully", shiftTiming: newShiftTiming });
  } catch (error) {
    console.error("createShiftTiming error:", error);
    res.status(500).json({ success: false, message: "Error creating shift timing", error: error.message });
  }
};

// ---------------------- Create Timetable ----------------------
const createTimetable = async (req, res) => {
  try {
    const { department, year, schedule } = req.body;
    if (!department || !year || !Array.isArray(schedule) || schedule.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid data provided" });
    }

    const timetableEntries = schedule.map(entry => ({
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
    console.error("createTimetable error:", error);
    res.status(500).json({ success: false, message: "Error creating timetable", error: error.message });
  }
};

const getTimetable = async (req, res) => {
  try {
    const { year, department } = req.query;
    if (!year || !department) return res.status(400).json({ success: false, message: "Year and department are required" });
    const Y = Number(year);
    const timetable = await ClassTimeTable.find({ year: Y, department });
    res.json({ success: true, data: timetable });
  } catch (error) {
    console.error("getTimetable error:", error);
    res.status(500).json({ success: false, message: "Error fetching timetable", error: error.message });
  }
};

// ---------------------- Profile ----------------------
const getprofile = async (req, res) => {
  try {
    const { RollNo } = req.user || {};
    if (!RollNo) return res.status(400).json({ success: false, message: "User ID not provided" });
    const user = await User.findOne({ RollNo }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("getprofile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------- Import Google Sheet (public CSV export) ----------------------
function extractSheetId(urlOrId) {
  const match = String(urlOrId).match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : urlOrId;
}

const importSheet = async (req, res) => {
  try {
    
    const sheetId = extractSheetId(req.params.id);
    if (!sheetId) return res.status(400).json({ success: false, message: "Invalid sheet ID or link" });

    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

    // axios get text
    const response = await axios.get(csvUrl, { responseType: "text" });
    const results = [];

    await new Promise((resolve, reject) => {
      Readable.from(response.data)
        .pipe(csv())
        .on("data", (row) => results.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    // Validate & map rows to Sitting schema
    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const sittingsToInsert = [];
    const invalidRows = [];

    for (const row of results) {
        const r = {};
        Object.keys(row).forEach(k => {
            // normalize column keys
            const normalizedKey = k.trim().toLowerCase().replace(/\s+/g, '');
            r[normalizedKey] = row[k]?.toString().trim() || "";
          });
          
          // Now extract with more flexibility
        //   let roomno = r.roomno || r.room || r['roomnumber'] || "";
        //   roomno = roomno.toString().trim();
      
        const rawDate = r.date || r["date (mm/dd/yyyy)"] || r["date(dd/mm/yyyy)"] || "";
        const dayVal = r.day || "";
        const coursecode = r.coursecode || r.subjectcode || r.subject || "";
        const shift = r.shift || "";
        const roomno = (r.roomno || r.room || "").toString().trim();
        const rollnolist = r.rollnolist || r.rollno || "";
      
        if (!validDays.includes(dayVal)) {
          invalidRows.push({ row: r, reason: "invalid day" });
          continue;
        }
      
        const parsedDate = moment(rawDate, ["DD-MM-YYYY","MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", moment.ISO_8601], true);
        if (!parsedDate.isValid()) {
          invalidRows.push({ row: r, reason: "invalid date" });
          continue;
        }
      
        if (!coursecode || !rollnolist || !roomno) {
          invalidRows.push({ row: r, reason: "missing coursecode/rollnolist/roomno" });
          continue;
        }
      
        sittingsToInsert.push({
          date: parsedDate.toDate(),
          day: dayVal,
          coursecode,
          shift,
          roomno : roomno.toString().trim(),
          rollnolist,
        });
      }
    

    // Save valid rows
    if (sittingsToInsert.length > 0) {
      // Optionally clear previous records:
      await Sitting.deleteMany({});
      await Sitting.insertMany(sittingsToInsert);
    }

    res.json({
      success: true,
      message: "Google Sheet data imported and stored (partial success if invalid rows exist).",
      insertedCount: sittingsToInsert.length,
      invalidRowsCount: invalidRows.length,
      invalidRowsSample: invalidRows.slice(0, 10),
      data: sittingsToInsert.slice(0, 100),
    });
  } catch (error) {
    console.error("importSheet error:", error.response ? error.response.data : error.message);
    // If google returns 404 or non-CSV, surface a helpful error
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ success: false, message: "Sheet not found or not shared publicly (set 'Anyone with link can view')." });
    }
    res.status(500).json({ success: false, message: "Failed to import and store Google Sheet data", error: error.message });
  }
};

// ---------------------- update any field ----------------------

const updateClassField = async (req, res) => {
    try {
      const { classId } = req.params;
      const updateData = req.body; // e.g. { startTime: "09:00" }
  
      if (!classId) {
        return res.status(400).json({ success: false, message: "Class ID is required" });
      }
  
      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, message: "No update data provided" });
      }
  
      const updatedClass = await ClassTimeTable.findByIdAndUpdate(
        classId,
        { $set: updateData },
        { new: true } // returns updated document
      );
  
      if (!updatedClass) {
        return res.status(404).json({ success: false, message: "Class not found" });
      }
  
      res.json({ success: true, data: updatedClass });
    } catch (error) {
      console.error("Error updating class field:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

// ---------------------- Exports ----------------------
export {
  registerUser,
  loginUser,
  upload, // multer middleware for routes that accept file uploads
  getExamByRollNo,
  createShiftTiming,
  createTimetable,
  getTimetable,
  getprofile,
  importSheet,
  updateClassField,
};
