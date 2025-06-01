const nodemailer = require("nodemailer");

const sendOTPEmail = async (to, name, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hotelhiveofficial@gmail.com",
        pass: process.env.GMAIL_KEY,
      },
    });

    const mailOptions = {
      from: `"HotelHive" <hotelhiveofficial@gmail.com>`,
      to,
      subject: "HotelHive Booking OTP Verification 🔐",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
          <h2 style="color: #2c3e50;">Hello ${name},</h2>
          <p style="font-size: 16px; color: #555;">
            You are one step away from booking your stay at <strong>HotelHive</strong>.
          </p>
          <p style="font-size: 16px; color: #555;">Please enter the following OTP to confirm your booking:</p>
          <div style="font-size: 24px; font-weight: bold; color:rgb(0, 0, 0); margin: 20px 0;">${otp}</div>
          <p style="font-size: 14px; color: #888;">
            This OTP is valid for 10 minutes. If you did not initiate this request, please ignore this email.
          </p>
          <p style="margin-top: 30px; font-size: 14px; color: #aaa;">
            — HotelHive Team
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

module.exports = sendOTPEmail;
