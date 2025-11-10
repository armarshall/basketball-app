import axios from "axios";

export const login = async (email: string, password: string) => {
  const endpoints = [
    `http://localhost:3000/api/teenagers/check-hash`,
    `http://localhost:3000/api/guardians/check-hash`,
  ];

  // Try both teenager and guardian login endpoints
  for (const endpoint of endpoints) {
    try {
      const res = await axios.post(endpoint, { email, password });
      if (res.data.success) {
        const { user } = res.data;
        const type = endpoint.includes("guardians") ? "guardian" : "teen";
        
        // Ensure consistent ID fields for the user
        const userWithId = {
          ...user,
          _id: user._id || user.id,
          id: user.id || user._id,  
          type: type
        };
        
        // Store user data in session storage
        sessionStorage.setItem("user", JSON.stringify(userWithId));
        return true;
      }
    } catch (error) {
      console.error(`Login error for ${endpoint}:`, error);
    }
  }
  return false;
};

export const logout = () => {
  sessionStorage.removeItem("user");
};

export const get_user_data = () => {
  return sessionStorage.getItem("user") ?? null;
};