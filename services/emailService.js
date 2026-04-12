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
            subject: '🎯 مهمة الحفظ اليوم',
            html: `
                <div dir="rtl" lang="ar" style="margin:0; padding:14px 8px; background:#f1f5f9; font-family: Tahoma, Arial, sans-serif; color:#0f172a; text-align:right;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0;">
                        <tr>
                            <td style="padding:14px 16px; background:#0f766e; color:#ffffff;">
                                <p style="margin:0; font-size:14px; font-weight:700;">🎯 هدف الحفظ اليوم</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:16px;">
                                <h1 style="margin:0 0 12px; font-size:26px; line-height:1.25; color:#0f172a;">${task}</h1>
                                <p style="margin:0 0 12px; font-size:16px; color:#1e293b;"><strong>المقطع:</strong> ${start} ← ${end}</p>
                                <p style="margin:0; font-size:14px; color:#334155;">السلام عليكم، خطوة اليوم بسيطة ومهمة. ثابر وبإذن الله ستنجح 💪</p>
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

