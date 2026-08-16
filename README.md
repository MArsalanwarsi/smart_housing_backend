# Smart Society Management - Complete Backend Architecture Guide

A production-ready, enterprise-grade backend REST API for a residential society management system built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** using **ECMAScript (ES) Modules**.

---

## Table of Contents
1. [Architecture & Design Pattern](#1-architecture--design-pattern)
2. [Project Structure](#2-project-structure)
3. [Environment Configuration](#3-environment-configuration)
4. [Step-by-Step Codebase Walkthrough](#4-step-by-step-codebase-walkthrough)
   - [4.1 Entry Point & Application Bootstrap](#41-entry-point--application-bootstrap)
   - [4.2 Database & Third-Party Configuration](#42-database--third-party-configuration)
   - [4.3 Middleware Pipeline](#43-middleware-pipeline)
   - [4.4 Data Layer (Mongoose Models)](#44-data-layer-mongoose-models)
   - [4.5 Controller Layer (Business Logic)](#45-controller-layer-business-logic)
   - [4.6 Routing Layer (HTTP Endpoints)](#46-routing-layer-http-endpoints)
5. [Role-Based Access Control (RBAC) Matrix](#5-role-based-access-control-rbac-matrix)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [Installation & Setup](#7-installation--setup)

---

## 1. Architecture & Design Pattern

This project follows a strict **Model-View-Controller (MVC)** architectural pattern adapted for REST APIs:

```
[ Client Request ]
       │
       ▼
[ Express Middleware Pipeline ] ── (CORS, Body Parsers)
       │
       ▼
[ Authentication & Role Guard ] ── (JWT Verification & RBAC)
       │
       ▼
[ Route Dispatcher ] ───────────── (routes/*.js)
       │
       ▼
[ Business Controller ] ────────── (controllers/*.js)
       │
       ▼
[ Data Layer / Models ] ────────── (models/*.js <-> MongoDB)
       │
       ▼
[ Standardized Response ] ──────── (JSON output / Error Handler)
```

### Core Architecture Principles:
- **ES Modules Everywhere**: Native `import`/`export` syntax enabled via `"type": "module"` in `package.json`.
- **Explicit File Extensions**: All relative imports include `.js` extensions for native Node.js ESM runtime compatibility.
- **Strict Separation of Concerns**: Routes only map URLs to handlers; Controllers contain pure business logic; Models enforce database schema rules and hooks.
- **Fail-Safe Global Error Boundary**: Uncaught controller exceptions are passed to Express `next(error)` and transformed into consistent JSON responses.

---

## 2. Project Structure

```text
smart/
├── .env.example                # Blueprint for environment variables
├── .gitignore                  # Git ignore rules for node_modules and secrets
├── package.json                # Project manifest, scripts, and dependencies
├── README.md                   # Complete architectural guide and documentation
└── src/
    ├── server.js               # Application bootstrap and port listener
    ├── app.js                  # Express app initialization and middleware stack
    ├── config/
    │   ├── db.js               # MongoDB Mongoose connection handler
    │   └── cloudinary.js       # Cloudinary SDK & Multer storage configuration
    ├── middlewares/
    │   ├── authMiddleware.js   # JWT token verification and user extraction
    │   ├── roleMiddleware.js   # Dynamic Role-Based Access Control (RBAC) guard
    │   └── errorMiddleware.js  # Global centralized error handler
    ├── models/
    │   ├── User.js             # User accounts, role definitions, password hashing
    │   ├── Flat.js             # Housing units, blocks, and occupancy types
    │   ├── Visitor.js          # Pre-approved and walk-in visitor logs
    │   ├── Complaint.js        # Resident tickets with Cloudinary image attachments
    │   ├── Bill.js             # Flat maintenance billing records
    │   ├── Notice.js           # Admin society notices and announcements
    │   ├── Facility.js         # Society amenities and facilities management
    │   ├── Poll.js             # Voting polls and community decision tracking
    │   └── Emergency.js        # Emergency alerts and incident notifications
    ├── controllers/
    │   ├── authController.js   # Authentication and token issuance logic
    │   ├── adminController.js  # Flats, residents, bills, notices, complaints, facilities, polls, emergencies
    │   ├── residentController.js # Bills, simulated payments, passes, complaints
    │   ├── securityController.js # Pass validation, walk-ins, active visitor tracking
    │   └── pollController.js   # Voting mechanism and poll results calculation
    └── routes/
        ├── authRoutes.js       # /api/auth
        ├── adminRoutes.js      # /api/admin
        ├── residentRoutes.js   # /api/resident
        ├── securityRoutes.js   # /api/security
        └── pollRoutes.js       # /api/polls
```

---

## 3. Environment Configuration

The application requires specific environment variables to run. Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/smart_society
JWT_SECRET=super_secret_jwt_key_society_management_2026
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Variable Breakdown:
- `PORT`: Port on which the HTTP server listens (default: `5000`).
- `MONGO_URI`: MongoDB connection string (local or MongoDB Atlas cluster).
- `JWT_SECRET`: Secret key used for signing and verifying JSON Web Tokens.
- `CLOUDINARY_*`: API credentials for Cloudinary image upload storage.

---

## 4. Step-by-Step Codebase Walkthrough

---

### 4.1 Entry Point & Application Bootstrap

#### 1. `src/server.js`
The main entry point of the Node process. It connects to the database before binding to the HTTP port.

#### 2. `src/app.js`
Initializes Express, configures global parsing and security middlewares, mounts domain routes, and installs error boundaries.

---

### 4.2 Database & Third-Party Configuration

#### 1. `src/config/db.js`
Handles MongoDB connection using Mongoose.

#### 2. `src/config/cloudinary.js`
Configures Cloudinary v2 and provides a Multer storage engine for direct cloud file uploads.

---

### 4.3 Middleware Pipeline

#### 1. `src/middlewares/authMiddleware.js`
Protects private routes by validating JWT Bearer tokens.

#### 2. `src/middlewares/roleMiddleware.js`
Enforces Role-Based Access Control (RBAC).

#### 3. `src/middlewares/errorMiddleware.js`
Centralized error handling middleware.

---

### 4.4 Data Layer (Mongoose Models)

#### 1. `src/models/Flat.js`
Defines individual residential apartments.
- Fields: `block_name` (String), `flat_number` (String), `occupancy_type` ('Owner' | 'Tenant').

#### 2. `src/models/User.js`
Defines application users across all three roles.
- Fields: `username` (unique String), `password` (hashed String), `role` ('Admin' | 'Resident' | 'Guard'), `flat_id` (ObjectId reference to `Flat`).

#### 3. `src/models/Visitor.js`
Tracks pre-approved guest passes and security walk-in logs.
- Fields: `visitor_name`, `phone`, `vehicle_number`, `flat_id` (reference), `gate_pass_code` (6-digit numeric string), `entry_timestamp` (Date), `status` ('Pre-Approved' | 'Entered' | 'Exited').

#### 4. `src/models/Complaint.js`
Resident maintenance and issue tickets.
- Fields: `resident_id` (reference to User), `category`, `description`, `photo_url`, `status` ('Pending' | 'In-Progress' | 'Resolved').

#### 5. `src/models/Bill.js`
Monthly maintenance bills per flat.
- Fields: `flat_id` (reference to Flat), `amount_due`, `due_date`, `payment_status` ('Pending' | 'Paid').

#### 6. `src/models/Notice.js`
Society-wide announcements and emergency broadcasts.
- Fields: `title`, `description`, `created_by` (reference to User).

#### 7. `src/models/Facility.js`
Society amenities and shared facilities.
- Fields: `name`, `description`, `location`, `timing`, `capacity`, `status` ('Active' | 'Maintenance' | 'Closed'), `created_by`.

#### 8. `src/models/Poll.js`
Voting polls for community decision making.
- Fields: `question`, `options` (`[{ option_text, votes }]`), `voted_by` (`[ObjectId]`), `status` ('Active' | 'Closed'), `created_by`, `expires_at`.

#### 9. `src/models/Emergency.js`
Emergency alert notifications and security incidents.
- Fields: `title`, `description`, `type` ('Fire' | 'Medical' | 'Security' | 'Maintenance' | 'Other'), `status` ('Active' | 'Resolved'), `location`, `contact_number`, `created_by`.

---

### 4.5 Controller Layer (Business Logic)

#### 1. `src/controllers/authController.js`
- `login`: Validates credentials, compares password hashes, and returns a signed 7-day JWT token.

#### 2. `src/controllers/adminController.js`
- `createFlat` / `getFlats`: Create flats and query all society flats.
- `onboardResident` / `getResidents`: Onboard new resident accounts and list residents with flat details.
- `generateBills` / `getBills`: Bulk generate maintenance bills and view overall billing status.
- `broadcastNotice` / `getNotices`: Publish announcements and retrieve notice broadcasts.
- `getComplaints` / `updateComplaintStatus`: Monitor complaints and update resolution status.
- `getVisitorLogs`: View full historical visitor entry logs.
- `getFacilities` / `createFacility` / `updateFacility` / `deleteFacility`: Full CRUD management for society facilities.
- `getPollsAdmin` / `createPoll` / `updatePoll`: Admin management for community voting polls.
- `getEmergencies` / `createEmergency` / `updateEmergency`: Post and manage society emergency alerts.

#### 3. `src/controllers/residentController.js`
- `getBills`, `payBill`, `generateVisitorPass`, `raiseComplaint`.

#### 4. `src/controllers/securityController.js`
- `verifyPass`, `logWalkInVisitor`, `getActiveVisitors`.

#### 5. `src/controllers/pollController.js`
- `votePoll`: Casts a vote for a designated option ID with single-vote enforcement per resident user.
- `getPollResults`: Returns real-time vote breakdown percentages and individual voting status.

---

### 4.6 Routing Layer (HTTP Endpoints)

#### 1. `src/routes/authRoutes.js`
- `POST /api/auth/login` -> `login`

#### 2. `src/routes/adminRoutes.js`
Protected with `authMiddleware` and `roleMiddleware(['Admin'])`:
- `POST /api/admin/flat` & `GET /api/admin/flats`
- `POST /api/admin/resident` & `GET /api/admin/residents`
- `POST /api/admin/bills` & `GET /api/admin/bills`
- `POST /api/admin/notice` & `GET /api/admin/notices`
- `GET /api/admin/complaints` & `PATCH /api/admin/complaints/:id`
- `GET /api/admin/visitor-logs`
- `GET /api/admin/facilities`, `POST /api/admin/facility`, `PATCH /api/admin/facility/:id`, `DELETE /api/admin/facility/:id`
- `GET /api/admin/polls`, `POST /api/admin/poll`, `PATCH /api/admin/poll/:id`
- `GET /api/admin/emergencies`, `POST /api/admin/emergency`, `PATCH /api/admin/emergency/:id`

#### 3. `src/routes/residentRoutes.js`
Protected with `authMiddleware` and `roleMiddleware(['Resident'])`:
- `GET /api/resident/bills`, `POST /api/resident/bills/:id/pay`, `POST /api/resident/visitor-pass`, `POST /api/resident/complaints`

#### 4. `src/routes/securityRoutes.js`
Protected with `authMiddleware` and `roleMiddleware(['Guard'])`:
- `POST /api/security/verify-pass`, `POST /api/security/walk-in`, `GET /api/security/active-visitors`

#### 5. `src/routes/pollRoutes.js`
Protected with `authMiddleware`:
- `POST /api/polls/:id/vote` -> `votePoll`
- `GET /api/polls/:id/results` -> `getPollResults`

---

## 5. Role-Based Access Control (RBAC) Matrix

| Endpoint | HTTP Method | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates credentials and returns JWT |
| `/api/admin/flat` | `POST` | `Admin` | Adds a new flat unit |
| `/api/admin/flats` | `GET` | `Admin` | Retrieves all flats |
| `/api/admin/resident` | `POST` | `Admin` | Onboards resident user and links flat |
| `/api/admin/residents` | `GET` | `Admin` | Retrieves all registered residents |
| `/api/admin/bills` | `POST` | `Admin` | Bulk generates bills for all flats |
| `/api/admin/bills` | `GET` | `Admin` | Retrieves all generated maintenance bills |
| `/api/admin/notice` | `POST` | `Admin` | Publishes a society notice |
| `/api/admin/notices` | `GET` | `Admin` | Retrieves all society notices |
| `/api/admin/complaints` | `GET` | `Admin` | Retrieves all submitted complaints |
| `/api/admin/complaints/:id` | `PATCH` | `Admin` | Updates complaint status |
| `/api/admin/visitor-logs` | `GET` | `Admin` | Retrieves all visitor activity logs |
| `/api/admin/facilities` | `GET` | `Admin` | Retrieves all facilities |
| `/api/admin/facility` | `POST` | `Admin` | Creates a new facility |
| `/api/admin/facility/:id` | `PATCH` | `Admin` | Updates facility details |
| `/api/admin/facility/:id` | `DELETE` | `Admin` | Deletes a facility |
| `/api/admin/polls` | `GET` | `Admin` | Retrieves all created polls |
| `/api/admin/poll` | `POST` | `Admin` | Creates a new poll |
| `/api/admin/poll/:id` | `PATCH` | `Admin` | Updates poll configuration/status |
| `/api/polls/:id/vote` | `POST` | Authenticated | Casts a vote on an active poll |
| `/api/polls/:id/results` | `GET` | Authenticated | Retrieves breakdown of poll results |
| `/api/admin/emergencies` | `GET` | `Admin` | Retrieves emergency alerts |
| `/api/admin/emergency` | `POST` | `Admin` | Posts an emergency alert |
| `/api/admin/emergency/:id` | `PATCH` | `Admin` | Updates emergency alert status |
| `/api/resident/bills` | `GET` | `Resident` | Fetches bills for the resident's flat |
| `/api/resident/bills/:id/pay` | `POST` | `Resident` | Marks a bill as paid |
| `/api/resident/visitor-pass` | `POST` | `Resident` | Generates 6-digit visitor pass |
| `/api/resident/complaints` | `POST` | `Resident` | Submits complaint with photo |
| `/api/security/verify-pass` | `POST` | `Guard` | Validates gate pass and admits visitor |
| `/api/security/walk-in` | `POST` | `Guard` | Registers walk-in visitor |
| `/api/security/active-visitors`| `GET` | `Guard` | Lists all visitors currently inside |

---

## 6. API Endpoints Reference

### 1. Authentication
#### `POST /api/auth/login`
- **Request Body**:
```json
{
  "username": "admin_user",
  "password": "Password123"
}
```

---

### 2. Admin Actions

#### `GET /api/admin/flats`
- **Headers**: `Authorization: Bearer <Admin_JWT>`

#### `GET /api/admin/residents`
- **Headers**: `Authorization: Bearer <Admin_JWT>`

#### `GET /api/admin/bills`
- **Headers**: `Authorization: Bearer <Admin_JWT>`

#### `GET /api/admin/notices`
- **Headers**: `Authorization: Bearer <Admin_JWT>`

#### `GET /api/admin/complaints`
- **Headers**: `Authorization: Bearer <Admin_JWT>`

#### `PATCH /api/admin/complaints/:id`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Request Body**:
```json
{
  "status": "In-Progress"
}
```

#### `GET /api/admin/visitor-logs`
- **Headers**: `Authorization: Bearer <Admin_JWT>`

#### Facilities Management
- `GET /api/admin/facilities`
- `POST /api/admin/facility`
  ```json
  {
    "name": "Gymnasium",
    "description": "Fully equipped fitness center",
    "location": "Clubhouse 2nd Floor",
    "timing": "06:00 AM - 10:00 PM",
    "capacity": 30,
    "status": "Active"
  }
  ```
- `PATCH /api/admin/facility/:id`
- `DELETE /api/admin/facility/:id`

#### Polls Management
- `GET /api/admin/polls`
- `POST /api/admin/poll`
  ```json
  {
    "question": "Should we install solar panels on Block A?",
    "options": ["Yes, approve budget", "No, keep grid power"],
    "expires_at": "2026-12-31T23:59:59.000Z"
  }
  ```
- `PATCH /api/admin/poll/:id`

#### Emergency Management
- `GET /api/admin/emergencies`
- `POST /api/admin/emergency`
  ```json
  {
    "title": "Elevator Trap Alert",
    "description": "Elevator 2 in Block B stuck between floors 3 and 4.",
    "type": "Security",
    "location": "Block B, Elevator 2",
    "contact_number": "9112233445"
  }
  ```
- `PATCH /api/admin/emergency/:id`

---

### 3. Poll Voting & Results

#### `POST /api/polls/:id/vote`
- **Headers**: `Authorization: Bearer <User_JWT>`
- **Request Body**:
```json
{
  "option_id": "66bc9e1234567890abcdef34"
}
```

#### `GET /api/polls/:id/results`
- **Headers**: `Authorization: Bearer <User_JWT>`

---

## 7. Installation & Setup

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd smart
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

The application will start on:
```text
Server running on http://localhost:5000
```
