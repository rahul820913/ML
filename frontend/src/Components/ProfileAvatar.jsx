import React from "react";
import "./ProfileAvatar.css"; 

const ProfileAvatar = ({ name }) => {
    const initial = name ? name.charAt(0).toUpperCase() : "U";
    const colors = ["bg-red", "bg-green", "bg-blue", "bg-purple", "bg-yellow"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return (
        <div className={`avatar-container ${randomColor}`}>
            {initial}
        </div>
    );
};

export default ProfileAvatar;
