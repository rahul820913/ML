import express from 'express';
import { registerUser, loginUser,createExam , upload,getExamByRollNo,createShiftTiming ,createTimetable,getTimetable ,getprofile} from '../Controllers/UserController.js';
import authUser from '../middleware/Userauth.js'
import {adddepartment,getAllDepartments,markextra,classcancel,deleteExtraClass,getalluserdata,updateUserData} from "../Controllers/Admincontroller.js"
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/upload',authUser, upload.single("file"),createExam);
router.get('/get/:rollno',getExamByRollNo );
router.post('/create/shift', authUser,createShiftTiming);
router.post('/create/timetable', authUser,createTimetable);
router.get("/timetable",authUser,getTimetable);
router.post('/deptartment',authUser,adddepartment);
router.get('/info',authUser,getprofile)
router.get('/get/dept',authUser,getAllDepartments)
router.post('/extra',authUser,markextra);
router.put('/timetable/cancel/:id',authUser,classcancel);
router.delete("/timetable/extra/:id",authUser,deleteExtraClass);
router.get("/data",authUser,getalluserdata);
router.put("/data/:userId/role",authUser,updateUserData);

export default router;