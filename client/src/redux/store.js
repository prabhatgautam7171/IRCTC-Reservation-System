import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import { combineReducers } from 'redux';

import userReducer from './userSlice';
import trainReducer from './trainSlice';
import bookingReducer from './bookingSlice'
import passengerReducer from './passengerSlice'
import adminReducer from './adminSlice';
import flightReducer from './flightRedux/flightSlice'
import airlineReducer from './flightRedux/airlineSlice'

const persistConfig = {
  key: 'root',
  storage,
};

const rootReducer = combineReducers({
  user: userReducer,
  admin : adminReducer,
  trains: trainReducer,
  bookings : bookingReducer,
  passengers : passengerReducer,
  flights : flightReducer,
  airlines : airlineReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

export const persistor = persistStore(store);
export default store;
