import React, { useState } from "react";
import axios from "axios";
import "./Exeltojson.css"; 

const ExcelUpload = () => {
    const [file, setFile] = useState(null);
    const [shift, setShift] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const token = localStorage.getItem("token");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleCreateShiftTiming = async () => {
        if (!shift || !startTime || !endTime) {
            alert("Please fill in all shift timing details!");
            return;
        }

        try {
            if (!token) throw new Error("No authentication token found");
            const response = await axios.post("/api/users/create/shift", {
                shift,
                startTime,
                endTime,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert(response.data.message);
        } catch (error) {
            console.error("Error creating shift timing:", error);
            alert("Shift timing creation failed!");
        }
    };

    const handleUploadFile = async () => {
        if (!file) {
            alert("Please select an Excel file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("/api/users/upload", formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert(response.data.message);
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("File upload failed!");
        }
    };

    return (
        <div className="upload-container">
            <h2 className="section-title">Create Shift Timing</h2>
            <div className="form-group">
                <label className="form-label">Shift Type:</label>
                <select value={shift} onChange={(e) => setShift(e.target.value)} className="form-select">
                    <option value="">Select Shift</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Start Time:</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="form-input" />
            </div>

            <div className="form-group">
                <label className="form-label">End Time:</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="form-input" />
            </div>

            <button onClick={handleCreateShiftTiming} className="btn btn-primary">Create Shift Timing</button>

            <hr />

            <h2 className="section-title">Upload Exam Schedule</h2>
            <div className="form-group">
                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="file-input" />
            </div>
            <button onClick={handleUploadFile} className="btn btn-secondary">Upload Exam File</button>
        </div>
    );
};

export default ExcelUpload;
