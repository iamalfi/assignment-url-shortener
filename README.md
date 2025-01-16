# URL Shortener

A URL shortening service built with Node.js, Nest.js, Prisma, Supabase, and Redis.

## Features

- Generate shortened URLs
- Redis caching for improved performance
- Persistent storage with Supabase
- Built with Nest.js framework
- Database management with Prisma ORM

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose
- Supabase account
- PostgreSQL (provided by Supabase)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/iamalfi/assignment-url-shortener.git
cd url-shortener-assignment
```

2. Install dependencies:

```bash
npm install
```

## Supabase Setup

1. Create a new project in Supabase Dashboard

2. Copy your Supabase credentials and create `.env` file in project root:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres"
SUPABASE_URL="https://[YOUR-PROJECT-ID].supabase.co"
```

## Database Migration

1. Generate Prisma Client:

```bash
npm run prisma:generate
```

2. Run database migrations:

```bash
npm run migrate:dev
```

## Redis Setup with Docker

Make sure Docker is installed on your PC and running.

1. Create a `docker-compose-utils.yml` file in your project root:

```yaml
name: utils
services:
  redis:
    image: redis:latest
    container_name: redis
    ports:
      - '6379:6379'
    command: redis-server --requirepass ${REDIS_PASSWORD:-redis123}
    environment:
      - REDIS_PASSWORD=${REDIS_PASSWORD:-redis123}
```

2. Configure Redis environment variables in `.env`:

```env
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD="redis123" # default password as set in docker-compose
```

3. Start Redis container:

```bash
docker compose -f .\docker-compose-utils.yml up -d
```

4. Verify Redis container is running:

```bash
docker ps
```

## Running the Application

### Development Mode

```bash
npm run start:dev
# or
yarn start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
# or
yarn build
yarn start:prod
```

### Running Tests

```bash
# unit tests
npm run test
# or
yarn test

```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:4242/doc
```

The Swagger UI provides a comprehensive interface to:

- Explore all available endpoints
- Test API endpoints directly from the browser
- View request/response schemas
- Download OpenAPI specification
