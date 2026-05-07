import { createSlice } from "@reduxjs/toolkit";



const trainSlice = createSlice({
  name: 'trains',
  initialState: {
    trains: [],
    updatedTrain: null,
    coaches: [],
    selectedTrain: null,
    selectedCoachType: null,
    selectedQuota: null,
    userTrains: [],
    fare: null,
    userSource: null,
    userDestination: null,
    selectedSearch: null,
    selectedDepartureTime: null,
    selectedArrivalTime: null,
    distance: null,
    status: null,
    availability: null,
  },

  reducers: {
    setTrains: (state, action) => {
      state.trains = action.payload;
    },

    setCoaches: (state, action) => {
      state.coaches = action.payload;
    },
    setSelectedTrain: (state, action) => {
      state.selectedTrain = action.payload;
    },
    setUserTrains: (state, action) => {
      state.userTrains = action.payload;
    },
    setSelectedCoachType: (state, action) => {
      state.selectedCoachType = action.payload;
    },
    
    setSelectedQuota: (state, action) => {
      state.selectedQuota = action.payload;
    },

        setFare: (state, action) => {
      state.fare = action.payload;
    },

    setUserSource: (state, action) => {
      state.userSource = action.payload;
    },

    setUserDestination: (state, action) => {
      state.userDestination = action.payload;
    },

    setSelectedSearch: (state, action) => {
      state.selectedSearch = action.payload;
    },

    setSelectedDepatureTime: (state, action) => {
      state.selectedDepartureTime = action.payload;
    },

    setSelectedArrivalTime: (state, action) => {
      state.selectedArrivalTime = action.payload;
    },

    setDistance: (state, action) => {
      state.distance = action.payload;
    },

    setUpdatedTrain: (state, action) => {
      state.updatedTrain = action.payload;
    },

    setStatus: (state, action) => {
      state.status = action.payload;
    },

    setAvailability: (state, action) => {
      state.availability = action.payload;
    }




  }


})

export const { setTrains, setUpdatedTrain, setCoaches, setSelectedTrain, setUserTrains, setSelectedCoachType, setSelectedQuota, setFare, setUserSource, setUserDestination, setSelectedSearch, setSelectedDepatureTime, setSelectedArrivalTime, setDistance, setStatus, setAvailability } = trainSlice.actions;
export default trainSlice.reducer;
