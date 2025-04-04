import React, { useEffect, useState } from "react";
import axios from "axios";
import ProfileAvatar from "./ProfileAvatar";
import "./Profile.css"; // Import external CSS

const Profile = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get("/api/users/info", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <ProfileAvatar name={user.name} className="profile-avatar" />
      <div className="profile-info">
        <div>
          <p><strong>Name:</strong> </p>
          <p>{user.name}</p>
        </div>
        <div>
          <p><strong>Email:</strong> </p> 
          <p> {user.email}</p>
        </div>
        <div>
          <p><strong>Roll No:</strong> </p> 
          <p> {user.RollNo}</p>
        </div>
        <div>
          <p><strong>Department:</strong> </p> 
          <p> {user.department}</p>
        </div>
        <div>
          <p><strong>Current Year:</strong> </p> 
          <p>{user.currentyear}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
