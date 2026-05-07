import { createSlice } from "@reduxjs/toolkit";

const bookingSlice = createSlice({
    name : "bookings",
    initialState : {
        bookings : []
    },
    reducers : {
        setBookings : (state, action) => {
            state.bookings = action.payload;
        },
        updateBooking: (state, action) => {
            const index = state.bookings.findIndex(b => b._id === action.payload._id);
            if(index !== -1) state.bookings[index] = action.payload;
          }
    }
})

export const {setBookings, updateBooking } = bookingSlice.actions;
export default bookingSlice.reducer;