# SuratKu - Sistem Pengelolaan Surat Keluar

## Database Setup

This application uses PostgreSQL as its database. Follow these steps to set up the database:

### 1. Install PostgreSQL

#### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

#### CentOS/RHEL:
```bash
sudo yum install postgresql-server postgresql-contrib
```

#### macOS:
```bash
brew install postgresql
```

#### Windows:
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Start PostgreSQL Service

#### Linux:
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS:
```bash
brew services start postgresql
```

#### Windows:
Start the PostgreSQL service from the Services app

### 3. Create Database and User

```bash
# Switch to the postgres user
sudo -u postgres psql

# Create a database
CREATE DATABASE suratku;

# Create a user
CREATE USER postgres WITH PASSWORD 'postgres';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE suratku TO postgres;

# Exit
\q
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory with the following content:

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=suratku
DB_PASSWORD=postgres
DB_PORT=5432
```

### 5. Initialize and Seed Database

After setting up PostgreSQL, run the following commands:

```bash
# Install dependencies
npm install

# Initialize and seed the database
npm run db:setup
```

This will create the necessary tables and seed them with initial data.

### Alternative Database Setup Commands

You can also run the database setup steps individually:

```bash
# Initialize tables only
npm run db:init

# Seed tables with initial data only
npm run db:seed
```

## Running the Application

After setting up the database, you can run the application:

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will be available at http://localhost:3000