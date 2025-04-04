import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileAvatar from "./ProfileAvatar";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return; 

        const response = await axios.get("/api/users/info", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          console.log(response.data.user);
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null); 
    navigate("/")
  };

  return (
    <nav style={navStyle}>
      <div style={logoStyle}>🎓 College Portal</div>
      <div style={navLinksStyle}>
        <a href="/home" style={linkStyle}>Home</a>
        <a href="/exam-schedule" style={linkStyle}>Exam Schedule</a>
        <a href="/class-timetable" style={linkStyle}>Class Time Table</a>
        {user?.role === "Admin" && <a href="/user-info" style={linkStyle}>User info</a>}
      </div>

      {user ? (
        <div style={profileContainerStyle}>
          <div onClick={() => navigate("/profile")} style={profileStyle}>
            <ProfileAvatar name={user.name} />
          </div>
          <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
        </div>
      ) : (
        <button onClick={() => navigate("/login")} style={loginButtonStyle}>Login</button>
      )}
    </nav>
  );
};

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 20px",
  backgroundColor: "#2c3e50",
  color: "white",
  fontSize: "18px",
};

const logoStyle = {
  fontWeight: "bold",
};

const navLinksStyle = {
  display: "flex",
  gap: "20px",
};

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "500",
};

const profileContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const profileStyle = {
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
};

const loginButtonStyle = {
  padding: "5px 15px",
  backgroundColor: "#3498db",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const logoutButtonStyle = {
  padding: "5px 15px",
  backgroundColor: "#e74c3c",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default Navbar;
