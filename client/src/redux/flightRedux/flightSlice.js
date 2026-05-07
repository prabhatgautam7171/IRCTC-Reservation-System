import { createSlice } from "@reduxjs/toolkit";

const flightSlice = createSlice({
  name: "flights",
  initialState: {
    flights: [],

      selectedOnward: null,
      selectedReturn: null,
      selectedOnwardAircraft : null,
      selectedReturnAircraft : null,
      selectedFlight : null,
    selectedAircraft : null,
    userFlights: [],
    userQueries: null
  },
  reducers: {
    setFlights: (state, action) => {
      state.flights = action.payload;
    },
    setSelectedFlight: (state, action) => {
      state.selectedFlight = action.payload;
    },
    setSelectedAircraft: (state, action) => {
      state.selectedAircraft = action.payload;
    },
    setUserFlights: (state, action) => {
      state.userFlights = action.payload;
    },
    setUserQueries: (state, action) => {
      state.userQueries = action.payload; // ✅ fixed
    },
    setSelectedOnward: (state, action) => {
      state.selectedOnward= action.payload; // ✅ fixed
    },
    setSelectedReturn: (state, action) => {
      state.selectedReturn= action.payload; // ✅ fixed
    },
    setSelectedOnwardAircraft: (state, action) => {
      state.selectedOnwardAircraft= action.payload; // ✅ fixed
    },
    setSelectedReturnAircraft: (state, action) => {
      state.selectedReturnAircraft= action.payload; // ✅ fixed
    }
  }
});

export const { setFlights, setSelectedFlight, setSelectedOnward,  setSelectedOnwardAircraft, setSelectedReturnAircraft, setSelectedReturn, setSelectedAircraft , setUserFlights, setUserQueries } = flightSlice.actions;
export default flightSlice.reducer;
