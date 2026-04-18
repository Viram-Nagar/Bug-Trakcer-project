import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import projectReducer from "../features/projects/projectSlice";
import ticketReducer from "../features/tickets/ticketSlice";
import commentReducer from "../features/comments/commentSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tickets: ticketReducer,
    comments: commentReducer,
  },
  devTools: import.meta.env.MODE !== "production",
});

export default store;
