import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
    name : 'admin',
    initialState : {
        admins : [],
        isAdmin : false,
        AdminName : null
    },

    reducers :{
        
           setAdmin : (state, action) => {
            state.isAdmin = action.payload;
           },

           setAdminName : (state, action) => {
            state.AdminName = action.payload;
           },
    }


})

export const {setAuthUser , setAdmin ,setAdminName} = adminSlice.actions;
export default adminSlice.reducer;
