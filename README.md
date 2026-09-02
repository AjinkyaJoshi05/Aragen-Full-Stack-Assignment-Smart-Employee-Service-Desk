# Smart Employee Service Desk & Ticket Management Portal

## Project Overview

Smart Employee Service Desk is a full-stack portal for logging, tracking, assigning, and resolving internal support requests. It provides ticket filtering, details with resolution history, dashboard summaries, and a lightweight role-based user interface backed by Microsoft SQL Server.

The application includes a profile selector populated from the `Users` table. It is a demo-level role switcher stored in browser local storage; it is **not** authentication and does not provide login, passwords, sessions, or access control middleware.

## Features

- Create and track support tickets
- Filter tickets by category, priority, status, and text search
- View ticket details, submitter, assignee, and resolution history
- Update ticket status and priority
- Add resolution notes and close tickets
- Assign or unassign tickets using `AssignedToUserId`
- Dashboard summaries grouped by ticket status, priority, and category
- SQL Server persistence for users, categories, tickets, and comments
- Closed tickets are presented as locked and protected from general ticket updates

## Role-Based Access

| Role | Ticket creation and viewing | Dashboard | Management actions | Assignment |
| --- | --- | --- | --- | --- |
| Employee | Create and view/track tickets | No | No status, priority, note, or close actions | No |
| Support Staff | Create and view tickets | Yes | Update status/priority, add notes, and close tickets | No |
| Manager | Create and view tickets | Yes | Update status/priority, add notes, and close tickets | Yes; assign or reassign to Support Staff users |

Assignment options are sourced from the database and filtered by the actual `Role === "Support Staff"` value. The profile selector is for demonstration only and is not a real authorization boundary.

## Tech Stack

- Frontend: React 19, React DOM, Vite, Lucide React
- Backend: Node.js, Express 4, CORS, dotenv
- Database: Microsoft SQL Server via `mssql` and `msnodesqlv8`
- Development tooling: Nodemon, Oxlint, `@vitejs/plugin-react`
- Module system: ES Modules

## System Architecture

```text
React + Vite frontend
        |
        | HTTP JSON (/api by default)
        v
Express API
  ├── Ticket, category, dashboard, user, and health routes
  ├── Validation and centralized error handling
  └── Services
        |
        v
Microsoft SQL Server (ServiceDeskDB)
```

## Project Structure

```text
.
├── backend/
│   ├── database/          # SQL Server schema and seed data
│   └── src/
│       ├── config/        # database pool configuration
│       ├── controllers/   # HTTP handlers
│       ├── middleware/    # validation and error handling
│       ├── routes/        # Express routes
│       ├── services/      # SQL Server operations
│       ├── setup-db.js    # one-time database initialization
│       ├── test-api.js
│       ├── test-db.js
│       └── test-e2e.js
├── frontend/
│   └── src/
│       ├── components/    # dashboard, ticket, navbar, and UI components
│       ├── services/      # API client
│       └── App.jsx
└── README.md
```

## Database Schema / Tables

The SQL Server database is named `ServiceDeskDB`.

| Table | Purpose | Key relationships |
| --- | --- | --- |
| `Users` | Demo users with name, email, role, and creation date | Referenced by ticket creator and assignee fields |
| `Categories` | Available ticket categories | Used by the UI; ticket category is stored as text on `Tickets` |
| `Tickets` | Ticket title, description, category, priority, status, dates, creator, and assignee | `CreatedByUserId` and `AssignedToUserId` optionally reference `Users.UserId` |
| `Comments` | Resolution notes/history | `TicketId` references `Tickets.TicketId` with `ON DELETE CASCADE` |

`Tickets.Priority` is constrained to `High`, `Medium`, or `Low`. `Tickets.Status` is constrained to `Open`, `In Progress`, `Resolved`, or `Closed`.

## Environment Variables

Copy the provided example files before running the app. Keep real credentials in local `.env` files only.

### Backend (`backend/.env`)

| Variable | Purpose |
| --- | --- |
| `PORT` | API port; defaults to `5000` |
| `NODE_ENV` | Runtime environment |
| `DB_CONNECTION_STRING` | Optional SQL Server ODBC connection string; takes precedence when set |
| `DB_SERVER` | SQL Server host for object-based configuration |
| `DB_NAME` | Database name; defaults to `ServiceDeskDB` |
| `DB_USER` | SQL Server user |
| `DB_PASSWORD` | SQL Server password |
| `DB_PORT` | SQL Server port; defaults to `1433` |
| `DB_ENCRYPT` | Set to `true` when encryption is required |
| `DB_TRUST_SERVER_CERTIFICATE` | Set to `true` for trusted local development certificates |
| `DB_CONNECTION_STRING_APP` | Application-database connection string used by the one-time setup script |

