import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name : 'auth',
    initialState : {
        users : [],
        authUser : null
    },

    reducers :{
        setAuthUser : (state, action) => {
            state.authUser = action.payload;
           },

           setUsers : (state, action) => {
            state.users = action.payload;
           },
    }

    
})

export const {setAuthUser , setUsers} = userSlice.actions;
export default userSlice.reducer;