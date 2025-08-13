// Frontend configuration
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  
  // App Configuration
  APP_NAME: 'College Portal',
  
  // Routes
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile',
    HOME_PAGE: '/home',
    EXAM_SCHEDULE: '/exam-schedule',
    CLASS_TIMETABLE: '/class-timetable',
    USER_INFO: '/user-info'
  }
};

export default config;
