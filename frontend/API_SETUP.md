# Frontend API Configuration

## Overview
All backend API calls have been centralized and standardized using a custom API configuration.

## Changes Made

### 1. Created API Configuration (`src/config/api.js`)
- Centralized axios instance with base URL configuration
- Automatic token injection for authenticated requests
- Error handling and response interceptors
- Timeout configuration

### 2. Updated All Components
The following components have been updated to use the new API configuration:

- `Register.jsx` - Login/Registration API calls
- `UserInfo.jsx` - User data management
- `Navbar.jsx` - User info fetching
- `Exeltojson.jsx` - File upload and shift creation
- `Profile.jsx` - User profile data
- `ClassTimetable.jsx` - Timetable management
- `Home.jsx` - Exam schedule and user info
- `Exam_sch.jsx` - Exam schedule lookup
- `CreateTime.jsx` - Timetable creation

### 3. Environment Configuration
- Uses `VITE_API_BASE_URL` environment variable
- Defaults to `http://localhost:3000` if not set
- Can be configured for different environments (development, staging, production)

## Benefits

1. **Centralized Configuration**: All API calls use the same base URL
2. **Automatic Authentication**: Tokens are automatically included in requests
3. **Error Handling**: Consistent error handling across all components
4. **Easy Environment Switching**: Change backend URL for different environments
5. **Maintainability**: Single place to update API configuration

## Usage

### In Components
```javascript
import api from "../config/api.js";

// GET request
const response = await api.get("/api/users/info");

// POST request
const response = await api.post("/api/users/register", data);

// PUT request
const response = await api.put("/api/users/update", data);

// DELETE request
const response = await api.delete("/api/users/delete");
```

### Environment Variables
Create a `.env` file in the frontend root:
```env
VITE_API_BASE_URL=http://localhost:3000
```

## Migration Notes

- All components now use relative URLs (e.g., `/api/users/info` instead of `http://localhost:3000/api/users/info`)
- Authentication headers are automatically handled
- No need to manually include `Authorization` headers in components
- Error handling is standardized across all API calls
