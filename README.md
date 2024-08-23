# Twitter clone API

## Summary

This is a project that clones functionalities from [Twitter](https://x.com/?lang=vi).

**Technologies used**: NodeJS, Typescript, Jsonwebtoken, ExpressJS, MongoDB, Formidable, Socket, Swagger, AWS SES, AWS S3, Docker, CICD.

**Functions include**:

- Manage authentication with JWT.
- Use AWS Simple Email Service (SES) to send emails.
- Utilize Formidable for file uploads and AWS S3 for file storage.
- Implement pagination and search functionality for efficient data handling.
- Ensure schema validation within MongoDB to maintain data integrity.
- Secure the project using Helmet, CORS, and rate limiting.
- Validate input data using the express-validation library.
- Manage the application processes using PM2.
- Deployment with Docker
- Build and upload to Docker Hub
- Building, and auto deployment processes with a CI/CD pipeline.
- Implement basic Socket.io functionality for real-time chating between two users.

## Technologies

- [TypeScript](https://www.typescriptlang.org/)
- [ExpressJS](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/products/tools/compass)

## Prerequisites

The required packages to run the project:

```bash
- NodeJS >= 20.11.1
- Npm >= 10.7.0
- Docker >= 20.10.21
```

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/phannguyenminhphat1/Nodejsts
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Configure environment:

   - Create a `.env` file and configure the necessary environment variables.

4. Run the application:
   ```sh
   npm run:dev
   ```

## Test API

You can view this page and test:

```sh
   https://minhphat.io.vn/api-twitter-clone/
```
