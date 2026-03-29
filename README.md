# Quran Memorizer App — Backend

A Node.js/Express REST API for the Quran Memorizer App. It handles user management, Quran memorization tracking, AI-assisted features via Google Generative AI, and scheduled email reminders.

**Live app:** [quran-memorizer-app-frontend.onrender.com](https://quran-memorizer-app-frontend.onrender.com) • [Frontend repo](https://github.com/WassimSellami/quran-memorizer-app-frontend)

## Features

- **Memorization Tracking** – CRUD API for managing memorized Quran verses per user
- **AI Assistant** – Google Generative AI integration to help with memorization
- **Email Reminders** – Scheduled reminders via node-cron and nodemailer
- **CSV Import** – Bulk import of verse data via csv-parse
- **PostgreSQL Database** – Sequelize ORM with PostgreSQL

## Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Runtime       | Node.js                           |
| Framework     | Express                           |
| Database      | PostgreSQL (Sequelize ORM)        |
| AI            | Google Generative AI              |
| Email         | nodemailer                        |
| Scheduling    | node-cron                         |
| Config        | dotenv                            |

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
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASS=
GEMINI_API_KEY=
EMAIL_USER=
EMAIL_PASS=
CORS_ORIGIN=
PORT=3000
```

### Run

```bash
node server.js
```

## Frontend

This backend serves the Quran Memorizer frontend:
[https://github.com/WassimSellami/quran-memorizer-app-frontend](https://github.com/WassimSellami/quran-memorizer-app-frontend)
