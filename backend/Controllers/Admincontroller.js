import jwt from "jsonwebtoken";
import User from '../Models/StudentModel.js';
import bcrypt from "bcryptjs";
import validator from "validator";
import Department from "../Models/Department.js";
import ClassTimeTable from "../Models/ClassTimeTable.js"
const adddepartment=async(req,res)=>{
    try{
        const {departmentcode,departmentname}=req.body;
        if (!departmentcode|| !departmentname) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        const data = await Department.findOne({departmentname});
        if(data ){
            return res.json({ success: false, message: 'data already added' })
        }
        const newdata = {
            departmentcode,
            departmentname
        }
        const newdept=new Department(newdata);
        const dept = await newdept.save();

        return res.json({success:true,dept});

    }catch(error){
        res.json({ success: false, message: error.message })
    }
}

const getAllDepartments = async (req, res) => {
    try {
        const data = await Department.find();
        if (!data || data.length === 0) {
            return res.status(404).json({ success: false, message: "Departments not found" });
        }
        res.json({ success: true, departments: data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const markextra = async (req, res) => {
    try {
      const { day, subjectCode, startTime, endTime, room, year, department } = req.body; // ⬅️ Extract directly from req.body
  
      if (!day || !subjectCode || !startTime || !endTime || !room || !year || !department) {
        return res.status(400).json({ success: false, message: "All fields are required!" });
      }
  
      const newClass = new ClassTimeTable({
        day,
        subjectCode: subjectCode,
        startTime,
        endTime,
        room,
        status: "Extra Class",
        year,
        department,
      });
  
      await newClass.save(); // ✅ Save correctly
      res.json({ success: true, message: "Extra class added successfully", newClass });
    } catch (error) {
      console.error("Error in markextra:", error);
      res.status(500).json({ success: false, message: "Error adding extra class", error: error.message });
    }
  };
  
  


  const classcancel = async (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.params;
  
      // Find and update the class status
      const updatedClass = await ClassTimeTable.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
  
      if (!updatedClass) {
        return res.status(404).json({ success: false, message: "Class not found" });
      }
  
      res.json({ success: true, message: `Class status updated to ${status}`, updatedClass });
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(500).json({ success: false, message: "Error updating class", error });
    }
};

const deleteExtraClass = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the class in the database
      const classToDelete = await ClassTimeTable.findById(id);
  
      if (!classToDelete) {
        return res.status(404).json({ success: false, message: "class not found" });
      }

  
      // Delete the extra class
      await ClassTimeTable.findByIdAndDelete(id);
  
      res.json({ success: true, message: "class deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error deleting class", error });
    }
  };

  const getalluserdata = async (req, res) => {
    try {
      const users = await User.find();
  
      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, message: "No users found" });
      }
  
      res.status(200).json({ success: true, users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
  
  const updateUserData = async (req, res) => {
    const { role } = req.body;
    const { userId } = req.params;
  
    try {
      if (!role || !["admin", "user"].includes(role.toLowerCase())) {
        return res.status(400).json({ success: false, message: "Invalid role" });
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        { role },
        { new: true, runValidators: true } 
      );
  
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      res.status(200).json({ success: true, message: "User role updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
  


export {adddepartment,getAllDepartments,markextra,classcancel,deleteExtraClass,getalluserdata,updateUserData};