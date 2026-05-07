// src/utils/trainData.js

import axios from "axios";

export const getAllTrains = async () => {
  try {
    const response = await axios.get("http://localhost:8000/api/v1/train/get-Alltrains");
    console.log('these are all trains :',response.data.allTrains);
    return response.data.allTrains || []; // failsafe return if undefined
  } catch (error) {
    console.error("❌ Failed to fetch trains:", error.message);
    return []; // avoid breaking on failure
  }
};
