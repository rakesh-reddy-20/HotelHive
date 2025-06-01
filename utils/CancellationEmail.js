const nodemailer = require("nodemailer");

const CancellationEmail = async (to, booking) => {
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
      arrivalTime,
      paymentMethod,
      totalAmount,
    } = booking;

    const formatDate = (date) =>
      new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    const mailOptions = {
      from: `"HotelHive" <hotelhiveofficial@gmail.com>`,
      to,
      subject: "Your HotelHive Booking Has Been Cancelled",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
          <h2 style="color: #c0392b;">Dear ${customerDetails.name},</h2>
          <p style="font-size: 16px; color: #555;">
            Your booking at <strong>HotelHive</strong> has been <span style="color: #c0392b;"><strong>successfully cancelled</strong></span>.
          </p>

          <p style="margin-bottom: 10px;">Here are the details of the cancelled booking:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Hotel Name:</strong></td>
              <td style="padding: 8px; border: 1px solid #ccc;">${booking.listing?.title || "HotelHive Property"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Check-In Date:</strong></td>
              <td style="padding: 8px; border: 1px solid #ccc;">${formatDate(checkIn)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Check-Out Date:</strong></td>
              <td style="padding: 8px; border: 1px solid #ccc;">${formatDate(checkOut)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Guests:</strong></td>
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
          </table>

          <p style="font-size: 16px; color: #555;">
  We're sorry to see you cancel your booking. If this was unintentional or you wish to rebook, we would be happy to welcome you again. Refunds will be processed as follows:
</p>

<ul style="font-size: 15px; color: #555; padding-left: 20px;">
  <li><strong>UPI Payments:</strong> Refunds will be credited to your UPI-linked bank account within <strong>1–2 working days</strong>.</li>
  <li><strong>Credit Card Payments:</strong> Refunds may take up to <strong>2–5 working days</strong> depending on your card issuer's processing time.</li>
</ul>

<p style="font-size: 16px; color: #555;">
  For any questions or assistance, feel free to reach out to our support team.
</p>


          <p style="margin-top: 30px; font-size: 14px; color: #aaa;">
            — HotelHive Team
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    throw new Error("Failed to send cancellation email");
  }
};

module.exports = CancellationEmail;
