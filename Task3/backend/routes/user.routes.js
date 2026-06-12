import express from "express";
import { editProfile, getProfile, getCurrentUser, suggestedUsers, follow, followingList, search } from "../controllers/user.controllers.js";
import isAuth  from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js"



const userRouter = express.Router();

userRouter.get("/current", isAuth,getCurrentUser);
userRouter.get("/suggested", isAuth,suggestedUsers);
userRouter.get("/getProfile/:userName", isAuth,getProfile);
userRouter.get("/follow/:targetUserId", isAuth,follow);
userRouter.get("/followingList", isAuth,followingList);
userRouter.get("/search", isAuth,search);
userRouter.post("/editProfile", isAuth,upload.single("profileImage"),editProfile);

export default userRouter;
