# Live-Alert App (API)!
Link: https://live-alert.now.sh/

## Summary
This is the backend server used to run the Live-Alert App. The data and tables are built to be utilized with PostgreSQL. To get started utilize the 'Available Scipts' section.

## Technology Used
Node, Express, PostgreSQL, Chai, Mocha, Supertest

## Available Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

Run developer database migrations `npm run migrate`
Run test database migrations `npm run migrate:test`
Run production database migrations `npm run migrate:production`
`after migrations tables need to be seeded with the seeds file`

Run deploy to heroku master `npm run deploy`

## API Documentation

Base URL: http://localhost:8000/api

HTTP Method | Path | Purpose
--- | --- | ---
GET | /users | gets all users
DELETE | /users | deletes current user
GET | /users/home | gets and displays user name
GET | /contacts | gets all user contacts
POST | /contacts | posts new contact to database
GET | /alerts | gets users alerts
POST | /alerts | posts user new alert
GET | /alerts/contact-alerts | gets users contact alerts
GET | /alerts/:alert_id | gets alert by id
PATCH | /alerts/:alert_id | patches alert_active from 'Emergency' (true) to 'Safe' (false)
POST | /auth/sign-up | posts a new user info and hashed password to users database
POST | /auth/login | posts login credentials (email/password) which is then compared to the user credentials in the users database
