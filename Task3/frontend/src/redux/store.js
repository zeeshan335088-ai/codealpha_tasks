import {configureStore} from "@reduxjs/toolkit"
import userSlice from "./userSlice"
import postSlice from "./postSlice"
import storySlice from "./storySlice"
import loopSlice from "./loopSlice"
import messageSlice from "./messageSlice"
import socketSlice from "./socketSlice"
import callSlice from "./callSlice"
const store = configureStore({
    reducer:{
      user:userSlice,
      post:postSlice,
      story:storySlice,
      loop:loopSlice,
      message:messageSlice,   
      socket:socketSlice,
      call:callSlice
     },
     middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;