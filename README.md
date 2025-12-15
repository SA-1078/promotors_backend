# Motors Backend API

Backend developed with NestJS, PostgreSQL (TypeORM) and MongoDB (Mongoose).

## Features

- **Users Management**: CRUD with Role-Based Access Control (RBAC).
- **Motorcycles Inventory**: Manage motorcycle listings.
- **Categories**: Classify motorcycles.
- **Inventory**: Track stock levels.
- **Authentication**: JWT-based login system with roles (`admin`, `empleado`, `cliente`).
- **Hybrid Database**: PostgreSQL for relational data, MongoDB for logs/history.

## Installation

1. Clone the repository.
   ```bash
   git clone <repo-url>
   cd promotors_backend
   ```

2. Install dependencies.
   ```bash
   npm install
   ```

3. Configure Environment.
   Create a `.env` file in the root directory:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASS=yourpassword
   DB_NAME=db_motors_eco
   MONGO_URI=mongodb://localhost:27017/promotors_logs
   JWT_SECRET=supersecretkey
   ```

4. Run the application.
   ```bash
   # Development
   npm run start:dev
   ```

## API Documentation

### Authentication
- **POST** `/auth/login`: login with email and password to get JWT.

### Users (Protected)
- **GET** `/users`: List users (Admin/Employee).
- **POST** `/users`: Create user (Admin).
- **PUT** `/users/:id`: Update user (Admin).
- **DELETE** `/users/:id`: Delete user (Admin).

### Motorcycles
- **GET** `/motorcycles`: Public list.
- **POST** `/motorcycles`: Create (Admin/Employee).
- **PUT** `/motorcycles/:id`: Update (Admin/Employee).
- **DELETE** `/motorcycles/:id`: Delete (Admin).

*(Other modules follow similar patterns: Categories, Inventory)*

## Testing
Import the `postman_collection.json` file into Postman or Thunder Client to test the endpoints.
