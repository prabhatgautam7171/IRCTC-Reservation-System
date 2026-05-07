import { createSlice } from "@reduxjs/toolkit";

const passengerSlice = createSlice({
    name : 'Passengers',
    initialState : {
        selectedPassengers : [],
    },
    reducers : {
        setSelectedPassengers : (state, action) => {
            state.selectedPassengers = action.payload;
        }
    }
})

export const {setSelectedPassengers} =passengerSlice.actions;
export default passengerSlice.reducer;