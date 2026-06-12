import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

// Create a test account or replace with real credentials.
const sendMail = async (to, otp) => {
  if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
    console.error("Email credentials are missing in .env file");
    throw new Error("Email service is not configured");
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: process.env.EMAIL.trim(),
      pass: process.env.EMAIL_PASS.trim(),
    },
    tls: {
      rejectUnauthorized: false // Helps with some local network issues
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"Vistagram" <${process.env.EMAIL.trim()}>`,
      to,
      subject: "Reset Your Password",
      html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`
    });
    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Email Error:", error.message);
    throw error;
  }
}

export default sendMail