import express from 'express';
import { registerUser, loginUser,getExamByRollNo,createShiftTiming ,createTimetable,getTimetable ,getprofile,updateClassField} from '../Controllers/UserController.js';
import authUser from '../middleware/Userauth.js'
import {adddepartment,getAllDepartments,markextra,classcancel,deleteExtraClass,getalluserdata,updateUserData} from "../Controllers/Admincontroller.js"
import { importSheet } from '../Controllers/UserController.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/get/:rollno',getExamByRollNo);
router.post('/create/shift', createShiftTiming);
router.post('/create/timetable', createTimetable);
router.get("/timetable",getTimetable);
router.post('/deptartment',adddepartment);
router.get('/info',authUser,getprofile)
router.get('/get/dept',getAllDepartments)
router.post('/extra',markextra);
router.put('/timetable/cancel/:id',classcancel);
router.delete("/timetable/extra/:id",deleteExtraClass);
router.get("/data",getalluserdata);
router.put("/data/:userId/role",updateUserData);
router.post('/import-sheet/:id', importSheet);
router.put("/timetable/update/:classId", updateClassField);

export default router;