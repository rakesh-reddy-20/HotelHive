const nodemailer = require("nodemailer");

const sendBookingConfirmationEmail = async (to, booking) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hotelhiveofficial@gmail.com",
        pass: process.env.GMAIL_KEY,
      },
    });

    const {
      customerDetails,
      checkIn,
      checkOut,
      guests,
      listing,
      arrivalTime,
      specialRequests,
      paymentMethod,
      totalAmount,
    } = booking;

    // Format dates nicely
    const formatDate = (date) =>
      new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    const mailOptions = {
      from: `"HotelHive" <hotelhiveofficial@gmail.com>`,
      to,
      subject: "Your HotelHive Booking Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
          <h2 style="color: #2c3e50;">Hello ${customerDetails.name},</h2>
          <p style="font-size: 16px; color: #555;">
            Thank you for booking your stay with <strong>HotelHive</strong>. Here are your booking details:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Check-In Date:</strong></td>
              <td style="padding: 8px; border: 1px solid #ccc;">${formatDate(checkIn)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Check-Out Date:</strong></td>
              <td style="padding: 8px; border: 1px solid #ccc;">${formatDate(checkOut)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Number of Guests:</strong></td>
              <td style="padding: 8px; border: 1px solid #ccc;">${guests}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Arrival Time:</strong></td>
              <td style="padding: 8px; border: 1px solid #ccc;">${arrivalTime || "Not specified"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Payment Method:</strong></td>
              <td style="padding: 8px; border: 1px solid #ccc;">${paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Total Amount:</strong></td>
              <td style="padding: 8px; border: 1px solid #ccc;">₹${totalAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc; vertical-align: top;"><strong>Special Requests:</strong></td>
              <td style="padding: 8px; border: 1px solid #ccc;">${specialRequests ? specialRequests : "None"}</td>
            </tr>
          </table>

          <p style="font-size: 16px; color: #555;">
            We look forward to welcoming you soon. If you have any questions or need to make changes, please contact us.
          </p>
          <p style="margin-top: 30px; font-size: 14px; color: #aaa;">
            — HotelHive Team
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Failed to send booking confirmation email");
  }
};

module.exports = sendBookingConfirmationEmail;
