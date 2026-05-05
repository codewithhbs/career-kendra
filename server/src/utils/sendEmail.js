const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",      // ✅ service ki jagah host use karo
  port: 465,
  secure: true,                // ✅ SSL
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,  // ← App Password (no spaces)
  },
});

const sendEmail = async (html, options) => {
  console.log("I am hit for sending email")
  try {
    const info = await transporter.sendMail({
      from: `"Career Kendra" <${process.env.SMTP_EMAIL}>`,
      to: options.receiver_email,
      subject: options.subject,
      html,
    });

    if (info.accepted && info.accepted.length > 0) {
      console.log("i am accepted")
      return {
        status: true,
        message: "Email sent successfully",
        messageId: info.messageId,
      };
    }

    return {
      status: false,
      message: "Email rejected",
    };

  } catch (error) {
    console.error("Email Error:", error);

    return {
      status: false,
      message: "Failed to send email",
      error: error.message,
    };
  }
};

module.exports = sendEmail;



