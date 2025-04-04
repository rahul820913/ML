import React, { useState, useEffect } from "react";
import axios from "axios";
import ExcelUpload from "./Exeltojson";
import "./Home.css"; // Import external CSS

const Home = () => {
    const [rollno, setRollNumber] = useState("");
    const [schedule, setSchedule] = useState([]);
    const [error, setError] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const userres = await axios.get(`/api/users/info`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!userres.data.success) {
                    console.log("User not found");
                    return;
                }

                const data = userres.data.user;
                setRollNumber(data.RollNo);
                setIsAdmin(data.role === "Admin");
            } catch (error) {
                console.error("Error fetching profile:", error);
                setError("Failed to fetch profile. Try again later.");
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (!rollno) return;

        const fetchSchedule = async () => {
            try {
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }
                const response = await axios.get(`/api/users/get/${rollno}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = response.data;

                if (!data.success) {
                    setError(data.message || "No exams found");
                    setSchedule([]);
                } else {
                    const sortedExams = data.exams.sort((a, b) => new Date(a.date) - new Date(b.date));
                    setSchedule(sortedExams);
                    setError("");
                }
            } catch (error) {
                console.error("Error fetching schedule:", error);
                setError("Failed to fetch schedule. Try again later.");
            }
        };

        fetchSchedule();
    }, [rollno]);

    return (
        <div className="home-container">
            {isAdmin && <ExcelUpload />}
            <h2 className="home-title">Your Exam Schedule</h2>
            <p className="home-rollno">Roll Number: {rollno}</p>
            {error && <p className="home-error">{error}</p>}
            <table className="exam-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Subject Code</th>
                        <th>Shift</th>
                        <th>Exam Start</th>
                        <th>Exam End</th>
                        <th>Room</th>
                    </tr>
                </thead>
                <tbody>
                    {schedule.map((exam, index) => (
                        <tr key={index}>
                            <td>{new Date(exam.date).toLocaleDateString()}</td>
                            <td>{exam.day}</td>
                            <td>{exam.coursecode}</td>
                            <td>{exam.shift}</td>
                            <td>{exam.shiftStartTime}</td>
                            <td>{exam.shiftEndTime}</td>
                            <td>{exam.roomno}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Home;
