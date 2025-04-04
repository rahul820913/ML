import React, { useState } from "react";
import axios from "axios";
import "./CreateTime.css"; 

const TimeTableCreate = ({ department, year }) => {
  const [schedule, setSchedule] = useState([]);
  const [day, setDay] = useState("");
  const [subject, setSubject] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const token = localStorage.getItem("token");

  const addOrUpdateSchedule = () => {
    if (!day || !subject || !startTime || !endTime || !room) {
      alert("Please fill all fields!");
      return;
    }

    const newEntry = { day, subject, startTime, endTime, room };

    if (editingIndex !== null) {
      const updatedSchedule = [...schedule];
      updatedSchedule[editingIndex] = newEntry;
      setSchedule(updatedSchedule);
      setEditingIndex(null);
    } else {
      setSchedule([...schedule, newEntry]);
    }

    setDay("");
    setSubject("");
    setStartTime("");
    setEndTime("");
    setRoom("");
  };

  const deleteScheduleEntry = (index) => {
    const updatedSchedule = schedule.filter((_, i) => i !== index);
    setSchedule(updatedSchedule);
  };

  const handleSubmit = async () => {
    if (!department || !year || schedule.length === 0) {
      alert("Please fill all fields and add at least one schedule entry!");
      return;
    }

    const timetableData = { department, year: Number(year), schedule };

    try {
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      await axios.post("/api/users/create/timetable", timetableData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Timetable added successfully!");
      setSchedule([]);
    } catch (error) {
      console.error("Error adding timetable:", error);
      alert("Failed to add timetable!");
    }
  };

  return (
    <div className="timetable-container">
      <h2 className="timetable-title">Admin: Add or Update Timetable</h2>
      <p><strong>Department:</strong> {department || "Not Selected"}</p>
      <p><strong>Current Academic Year:</strong> {year || "Not Selected"}</p>

      <h3 className="timetable-subtitle">Add or Edit Schedule</h3>

      <div className="form-group">
        <select className="input-field" value={day} onChange={(e) => setDay(e.target.value)}>
          <option value="" disabled>Select Day</option>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" />
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input-field" />
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="input-field" />
        <input type="text" placeholder="Room" value={room} onChange={(e) => setRoom(e.target.value)} className="input-field" />
      </div>

      <div className="button-group">
        <button className="btn btn-add" onClick={addOrUpdateSchedule}>
          {editingIndex !== null ? "Update Schedule" : "Add to Schedule"}
        </button>

        <button 
          className="btn btn-submit"
          onClick={handleSubmit} 
          disabled={!department || !year || schedule.length === 0}
        >
          Submit Timetable
        </button>
      </div>

      <h3 className="timetable-subtitle">Preview</h3>
      <ul className="schedule-list">
        {schedule.map((item, index) => (
          <li key={index} className="schedule-item">
            {`${item.day} - ${item.subject} (${item.startTime} - ${item.endTime}) in Room ${item.room}`} 
            <div className="schedule-buttons">
              <button className="btn btn-edit" onClick={() => setEditingIndex(index)}>✏️ Edit</button>
              <button className="btn btn-delete" onClick={() => deleteScheduleEntry(index)}>❌ Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TimeTableCreate;
