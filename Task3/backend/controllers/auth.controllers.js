import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../config/token.js";
import sendMail from "../config/Mail.js";

// Sign Up
export const signUp = async (req, res) => {
  try {
    const { name, userName, email, password } = req.body;
     if (await User.findOne({ name }))
      return res.status(400).json({ message: "name already registered" });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });

    if (await User.findOne({ userName }))
      return res.status(400).json({ message: "Username already registered" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      userName,
      email,
      password: hashedPassword
    });

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 10*365*24*60*60*1000,
      secure: false,
      sameSite: "Strict"
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: `sign up error ${error}` });
  }
};

// Sign In
export const signIn = async (req, res) => {
  try {
    const { userName, password } = req.body;

    const user = await User.findOne({ userName });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
      secure: false,
      sameSite: "Strict"
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `sign in error ${error}` });
  }
};

// Sign Out
export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Sign Out Successfully" });
  } catch (error) {
    return res.status(500).json({ message: `sign out error ${error}` });
  }
};

// used for send otp to user

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    // Search by email OR userName
    const user = await User.findOne({
      $or: [{ email: email }, { userName: email }]
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.email) {
      return res.status(400).json({ message: "User does not have a registered email" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;

    await user.save();
    
    // Use the actual email from the user record
    await sendMail(user.email, otp);
    
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({ message: `Failed to send OTP: ${error.message}` });
  }
};

export const verifyOtp = async(req,res)=>{
  try {
    const {email,otp}=req.body
    const user = await User.findOne({email})

    if(!user || user.resetOtp!==otp || user.otpExpires<Date.now() ){
      return res.status(400).json({message:"invaild/expired otp"})
    }

    user.isOtpVerified=true
    user.resetOtp=undefined
    user.otpExpires= undefined
    await user.save()

    return res.status(200).json({message:"otp verified"})
  } catch (error) {
    return res.status(500).json({message:`verify otp error ${error}`})
  }

}

export const resetPassword = async (req,res)=>{
  try {
    const {email,password} = req.body
    const user = await User.findOne({email})
    if(!user || !user.isOtpVerified ){
      return res.status(400).json({message:"otp verification required"})
    }
 
     const hashedPassword= await bcrypt.hash(password,10)
     user.password=hashedPassword
     user.isOtpVerified=false
     await user.save()

     return res.status(200).json({message:"password reset successfully"})

  } catch (error) {
           return res.status(500).json({message:`reset otp error ${error}`}) 
  }
}
