import { createSlice } from "@reduxjs/toolkit";

const airlineSlice = createSlice({
  name: "airlines",
  initialState: {
    airlines: [],
    selectedAirline: null,
    userFlights: [],
    userQueries: null
  },
  reducers: {
    setAirlines: (state, action) => {
      state.airlines = action.payload;
    },

    setSelectedAirline: (state, action) => {
      state.selectedAirline = action.payload;
    },
    
  }
});

export const { setAirlines , setSelectedAirline} = airlineSlice.actions;
export default airlineSlice.reducer;
