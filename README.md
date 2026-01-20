# Disquería Microservices

This project is a modular microservices' architecture for a record store ("Disquería") built with **NestJS**.

## Architecture

The system is composed of the following microservices:

1.  **API Gateway** (Port 3000): Entry point for all HTTP requests. Routes requests to the appropriate microservices via TCP.
2.  **Catalog Service** (Port 3001): Manages Artists and Albums. Connects to PostgreSQL.
3.  **Users Service** (Port 3002): Manages User accounts. Connects to PostgreSQL.
4.  **Orders Service** (Port 3003): Manages Orders. Connects to PostgreSQL.

## Prerequisites

-   Node.js (v18+)
-   PostgreSQL
-   npm

## Configuration

The database configuration is managed centrally in `libs/shared/src/database/database.module.ts`.
Default connection: `postgresql://localhost:5432/disqueria-local`

## Installation

```bash
npm install
```

## Running the App

### Development Mode

To run all services concurrently:

```bash
npm run start:all
```

To run services individually:

```bash
npm run start:dev api-gateway
npm run start:dev catalog-service
npm run start:dev users-service
npm run start:dev orders-service
```

## API Endpoints

### Catalog

-   `POST /catalog/artists` - Create Artist
-   `GET /catalog/artists` - Get All Artists
-   `POST /catalog/albums` - Create Album
-   `GET /catalog/albums` - Get All Albums

### Users

-   `POST /users` - Create User
-   `GET /users/:email` - Get User by Email

### Orders

-   `POST /orders` - Create Order
-   `GET /orders/user/:userId` - Get Orders for a User

## Project Structure

-   `apps/`: Contains the microservices applications.
-   `libs/shared/`: Contains shared code (Database module, DTOs, interfaces).

## Scalability & Optimization

-   **Modular**: Each domain is a separate microservice.
-   **Optimized**: Communications use TCP. Database connections are pooled via TypeORM.
-   **Validation**: Global ValidationPipe ensures data integrity.
