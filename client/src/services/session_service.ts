import axios from "axios";

export const login = async (email: string, password: string) => {
  const endpoints = [
    `http://localhost:3000/api/teenagers/check-hash`,
    `http://localhost:3000/api/guardians/check-hash`,
  ];

  for (const endpoint of endpoints) {
    const res = await axios.post(endpoint, {
      email: email,
      password: password,
    });

    if (res.data.success) {
      // Create user session
      const { user } = res.data;
      sessionStorage.setItem("user", JSON.stringify(user));
      return true;
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
