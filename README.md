# Quran Memorizer App — Backend

A Node.js/Express REST API that generates personalized Quran memorization plans based on user preferences, sends scheduled email reminders, and supports plan export to CSV.

**Live app:** [quran-memorizer-app-frontend.onrender.com](https://quran-memorizer-app-frontend.onrender.com) • [Frontend repo](https://github.com/WassimSellami/quran-memorizer-app-frontend)

## Features

- **Memorization Plan Generator** – Creates a personalized schedule based on user preferences using Google Generative AI
- **Email Reminders** – Scheduled notifications to keep users on track (node-cron + nodemailer)
- **CSV Export** – Download the memorization plan as a CSV file

## Tech Stack

| Layer      | Technology                 |
|------------|----------------------------|
| Runtime    | Node.js + Express          |
| Database   | PostgreSQL (Sequelize ORM) |
| AI         | Google Generative AI       |
| Email      | nodemailer                 |
| Scheduling | node-cron                  |
| Config     | dotenv                     |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Installation

```bash
git clone https://github.com/WassimSellami/quran-memorizer-app-backend.git
cd quran-memorizer-app-backend
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL=
GEMINI_API_KEY=
MODEL_NAME=
EMAIL_USER=
EMAIL_PASS=
```

### Run

```bash
node server.js
```

## Frontend

[https://github.com/WassimSellami/quran-memorizer-app-frontend](https://github.com/WassimSellami/quran-memorizer-app-frontend)
