// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,        
//   secure: false,    
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// export const sendOtpEmail = async (email, otp) => {
//   console.log("Using Nodemailer. Sending to:", email);

//   const info = await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "TalkStream OTP",
//     text: `Your OTP is ${otp}`,
//   });

//   console.log("Email sent:", info.response);
// };