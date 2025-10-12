# API Specification

## Base URL
```
Production: (To be defined)
Development: http://localhost:3000/api
```

## Authentication
All API requests require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Endpoints

### Authentication

#### POST /auth/login
**Description:** User login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "client"
    }
  }
}
```

### Client Dashboard APIs
(To be defined based on features)

### Admin Dashboard APIs
(To be defined based on features)

#### GET /admin/users
**Description:** Get all users (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "user@example.com",
        "role": "client",
        "status": "active"
      }
    ]
  }
}
```

## Rate Limiting
(To be defined)

## Versioning
API version is included in the URL: `/api/v1/...`
