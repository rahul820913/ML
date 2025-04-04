import React, { useState } from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom"
import "./Register.css"; 

const Register = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    RollNo: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); 


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const url = isRegister
        ? "/api/users/register"
        : "/api/users/login";

      const res = await axios.post(url, formData);
      const data = res.data;
      console.log(data);

      if (data.success) {
        if (isRegister) {
          setMessage("🎉 Registration successful! You can now log in.");
          setIsRegister(false);
        } else {
          localStorage.setItem("token", data.token);
          setMessage("✅ Login successful! Redirecting...");
          navigate("/");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "⚠️ Something went wrong.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">{isRegister ? "Create an Account" : "Welcome Back!"}</h2>
        <p className="register-subtitle">{isRegister ? "Sign up to get started 🚀" : "Login to continue 🔐"}</p>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <form onSubmit={handleSubmit} className="register-form">
          {isRegister && (
            <>
              <div>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="register-input"
                  required
                />
              </div>

              <div>
                <label>Roll Number</label>
                <input
                  type="text"
                  name="RollNo"
                  placeholder="12345"
                  value={formData.RollNo}
                  onChange={handleChange}
                  className="register-input"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="example@example.com"
              value={formData.email}
              onChange={handleChange}
              className="register-input"
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="register-input"
              required
            />
          </div>

          <button type="submit" className="register-btn">
            {isRegister ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="register-toggle">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Login here" : "Register here"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
