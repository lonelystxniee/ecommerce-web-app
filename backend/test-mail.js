require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function testMail() {
    try {
        const info = await transporter.verify();
        console.log("Nodemailer Verify Success:", info);

        // Test send
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "Test Mail",
            text: "This is a test mail"
        });
        console.log("Mail sent successfully!");
    } catch (error) {
        console.error("Nodemailer Verify Failed:", error);
    }
}

testMail();
