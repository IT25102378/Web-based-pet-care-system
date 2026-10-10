# PetNexus

## Quick Start (Zero Setup)

The project has been configured so that any team member can clone this repository and run the application instantly without any manual database setup.

### Prerequisites
- Java 17+
- Node.js
- SQL Server (running locally on default port 1433 with Windows Authentication enabled)

### How to Run

1. **Backend:**
   Open the `Backend` folder in IntelliJ IDEA and run `BackendApplication.java`.
   - The database schema will be automatically synchronized.
   - Default team member accounts will be seeded automatically.

2. **Frontend:**
   Open the `Frontend` directory in your terminal and run:
   ```bash
   npm install
   npm run dev
   ```

### Default Accounts
All seeded accounts use the password: `password123`