### Frontend (`frontend/.env`)

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base URL; defaults to `http://localhost:5000/api` |

## Installation and Setup

Prerequisites: Node.js, npm, Microsoft SQL Server, and the SQL Server ODBC driver used by the configured connection method.

1. Install dependencies.

   ```powershell
   cd backend
   npm install
   cd ..\frontend
   npm install
   ```

2. Create local environment files from the examples and configure the SQL Server connection values.

   ```powershell
   Copy-Item backend\.env.example backend\.env
   Copy-Item frontend\.env.example frontend\.env
   ```

3. Initialize the database once from the backend directory.

   ```powershell
   cd backend
   node src/setup-db.js
   ```

   `setup-db.js` creates `ServiceDeskDB` when needed, executes `database/schema.sql`, runs `database/seed.sql`, and verifies the created data. It is a one-time initialization/seed script and is **not** executed during normal backend startup.

4. Start the backend API.

   ```powershell
   npm run dev
   ```

   Use `npm start` to run without Nodemon.

5. In a second terminal, start the frontend.

   ```powershell
   cd frontend
   npm run dev
   ```

## API Endpoints

The frontend uses the `/api` route prefix. The backend also registers equivalent ticket, category, dashboard, user, and health routes without that prefix.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | API welcome response |
| `GET` | `/api/health` | Health check; also available at `/health` |
| `GET` | `/api/tickets` | List tickets; supports `category`, `status`, `priority`, and `search` query parameters |
| `POST` | `/api/tickets` | Create a ticket |
| `GET` | `/api/tickets/:id` | Get a ticket with its comments |
| `PUT` | `/api/tickets/:id` | Update ticket fields, optional notes, and optional assignment |
| `PUT` | `/api/tickets/:id/close` | Close a ticket with optional resolution notes |
| `GET` | `/api/categories` | List categories |
| `GET` | `/api/dashboard/summary` | Return ticket totals grouped by category, priority, and status |
| `GET` | `/api/users` | List users for the demo profile selector and assignment control |

### Ticket request fields

- Create: `title`, `description`, `category`, and `priority` are required; `createdByUserId` is optional.
- Update: `title`, `description`, `category`, `priority`, `status`, `assignedToUserId`, and `notes` are supported. Use `assignedToUserId: null` to unassign; omit it to retain the current assignment.

## Validation and Error Handling

- Ticket creation requires a non-empty title (maximum 200 characters), description, category, and a valid priority.
- Ticket updates validate supplied title/description values, priority, and status values.
- Ticket route IDs must be positive integers.
- Assignments must reference an existing user, or use `null` to unassign.
- Missing tickets return `404`; invalid requests return `400` with validation errors.
- General updates to closed tickets return `409` with `Closed tickets cannot be updated`.
- Express uses centralized JSON error responses. Development responses include an error stack when `NODE_ENV=development`.

## Testing

From the `backend` directory:

```powershell
node src/test-db.js     # verifies SQL Server connectivity and table/data counts
node src/test-api.js    # starts a temporary API server on port 5001 and exercises API/validation flows
node src/test-e2e.js    # runs the existing end-to-end API workflow against port 5000
```

The E2E script expects the backend to already be running on port `5000`.

From the `frontend` directory:

```powershell
npm run lint
npm run build
```

## Demo Workflow

1. Start the database, backend, and frontend.
2. Choose a user in the Navbar profile selector; the choice is restored after refresh.
3. Create a ticket and confirm it appears in the ticket list.
4. Select a ticket to view its details and history.
5. Switch to Support Staff to update status/priority, add a resolution note, or close a ticket.
6. Switch to Manager to assign or unassign a ticket; only Support Staff appear in the assignment list.
7. Open the Dashboard as Support Staff or Manager to review aggregated ticket data.

## Limitations / Future Enhancements

- The profile selector is not real authentication or server-side authorization.
- Ticket categories are stored as text in `Tickets`, rather than as a foreign key to `Categories`.
- The current dashboard provides aggregate counts only.
- The project has no deployment configuration or hosted environment specified.
- Future work could add authenticated access, role enforcement at the API layer, richer ticket ownership rules, notifications, attachments, and expanded automated test coverage.
