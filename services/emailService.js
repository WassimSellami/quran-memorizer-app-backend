import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { userService } from './userService.js';
import { taskService } from './taskService.js';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const emailService = {
    subscribe: async (subscription) => {
        if (subscription) {
            const user = await userService.getUserByEmail(subscription.email);
            if (user) {
                return { message: 'This email is already subscribed' }
            }
            else {
                const user = await userService.createUserByEmail(subscription.email);
                await emailService.sendWelcomeEmail(subscription.email);
                await taskService.addTasksByUserId(user.dataValues.id, subscription.csv)
                return { message: 'You have successfully subscribed!' };
            }
        }
    },

    unsubscribe: async (email) => {
        if (email) {
            const user = await userService.getUserByEmail(email);
            if (user) {
                await userService.deleteUserByEmail(email);
                await emailService.sendUnsubscribeEmail(email);
                return { message: 'You have unsubscribed successfully!' };
            }
            else {
                return { message: 'This email is already unsubscribed' }
            }
        }
    },

    sendWelcomeEmail: async (toEmail) => {
        const mailOptions = {
            from: '"Quran Memorizer"',
            to: toEmail,
            subject: 'Welcome to Quran Memorizer!',
            html: `
      <h2>Welcome!</h2>
      <p>Thanks for subscribing. We're excited to help you memorize the Quran.</p>
    `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Welcome email sent to ${toEmail}`);
        } catch (error) {
            console.error('❌ Error sending welcome email:', error);
        }
    },

    sendUnsubscribeEmail: async (toEmail) => {
        const mailOptions = {
            from: '"Quran Memorizer"',
            to: toEmail,
            subject: 'You’ve Unsubscribed',
            html: `
    <h2>Unsubscribed</h2>
    <p>You’ve successfully unsubscribed from Quran Memorizer reminders.</p>
    <p>We hope to see you again soon!</p>
  `
        };
        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Unsubscribe email sent to ${toEmail}`);
        } catch (error) {
            console.error('❌ Error sending unsubscribe email:', error);
        }
    },

    prepareReminderEmail: (toEmail, task, start, end) => {
        return {
            from: '"Quran Memorizer"',
            to: toEmail,
            subject: '🌙 Your Daily Quran Reminder',
            html: `
                <div style="margin:0; padding:24px 12px; background:linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%); font-family: Arial, Helvetica, sans-serif; color:#1f2937;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb; box-shadow:0 8px 24px rgba(15, 23, 42, 0.08);">
                        <tr>
                            <td style="padding:24px; background:linear-gradient(120deg, #0f766e, #0ea5e9); color:#ffffff; text-align:center;">
                                <h1 style="margin:0; font-size:24px; line-height:1.3;">📖 Daily Quran Reminder</h1>
                                <p style="margin:8px 0 0; font-size:15px; opacity:0.95;">A gentle step toward consistency, one day at a time ✨</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:24px;">
                                <p style="margin:0 0 16px; font-size:16px; line-height:1.6;">Assalamu alaikum! Here is your memorization task for today:</p>

                                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px; margin:0 0 16px;">
                                    <p style="margin:0 0 8px; font-size:13px; letter-spacing:0.4px; color:#475569; text-transform:uppercase;">Today's Focus 🎯</p>
                                    <h2 style="margin:0; font-size:20px; line-height:1.35; color:#0f172a;">${task}</h2>
                                </div>

                                <div style="background:#ecfeff; border:1px solid #a5f3fc; border-radius:12px; padding:14px 16px; margin:0 0 18px;">
                                    <p style="margin:0; font-size:15px; color:#0f172a;"><strong>Range:</strong> ${start} → ${end}</p>
                                </div>

                                <p style="margin:0 0 8px; font-size:15px; line-height:1.6;">You got this, inshaAllah 💪</p>
                                <p style="margin:0; font-size:15px; line-height:1.6;">May Allah put barakah in your effort and make memorization easy for you. 🤍</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:16px 24px; border-top:1px solid #e5e7eb; background:#f9fafb; text-align:center;">
                                <p style="margin:0; font-size:12px; color:#64748b;">Quran Memorizer • Small daily actions, lasting impact 🌱</p>
                            </td>
                        </tr>
                    </table>
                </div>
            `
        };
    },
    sendReminderEmail: async (userId, date) => {
        const user = await userService.getUserById(userId)
        const task = await taskService.getTaskByDateAndUserId(userId, date)
        const mailOptions = emailService.prepareReminderEmail(user.email, task.task, task.from, task.to);
        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Reminder email sent to ${user.email}`);
        } catch (error) {
            console.error('❌ Error sending reminder email:', error);
        }
    },

    sendReminders: async (date) => {
        const userIds = await userService.getAllUsersIds();
        userIds.forEach(userId => {
            emailService.sendReminderEmail(userId, date);
        });
    }
};

