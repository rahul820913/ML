import React, { useEffect, useState } from "react";
import api from "../config/api.js";
import TimeTableCreate from "./CreateTime";
import "./ClassTimeTable.css";

const ClassTimeTable = () => {
  const [timetable, setTimetable] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [year, setYear] = useState("");
  const [department, setDepartment] = useState("");
  const [editDay, setEditDay] = useState(null);
  const [extraClassDetails, setExtraClassDetails] = useState({
    subject: "",
    startTime: "",
    endTime: "",
    room: ""
  });

  // New states for inline editing
  const [editingClassId, setEditingClassId] = useState(null);
  const [editingField, setEditingField] = useState("");
  const [tempValue, setTempValue] = useState("");

  const token = localStorage.getItem("token");

  // Fetch logged-in user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!token) return;
      try {
        const { data } = await api.get("http://localhost:3001/api/users/info");
        if (data.success && data.user) {
          const { currentyear, department, role } = data.user;
          setYear(currentyear);
          setDepartment(department);
          setIsAdmin(role === "Admin");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, [token]);

  // Fetch timetable
  useEffect(() => {
    const fetchTimetable = async () => {
      if (!token || !year || !department) return;
      try {
        const { data } = await api.get(
          `http://localhost:3001/api/users/timetable?year=${year}&department=${department}`
        );
        if (data.success && Array.isArray(data.data)) {
          setTimetable(data.data);
        } else {
          setTimetable([]);
        }
      } catch (error) {
        console.error("Error fetching timetable:", error);
        setTimetable([]);
      }
    };
    fetchTimetable();
  }, [year, department, token]);

  // Add extra class
  const addExtraClass = async (day) => {
    const { subject, startTime, endTime, room } = extraClassDetails;
    if (!subject || !startTime || !endTime || !room) {
      alert("Please fill in all details for the extra class.");
      return;
    }
    const newClass = {
      day,
      subjectCode: subject,
      startTime,
      endTime,
      room,
      status: "Extra Class",
      year,
      department
    };
    try {
      const { data } = await api.post("http://localhost:3001/api/users/extra", newClass);
      if (data.success) {
        alert(`Extra class added for ${day}`);
        setTimetable((prev) => [...prev, { ...newClass, _id: data.id || Date.now().toString() }]);
        setEditDay(null);
        setExtraClassDetails({ subject: "", startTime: "", endTime: "", room: "" });
      }
    } catch (error) {
      console.error("Error adding extra class:", error);
    }
  };

  // Update class status
  const updateClassStatus = async (classId, status) => {
    try {
      const { data } = await api.put(
        `http://localhost:3001/api/users/timetable/cancel/${classId}`,
        { status }
      );
      if (data.success) {
        alert(`Class status updated to ${status}`);
        setTimetable((prev) =>
          prev.map((c) => (c._id === classId ? { ...c, status } : c))
        );
      }
    } catch (error) {
      console.error("Error updating class status:", error);
    }
  };

  // Delete extra class
  const deleteExtraClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this extra class?")) return;
    try {
      const { data } = await api.delete(
        `http://localhost:3001/api/users/timetable/extra/${classId}`
      );
      if (data.success) {
        alert("Extra class deleted successfully!");
        setTimetable((prev) => prev.filter((c) => c._id !== classId));
      }
    } catch (error) {
      console.error("Error deleting extra class:", error);
    }
  };

  // NEW: Update a single field
  const updateClassField = async (classId, field, value) => {
    try {
      const { data } = await api.put(
        `http://localhost:3001/api/users/timetable/update/${classId}`,
        { [field]: value }
      );
      if (data.success) {
        setTimetable((prev) =>
          prev.map((c) => (c._id === classId ? { ...c, [field]: value } : c))
        );
      }
    } catch (error) {
      console.error("Error updating class field:", error);
    }
  };

  // Group timetable by day
  const groupedTimetable = (Array.isArray(timetable) ? timetable : []).reduce(
    (acc, item) => {
      if (!acc[item.day]) acc[item.day] = [];
      acc[item.day].push(item);
      acc[item.day].sort(
        (a, b) =>
          new Date(`1970-01-01T${a.startTime}`) -
          new Date(`1970-01-01T${b.startTime}`)
      );
      return acc;
    },
    {}
  );

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
                <button
                  className="add-class-btn"
                  onClick={() => setEditDay(editDay === day ? null : day)}
                >
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
                  onChange={(e) =>
                    setExtraClassDetails({ ...extraClassDetails, subject: e.target.value })
                  }
                />
                <input
                  type="time"
                  value={extraClassDetails.startTime}
                  onChange={(e) =>
                    setExtraClassDetails({ ...extraClassDetails, startTime: e.target.value })
                  }
                />
                <input
                  type="time"
                  value={extraClassDetails.endTime}
                  onChange={(e) =>
                    setExtraClassDetails({ ...extraClassDetails, endTime: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Room"
                  value={extraClassDetails.room}
                  onChange={(e) =>
                    setExtraClassDetails({ ...extraClassDetails, room: e.target.value })
                  }
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
                    {/* Editable Subject */}
                    <td
                      onClick={() => {
                        if (isAdmin) {
                          setEditingClassId(classInfo._id);
                          setEditingField("subjectCode");
                          setTempValue(classInfo.subjectCode);
                        }
                      }}
                    >
                      {editingClassId === classInfo._id && editingField === "subjectCode" ? (
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => {
                            updateClassField(classInfo._id, "subjectCode", tempValue);
                            setEditingClassId(null);
                            setEditingField("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              updateClassField(classInfo._id, "subjectCode", tempValue);
                              setEditingClassId(null);
                              setEditingField("");
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        classInfo.subjectCode
                      )}
                    </td>

                    <td
                        onClick={() => {
                          if (isAdmin) {
                            setEditingClassId(classInfo._id);
                            setEditingField("startTime");
                            setTempValue(classInfo.startTime);
                          }
                        }}
                      >
                        {editingClassId === classInfo._id && editingField === "startTime" ? (
                          <input
                            type="time"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => {
                              updateClassField(classInfo._id, "startTime", tempValue);
                              setEditingClassId(null);
                              setEditingField("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                updateClassField(classInfo._id, "startTime", tempValue);
                                setEditingClassId(null);
                                setEditingField("");
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          classInfo.startTime
                        )}
                      </td>

                      {/* Editable End Time */}
                      <td
                        onClick={() => {
                          if (isAdmin) {
                            setEditingClassId(classInfo._id);
                            setEditingField("endTime");
                            setTempValue(classInfo.endTime);
                          }
                        }}
                      >
                        {editingClassId === classInfo._id && editingField === "endTime" ? (
                          <input
                            type="time"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => {
                              updateClassField(classInfo._id, "endTime", tempValue);
                              setEditingClassId(null);
                              setEditingField("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                updateClassField(classInfo._id, "endTime", tempValue);
                                setEditingClassId(null);
                                setEditingField("");
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          classInfo.endTime
                        )}
                      </td>

                    {/* Editable Room */}
                    <td
                      onClick={() => {
                        if (isAdmin) {
                          setEditingClassId(classInfo._id);
                          setEditingField("room");
                          setTempValue(classInfo.room);
                        }
                      }}
                    >
                      {editingClassId === classInfo._id && editingField === "room" ? (
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => {
                            updateClassField(classInfo._id, "room", tempValue);
                            setEditingClassId(null);
                            setEditingField("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              updateClassField(classInfo._id, "room", tempValue);
                              setEditingClassId(null);
                              setEditingField("");
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        classInfo.room
                      )}
                    </td>

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
                            <button
                              className="cancel-btn"
                              onClick={() => deleteExtraClass(classInfo._id)}
                            >
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
                              <button
                                className="cancel-btn"
                                onClick={() => deleteExtraClass(classInfo._id)}
                              >
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
