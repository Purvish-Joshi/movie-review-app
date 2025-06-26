const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (email, name) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: '🎉 Welcome to Movie Review App!',
        html: `<h2>Hi ${name},</h2><p>Welcome aboard! Thanks for signing up. Enjoy reviewing movies with us! 🍿</p>`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendWelcomeEmail;