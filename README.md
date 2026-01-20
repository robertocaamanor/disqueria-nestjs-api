# Disquería Microservices API

This project is a modular microservices' architecture for a record store ("Disquería") built with **NestJS**, utilizing TCP transport for internal communication and a centralized API Gateway.

## 🚀 Features

-   **Microservices Architecture**: Separate services for API Gateway, Catalog, Users, and Orders.
-   **TCP Communication**: Fast internal communication between microservices.
-   **Authentication**: JWT-based authentication with properly secured endpoints.
-   **API Documentation**: Full Swagger/OpenAPI documentation.
-   **Database**: PostgreSQL integration with TypeORM.
-   **Validation**: Global ValidationPipes with DTOs.

## 🏗 Architecture

The system is composed of the following applications:

1.  **API Gateway** (Port 3005): Entry point for all HTTP requests. Handles Authentication and routes requests to microservices.
2.  **Catalog Service**: Manages Artists and Albums.
3.  **Users Service**: Manages User accounts and Authentication logic.
4.  **Orders Service**: Manages Customer Orders.

## 🛠 Prerequisites

-   Node.js (v18+)
-   PostgreSQL
-   npm

## ⚙️ Configuration

1.  Clone the repository.
2.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
3.  Update the `.env` file with your database credentials and preferred settings:
    ```properties
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=your_password
    DB_DATABASE=disqueria-local
    JWT_SECRET=super-secret-key
    ADMIN_EMAIL=raristides.caamano@gmail.com
    ADMIN_PASSWORD=Is.2025rc
    ```

## 📦 Installation

```bash
npm install
```

## ▶️ Running the App

### Development Mode

To run all services concurrently (Gateway + Microservices):

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

## 📚 API Documentation (Swagger)

Once the application is running, you can access the interactive API documentation at:

**[http://localhost:3005/api](http://localhost:3005/api)**

### Authentication in Swagger
Most write operations (POST, PUT, DELETE) are protected. To test them:
1.  Use the `/auth/login` endpoint to get a JWT access token.
2.  Click the **Authorize** button at the top of the Swagger UI.
3.  Paste the token to authenticate your requests.

## 🔑 Default Admin User

On first startup, the application seeds a default admin user if configured in your `.env`:

*   **Email**: `raristides.caamano@gmail.com`
*   **Password**: `Is.2025rc`

## 📡 API Endpoints

### Auth
*   `POST /auth/login` - Login to receive a JWT Token

### Catalog
*   `GET /catalog/artists` - Get All Artists
*   `POST /catalog/artists` - Create Artist (Protected)
*   `PUT /catalog/artists/:id` - Update Artist (Protected)
*   `DELETE /catalog/artists/:id` - Delete Artist (Protected)
*   `GET /catalog/albums` - Get All Albums
*   `POST /catalog/albums` - Create Album (Protected)
*   `PUT /catalog/albums/:id` - Update Album (Protected)
*   `DELETE /catalog/albums/:id` - Delete Album (Protected)

### Users
*   `POST /users` - Create User / Register
*   `GET /users/:email` - Get User by Email (Protected)

### Orders
*   `POST /orders` - Create Order
*   `GET /orders/user/:userId` - Get Orders for a User

## 📂 Project Structure

-   `apps/`: Contains the microservices source code.
    -   `api-gateway`: HTTP entry point.
    -   `catalog-service`: Catalog domain logic.
    -   `users-service`: Users domain logic.
    -   `orders-service`: Orders domain logic.
-   `libs/shared/`: Shared library containing:
    -   **DTOs**: Data Transfer Objects (Requests/Responses).
    -   **DatabaseModule**: Shared DB configuration.
    -   **Entities**: Shared or mirrored TypeORM entities.
