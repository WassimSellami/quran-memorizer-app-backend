import express from 'express';
import cors from 'cors';
import gptRoutes from './routes/gptRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import cron from 'node-cron';
import { emailService } from './services/emailService.js';
import {
    DAILY_REMINDER_CRON,
    GERMANY_TIMEZONE,
} from './utils/constants.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/gpt', gptRoutes);
app.use('/api/email', emailRoutes);

app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// cron.schedule('*/20 * * * * *', () => {
cron.schedule(DAILY_REMINDER_CRON, () => {
    const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: GERMANY_TIMEZONE,
    }).format(new Date());
    console.log(`Sending reminder for ${today}...`);
    emailService.sendReminders(today);
}, { timezone: GERMANY_TIMEZONE });

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
