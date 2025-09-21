// Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// API Base URL for Firebase Functions
export const API_BASE_URL = import.meta.env.PROD 
  ? `https://${firebaseConfig.projectId}.web.app/api`
  : 'http://localhost:5001/your-project-id/us-central1/api';

export default firebaseConfig;