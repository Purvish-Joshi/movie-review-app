const nodemailer = require("nodemailer");

const sendWelcomeEmail = async (email, name) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "🎬 Welcome to Movie Review App!",
    html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
                <div style="text-align: center;">
                    <img src="https://res.cloudinary.com/dens3gpmw/image/upload/v1751092396/watching-a-movie_udob5d.png" width="64" alt="logo" />
                    <h2 style="color: #3A3A3A;">Hi ${name},</h2>
                    <p>🎉 Welcome aboard to <strong>Movie Review App</strong>!</p>
                </div>
                <p>We’re thrilled to have you join our community of movie lovers. Start sharing your reviews and discovering what others are saying about your favorite films 🍿</p>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="https://movie-review-app-blush.vercel.app" style="background-color: #e50914; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Get Started</a>
                </div>
                <p style="margin-top: 30px; font-size: 12px; color: #555;">If you did not sign up for this account, you can safely ignore this email.</p>
            </div>
        `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendWelcomeEmail;
