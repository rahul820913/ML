import React, { useState } from "react";
import axios from "axios";
import "./Exam_sch.css"; // Import external CSS

const ExamSch = () => {
    const [rollno, setRollNumber] = useState("");
    const [schedule, setSchedule] = useState([]);
    const [error, setError] = useState("");

    const getSchedule = async () => {
        if (schedule) {
            setSchedule([]);
        }
        if (!rollno) {
            alert("Please enter a Roll Number!");
            return;
        }

        try {
            const response = await axios.get(`/api/users/get/${rollno}`);
            const data = response.data;

            if (!data.success) {
                setError(data.message || "No exams found");
                setSchedule([]);
            } else {
                console.log(data.exams);
                const sortedExams = data.exams.sort((a, b) => new Date(a.date) - new Date(b.date));
                setSchedule(sortedExams);
                setError("");
            }
        } catch (error) {
            console.error("Error fetching schedule:", error);
            setError("Failed to fetch schedule. Try again later.");
        }
    };

    return (
        <div className="exam-container">
            <h2 className="exam-title">Check Exam Schedule</h2>
            <div className="form-group">
                <input
                    type="text"
                    placeholder="Enter Roll Number"
                    value={rollno}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="input-field"
                />
                <button onClick={getSchedule} className="btn btn-primary">Get Schedule</button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {schedule.length > 0 && (
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
            )}
        </div>
    );
};

export default ExamSch;
