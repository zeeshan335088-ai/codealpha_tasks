import { createSlice } from "@reduxjs/toolkit";

const callSlice = createSlice({
    name: "call",
    initialState: {
        isCalling: false,
        receivingCall: false,
        caller: null,
        callerSignal: null,
        callAccepted: false,
        callEnded: false,
        callType: null, // 'audio' or 'video'
        remoteUser: null,
    },
    reducers: {
        setCall: (state, action) => {
            return { ...state, ...action.payload };
        },
        resetCall: (state) => {
            state.isCalling = false;
            state.receivingCall = false;
            state.caller = null;
            state.callerSignal = null;
            state.callAccepted = false;
            state.callEnded = false;
            state.callType = null;
            state.remoteUser = null;
        },
    },
});

export const { setCall, resetCall } = callSlice.actions;
export default callSlice.reducer;
