import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendWelcomeEmail = async (userEmail, userName) => {
    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f2937; margin-bottom: 5px;">Welcome to Buy-Bots! 🤖</h1>
                <p style="color: #6b7280; font-size: 1.1rem;">The future of robotics is here.</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h2 style="color: #000; margin: 0; font-size: 1.8rem;">Hi ${userName}! 👋</h2>
                <p style="color: #000; font-size: 1.1rem; opacity: 0.9; margin-top: 10px;">We're thrilled to have you join our elite marketplace of robot creators and collectors.</p>
            </div>

            <div style="color: #4b5563; line-height: 1.6;">
                <p>Buy-Bots is where ideas turn into physical reality. Here's what you can do right now:</p>
                <ul style="padding-left: 20px;">
                    <li><strong>Post a Project:</strong> Describe your robot dream and let experts bid.</li>
                    <li><strong>Become a Seller:</strong> Build robots for others and earn platform rewards.</li>
                    <li><strong>Chat & Collaborate:</strong> Connect directly with the world's best robot engineers.</li>
                </ul>
            </div>

            <div style="text-align: center; margin-top: 40px; margin-bottom: 30px;">
                <a href="https://buybotshari07.tech/dashboard" style="background-color: #000; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to My Dashboard 🚀</a>
            </div>

            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 40px 0 20px 0;">
            
            <div style="text-align: center; color: #9ca3af; font-size: 0.8rem;">
                <p>&copy; 2026 Buy-Bots. All rights reserved.</p>
                <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
        </div>
    `;

    const mailOptions = {
        from: `"Buy-Bots" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Welcome to the Buy-Bots Universe! 🤖🚀',
        html: htmlContent,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent: ' + info.response);
        return { success: true, info };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error };
    }
};
