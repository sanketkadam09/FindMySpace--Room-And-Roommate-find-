const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    // Create transporter using your Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL, // From your .env
        pass: process.env.ADMIN_EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: email,
      to: process.env.ADMIN_EMAIL,
      subject: `📬 New Contact Form Message from ${name}`,
      text: `You received a new message:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ msg: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return res.status(500).json({ msg: "Failed to send message" });
  }
});

module.exports = router;
