import React, { useEffect, useState } from "react";
import axios from "axios";
import TimeTableCreate from "./CreateTime";
import "./ClassTimeTable.css";

const ClassTimeTable = () => {
  const [timetable, setTimetable] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [year, setYear] = useState();
  const [department, setDepartment] = useState();
  const [editDay, setEditDay] = useState(null);
  const [extraClassDetails, setExtraClassDetails] = useState({ subject: "", startTime: "", endTime: "", room: "" });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!token) return;
        const userRes = await axios.get("/api/users/info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.data.success) {
          const user = userRes.data.user;
          setYear(user.currentyear);
          setDepartment(user.department);
          setIsAdmin(user.role === "Admin");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, [token]);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        if (!token || !year || !department) return;
        const timetableRes = await axios.get(
          `/api/users/timetable?year=${year}&department=${department}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTimetable(timetableRes.data);
      } catch (error) {
        console.error("Error fetching timetable:", error);
      }
    };
    fetchTimetable();
  }, [year, department, token]);

  const addExtraClass = async (day) => {
    if (!extraClassDetails.subject || !extraClassDetails.startTime || !extraClassDetails.endTime || !extraClassDetails.room) {
      alert("Please fill in all details for the extra class.");
      return;
    }
    const newClass = {
      day,
      subjectCode: extraClassDetails.subject,
      startTime: extraClassDetails.startTime,
      endTime: extraClassDetails.endTime,
      room: extraClassDetails.room,
      status: "Extra Class",
      year,
      department,
    };
    try {
      await axios.post("/api/users/extra", newClass, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Extra class added for ${day}`);
      setTimetable((prev) => [...prev, newClass]);
      setEditDay(null);
      setExtraClassDetails({ subject: "", startTime: "", endTime: "", room: "" });
    } catch (error) {
      console.error("Error adding extra class:", error);
    }
  };

  const updateClassStatus = async (classId, status) => {
    try {
      const response = await axios.put(
        `/api/users/timetable/cancel/${classId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        alert(`Class status updated to ${status}`);
        setTimetable((prev) =>
          prev.map((classInfo) => (classInfo._id === classId ? { ...classInfo, status } : classInfo))
        );
      }
    } catch (error) {
      console.error("Error updating class status:", error);
    }
  };

  const deleteExtraClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this extra class?")) return;
    try {
      const response = await axios.delete(
        `/api/users/timetable/extra/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        alert("Extra class deleted successfully!");
        setTimetable((prev) => prev.filter((classInfo) => classInfo._id !== classId));
      }
    } catch (error) {
      console.error("Error deleting extra class:", error);
    }
  };

  const groupedTimetable = timetable.reduce((acc, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    acc[item.day].push(item);
    acc[item.day].sort((a, b) => new Date(`1970-01-01T${a.startTime}`) - new Date(`1970-01-01T${b.startTime}`));
    return acc;
  }, {});

  return (
    <div className="timetable-container">
      {isAdmin && (
        <div className="admin-section">
          <h1>Create Time Table</h1>
          <TimeTableCreate department={department} year={year} />
        </div>
      )}

      <h2>Class Time Table</h2>
      <div className="timetable-grid">
        {Object.keys(groupedTimetable).map((day) => (
          <div key={day} className="day-section">
            <div className="day-header">
              <h3>{day}</h3>
              {isAdmin && (
                <button className="add-class-btn" onClick={() => setEditDay(editDay === day ? null : day)}>
                  ➕ Mark Extra Class
                </button>
              )}
            </div>

            {editDay === day && (
              <div className="extra-class-form">
                <input
                  type="text"
                  placeholder="Subject Code"
                  value={extraClassDetails.subject}
                  onChange={(e) => setExtraClassDetails({ ...extraClassDetails, subject: e.target.value })}
                />
                <input
                  type="time"
                  value={extraClassDetails.startTime}
                  onChange={(e) => setExtraClassDetails({ ...extraClassDetails, startTime: e.target.value })}
                />
                <input
                  type="time"
                  value={extraClassDetails.endTime}
                  onChange={(e) => setExtraClassDetails({ ...extraClassDetails, endTime: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Room"
                  value={extraClassDetails.room}
                  onChange={(e) => setExtraClassDetails({ ...extraClassDetails, room: e.target.value })}
                />
                <button className="confirm-btn" onClick={() => addExtraClass(day)}>
                  Confirm Extra Class
                </button>
                <button className="cancel-btn" onClick={() => setEditDay(null)}>
                  Cancel
                </button>
              </div>
            )}

            <table className="timetable-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Room</th>
                  <th>Status</th>
                  {isAdmin && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {groupedTimetable[day].map((classInfo) => (
                  <tr
                    key={classInfo._id}
                    className={
                      classInfo.status === "Cancelled"
                        ? "cancelled"
                        : classInfo.status === "Extra Class"
                        ? "extra-class"
                        : ""
                    }
                  >
                    <td>{classInfo.subjectCode}</td>
                    <td>{classInfo.startTime}</td>
                    <td>{classInfo.endTime}</td>
                    <td>{classInfo.room}</td>
                    <td>{classInfo.status}</td>
                    {isAdmin && (
                      <td>
                        {classInfo.status === "Cancelled" ? (
                          <>
                            <button
                              className="confirm-btn"
                              onClick={() => updateClassStatus(classInfo._id, "Scheduled")}
                            >
                              ✅ Mark Scheduled
                            </button>
                            <button className="cancel-btn" onClick={() => deleteExtraClass(classInfo._id)}>
                              🗑 Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="cancel-btn"
                              onClick={() => updateClassStatus(classInfo._id, "Cancelled")}
                            >
                              ❌ Cancel
                            </button>
                            {classInfo.status === "Extra Class" && (
                              <button className="cancel-btn" onClick={() => deleteExtraClass(classInfo._id)}>
                                🗑 Delete
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassTimeTable;
