import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export const getRules = async () => {
  const response = await axios.get(`${API_BASE_URL}/rules`);
  return response.data;
};

export const updateRules = async (content: string, guardianId: string) => {
  const response = await axios.put(`${API_BASE_URL}/rules`, {
    content,
    guardianId,
  });
  return response.data;
};

