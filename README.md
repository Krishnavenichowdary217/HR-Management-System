# HRMS — Human Resource Management System

A simple HR Management System built with **React**, **TypeScript**, and **Vite**.

## Features

- **Dashboard** — Organization overview with stats, recent hires, and department headcount
- **Employees** — Add, edit, delete, and search employees
- **Departments** — Manage teams and divisions
- **Leave Requests** — Submit, approve, reject, and track time-off requests
- **Payroll** — Generate monthly payroll, manage salaries, bonuses, and deductions
- **Recruitment** — Post job openings and track applicants through the hiring pipeline

Data is persisted in the browser via `localStorage`, so no backend is required to get started.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

- React 19
- React Router
- TypeScript
- Vite

## Project Structure

```
src/
├── components/     # Layout, Sidebar, Modal
├── context/        # HR state management (HRContext)
├── pages/          # Dashboard, Employees, Departments, Leave, Payroll, Recruitment
├── types/          # TypeScript interfaces
└── utils/          # localStorage helpers
```
