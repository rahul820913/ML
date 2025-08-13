import React, { useEffect, useState } from "react";
import api from "../config/api.js";
import "./UserInfo.css"; 

const UserInfo = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await api.get("http://localhost:3001/api/users/data");

        if (!response.data.success) throw new Error(response.data.message);

        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const toggleRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === "Admin" ? "User" : "Admin";
      const token = localStorage.getItem("token");

      await api.put(
        `http://localhost:3001/api/users/data/${userId}/role`,
        { role: newRole }
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return (
    <div className="user-info-container">
      <h2>User Information</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roll No</th>
            <th>Department</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.RollNo}</td>
              <td>{user.department}</td>
              <td>
                <button className="toggle-btn" onClick={() => toggleRole(user._id, user.role)}>
                {user.role}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserInfo;
