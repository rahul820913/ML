import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Exam_sch from './Components/Exam_sch';
import Navbar from './Components/Navbar';
import ClassTimeTable from './Components/ClassTimetable';
import Home from './Components/Home';
import Profile from './Components/Profile';
import Register from './Components/Register';
import './App.css'; 
import UserInfo from './Components/UserInfo';



function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Exam_sch />} />
            <Route path="/home" element={<Home />} />
            <Route path="/exam-schedule" element={<Exam_sch />} />
            <Route path="/class-timetable" element={<ClassTimeTable />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Register />} />
            <Route path= "/user-info" element={<UserInfo/>}/>
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
