# Rehabilitation Backend API

Production-oriented Express + MongoDB backend for a rehabilitation booking system.

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT auth with HttpOnly cookies
- Google ID-token sign-in
- Nodemailer
- Cloudinary

## Base URL

All routes are versioned under:

```txt
http://localhost:5000/api/v1
```

## Quick Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create env file

Copy `.env.example` to `.env` and fill in real values.

```bash
cp .env.example .env
```

### 3. Required environment variables

```env
PORT=5000
NODE_ENV=development
DB_NAME=rehabilitation_db
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
FRONTEND_URL=http://localhost:3000

CORS_ORIGIN=http://localhost:3000
COOKIE_DOMAIN=
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

ACCESS_TOKEN_SECRET=replace-with-a-long-random-string
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_SECRET=replace-with-a-long-random-string
REFRESH_TOKEN_EXPIRY=10d

GOOGLE_CLIENT_ID=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
```

### 4. Start the server

```bash
npm run server
```

Expected startup logs:

```txt
MongoDB connected!!
Server is running on port 5000
```

## Authentication Notes

- Access and refresh tokens are stored in HttpOnly cookies.
- Protected routes also accept `Authorization: Bearer <accessToken>`.
- Auth endpoints behind `authRateLimiter` are limited to 20 requests per 15 minutes per client/IP.
- Local signup currently creates a verified user immediately.
- Google sign-in marks the user as verified automatically.
- Admin routes require both authentication and `role = admin`.

## Standard Response Format

### Success

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success message",
  "success": true
}
```

### Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be valid"
    }
  ]
}
```

## Common Models Returned by APIs

### User

```json
{
  "_id": "67f2b6d7c8e4a91234567890",
  "name": "Aditya Kumar",
  "email": "aditya@example.com",
  "googleId": null,
  "avatar": "",
  "role": "user",
  "isEmailVerified": true,
  "isActive": true,
  "createdAt": "2026-04-06T10:00:00.000Z",
  "updatedAt": "2026-04-06T10:00:00.000Z"
}
```

### Pagination

```json
{
  "page": 1,
  "limit": 10,
  "total": 1,
  "totalPages": 1
}
```

### Slot

```json
{
  "_id": "67f2b6d7c8e4a91234567891",
  "date": "2026-04-10T00:00:00.000Z",
  "startTime": "10:00",
  "endTime": "11:00",
  "startsAt": "2026-04-10T10:00:00.000Z",
  "endsAt": "2026-04-10T11:00:00.000Z",
  "status": "available",
  "createdBy": "67f2b6d7c8e4a91234567890",
  "createdAt": "2026-04-06T10:00:00.000Z",
  "updatedAt": "2026-04-06T10:00:00.000Z"
}
```

## API Reference

### Health

#### GET `/status`

Checks whether the API is running.

Response example:

```json
{
  "statusCode": 200,
  "data": null,
  "message": "Server is running",
  "success": true
}
```

## Auth APIs

### POST `/auth/signup`

Creates a local user account.

Request body:

```json
{
  "name": "Aditya Kumar",
  "email": "aditya@example.com",
  "password": "StrongPass@123"
}
```

Success response:

```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "_id": "67f2b6d7c8e4a91234567890",
      "name": "Aditya Kumar",
      "email": "aditya@example.com",
      "googleId": null,
      "avatar": "",
      "role": "user",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2026-04-06T10:00:00.000Z",
      "updatedAt": "2026-04-06T10:00:00.000Z"
    }
  },
  "message": "User registered successfully.",
  "success": true
}
```

### POST `/auth/verify-email`

Verifies an account using a previously issued verification token.

Note:

- The current `POST /auth/signup` flow already marks the user as verified, so this endpoint is only useful if your app creates verification tokens separately.

Request body:

```json
{
  "token": "raw-verification-token-from-email"
}
```

Success response:

```json
{
  "statusCode": 200,
  "data": null,
  "message": "Email verified successfully",
  "success": true
}
```

### POST `/auth/login`

Logs in a local account and sets auth cookies.

Request body:

```json
{
  "email": "aditya@example.com",
  "password": "StrongPass@123"
}
```

Success response:

```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "67f2b6d7c8e4a91234567890",
      "name": "Aditya Kumar",
      "email": "aditya@example.com",
      "googleId": null,
      "avatar": "",
      "role": "user",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2026-04-06T10:00:00.000Z",
      "updatedAt": "2026-04-06T10:00:00.000Z"
    }
  },
  "message": "Login successful",
  "success": true
}
```

### POST `/auth/google`

Logs in or creates a user using a Google ID token.

Request body:

```json
{
  "idToken": "google-id-token"
}
```

Success response:

```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "67f2b6d7c8e4a91234567890",
      "name": "Google User",
      "email": "googleuser@example.com",
      "googleId": "1234567890",
      "avatar": "https://example.com/avatar.jpg",
      "role": "user",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2026-04-06T10:00:00.000Z",
      "updatedAt": "2026-04-06T10:00:00.000Z"
    }
  },
  "message": "Google login successful",
  "success": true
}
```

### POST `/auth/forgot-password`

Generates a password reset token and sends a reset email for an existing local-password user.

Request body:

```json
{
  "email": "aditya@example.com"
}
```

Success response:

```json
{
  "statusCode": 200,
  "data": null,
  "message": "If the account exists and supports password login, a reset email has been sent",
  "success": true
}
```

Error cases:

- returns `404` if the email does not exist
- returns `400` for Google-only accounts

### POST `/auth/reset-password/:token`

Resets a local password using the email token.

Route params:

```txt
token = reset token from email
```

Request body:

```json
{
  "newPassword": "NewStrongPass@123"
}
```

Success response:

```json
{
  "statusCode": 200,
  "data": null,
  "message": "Password reset successfully",
  "success": true
}
```

### POST `/auth/refresh-token`

Rotates the refresh token and issues new auth cookies.

Authentication:

- Uses the `refreshToken` cookie

Success response:

```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "67f2b6d7c8e4a91234567890",
      "name": "Aditya Kumar",
      "email": "aditya@example.com",
      "googleId": null,
      "avatar": "",
      "role": "user",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2026-04-06T10:00:00.000Z",
      "updatedAt": "2026-04-06T10:00:00.000Z"
    }
  },
  "message": "Session refreshed successfully",
  "success": true
}
```

### POST `/auth/logout`

Clears auth cookies and invalidates the stored refresh token.

Authentication:

- Required

Success response:

```json
{
  "statusCode": 200,
  "data": null,
  "message": "Logged out successfully",
  "success": true
}
```

### POST `/auth/change-password`

Changes the password for the currently logged-in local user.

Authentication:

- Required

Request body:

```json
{
  "oldPassword": "StrongPass@123",
  "newPassword": "AnotherStrongPass@123"
}
```

Success response:

```json
{
  "statusCode": 200,
  "data": null,
  "message": "Password changed successfully",
  "success": true
}
```

### GET `/auth/me`

Returns the current authenticated user.

Authentication:

- Required

Success response:

```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "67f2b6d7c8e4a91234567890",
      "name": "Aditya Kumar",
      "email": "aditya@example.com",
      "googleId": null,
      "avatar": "",
      "role": "user",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2026-04-06T10:00:00.000Z",
      "updatedAt": "2026-04-06T10:00:00.000Z"
    }
  },
  "message": "Current user fetched successfully",
  "success": true
}
```

### PATCH `/auth/profile`

Updates the current user profile.

Authentication:

- Required

Body type:

- `multipart/form-data`

Fields:

- `name` optional text
- `avatar` optional image file

Success response:

```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "67f2b6d7c8e4a91234567890",
      "name": "Updated Name",
      "email": "aditya@example.com",
      "googleId": null,
      "avatar": "https://res.cloudinary.com/example/image/upload/avatar.jpg",
      "role": "user",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2026-04-06T10:00:00.000Z",
      "updatedAt": "2026-04-06T11:00:00.000Z"
    }
  },
  "message": "Profile updated successfully",
  "success": true
}
```

## Public Slot APIs

### GET `/slots/available`

Returns only future slots with `status = available`.

Query params:

- `page`
- `limit`
- `dateFrom`
- `dateTo`

Example:

```txt
GET /api/v1/slots/available?page=1&limit=10&dateFrom=2026-04-10&dateTo=2026-04-30
```

Success response:

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "_id": "67f2b6d7c8e4a91234567891",
        "date": "2026-04-10T00:00:00.000Z",
        "startTime": "10:00",
        "endTime": "11:00",
        "startsAt": "2026-04-10T10:00:00.000Z",
        "endsAt": "2026-04-10T11:00:00.000Z",
        "status": "available",
        "createdBy": "67f2b6d7c8e4a91234567890",
        "createdAt": "2026-04-06T10:00:00.000Z",
        "updatedAt": "2026-04-06T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "Available slots fetched successfully",
  "success": true
}
```

## Booking APIs

### POST `/bookings/request`

Atomically reserves a slot and creates a pending booking.

Authentication:

- Required

Request body:

```json
{
  "slotId": "67f2b6d7c8e4a91234567891",
  "notes": "Need rehab consultation"
}
```

Success response:

```json
{
  "statusCode": 201,
  "data": {
    "booking": {
      "_id": "67f2b6d7c8e4a91234567900",
      "user": {
        "_id": "67f2b6d7c8e4a91234567890",
        "name": "Aditya Kumar",
        "email": "aditya@example.com",
        "avatar": "",
        "role": "user"
      },
      "slot": {
        "_id": "67f2b6d7c8e4a91234567891",
        "date": "2026-04-10T00:00:00.000Z",
        "startTime": "10:00",
        "endTime": "11:00",
        "startsAt": "2026-04-10T10:00:00.000Z",
        "endsAt": "2026-04-10T11:00:00.000Z",
        "status": "pending"
      },
      "status": "pending",
      "notes": "Need rehab consultation",
      "reviewedBy": null,
      "reviewedAt": null,
      "statusHistory": [
        {
          "to": "pending",
          "actor": "67f2b6d7c8e4a91234567890",
          "note": "Need rehab consultation",
          "changedAt": "2026-04-06T10:10:00.000Z"
        }
      ],
      "createdAt": "2026-04-06T10:10:00.000Z",
      "updatedAt": "2026-04-06T10:10:00.000Z"
    }
  },
  "message": "Slot booked and sent for admin review",
  "success": true
}
```

### GET `/bookings/my`

Returns the current user booking history.

Authentication:

- Required

Query params:

- `page`
- `limit`
- `status` = `pending | approved | rejected`

Example:

```txt
GET /api/v1/bookings/my?page=1&limit=10&status=pending
```

Success response:

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "_id": "67f2b6d7c8e4a91234567900",
        "user": {
          "_id": "67f2b6d7c8e4a91234567890",
          "name": "Aditya Kumar",
          "email": "aditya@example.com",
          "avatar": "",
          "role": "user"
        },
        "slot": {
          "_id": "67f2b6d7c8e4a91234567891",
          "date": "2026-04-10T00:00:00.000Z",
          "startTime": "10:00",
          "endTime": "11:00",
          "startsAt": "2026-04-10T10:00:00.000Z",
          "endsAt": "2026-04-10T11:00:00.000Z",
          "status": "pending"
        },
        "status": "pending",
        "notes": "Need rehab consultation",
        "reviewedBy": null,
        "reviewedAt": null,
        "statusHistory": [],
        "createdAt": "2026-04-06T10:10:00.000Z",
        "updatedAt": "2026-04-06T10:10:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "Your bookings fetched successfully",
  "success": true
}
```

## Public Content APIs

### GET `/content`

Returns published content entries.

Query params:

- `page`
- `limit`
- `type`

Example:

```txt
GET /api/v1/content?page=1&limit=10&type=hero
```

Success response:

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "_id": "67f2b6d7c8e4a91234567910",
        "key": "home-hero",
        "type": "hero",
        "title": "Welcome to Our Rehabilitation Center",
        "body": "Professional rehabilitation booking and care support",
        "images": [],
        "contactInfo": {
          "email": "",
          "phone": "",
          "address": "",
          "website": ""
        },
        "isPublished": true,
        "createdAt": "2026-04-06T12:00:00.000Z",
        "updatedAt": "2026-04-06T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "Content fetched successfully",
  "success": true
}
```

### GET `/content/:key`

Returns one published content entry by key.

Example:

```txt
GET /api/v1/content/home-hero
```

Success response:

```json
{
  "statusCode": 200,
  "data": {
    "content": {
      "_id": "67f2b6d7c8e4a91234567910",
      "key": "home-hero",
      "type": "hero",
      "title": "Welcome to Our Rehabilitation Center",
      "body": "Professional rehabilitation booking and care support",
      "images": [],
      "contactInfo": {
        "email": "",
        "phone": "",
        "address": "",
        "website": ""
      },
      "isPublished": true,
      "createdAt": "2026-04-06T12:00:00.000Z",
      "updatedAt": "2026-04-06T12:00:00.000Z"
    }
  },
  "message": "Content fetched successfully",
  "success": true
}
```

## Admin APIs

All admin routes require:

- authenticated user
- `role = admin`

If you need an admin in development:

1. sign up a normal user
2. change the user document role to `admin` in MongoDB
3. log in again so the JWT contains the admin role

### GET `/admin/slots`

Returns all slots for admins with optional filters.

Query params:

- `page`
- `limit`
- `status`
- `dateFrom`
- `dateTo`

Example:

```txt
GET /api/v1/admin/slots?status=available&dateFrom=2026-04-01&dateTo=2026-04-30&limit=5
```

Response example:

```json
{
  "statusCode": 200,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 0,
      "totalPages": 0
    }
  },
  "message": "Slots fetched successfully",
  "success": true
}
```

### POST `/admin/slots`

Creates a slot.

Request body:

```json
{
  "date": "2026-04-10",
  "startTime": "10:00",
  "endTime": "11:00",
  "status": "available"
}
```

Rules:

- `status` can only be `available` or `cancelled`
- `startTime` and `endTime` must be `HH:mm`
- duplicate date/time slots are rejected

Response example:

```json
{
  "statusCode": 201,
  "data": {
    "slot": {
      "_id": "67f2b6d7c8e4a91234567891",
      "date": "2026-04-10T00:00:00.000Z",
      "startTime": "10:00",
      "endTime": "11:00",
      "startsAt": "2026-04-10T10:00:00.000Z",
      "endsAt": "2026-04-10T11:00:00.000Z",
      "status": "available",
      "createdBy": "67f2b6d7c8e4a91234567890",
      "createdAt": "2026-04-06T10:00:00.000Z",
      "updatedAt": "2026-04-06T10:00:00.000Z"
    }
  },
  "message": "Slot created successfully",
  "success": true
}
```

### PUT `/admin/slots/:id`

Updates a slot that is still editable.

Editable only when current slot status is:

- `available`
- `cancelled`

Request body example:

```json
{
  "startTime": "14:00",
  "endTime": "15:00",
  "status": "cancelled"
}
```

Response example:

```json
{
  "statusCode": 200,
  "data": {
    "slot": {
      "_id": "67f2b6d7c8e4a91234567891",
      "date": "2026-04-10T00:00:00.000Z",
      "startTime": "14:00",
      "endTime": "15:00",
      "startsAt": "2026-04-10T14:00:00.000Z",
      "endsAt": "2026-04-10T15:00:00.000Z",
      "status": "cancelled",
      "createdBy": "67f2b6d7c8e4a91234567890",
      "createdAt": "2026-04-06T10:00:00.000Z",
      "updatedAt": "2026-04-06T11:00:00.000Z"
    }
  },
  "message": "Slot updated successfully",
  "success": true
}
```

### DELETE `/admin/slots/:id`

Deletes a slot if it is safe to remove.

Cannot delete:

- `pending` slots
- `confirmed` slots
- slots with booking history

Response example:

```json
{
  "statusCode": 200,
  "data": null,
  "message": "Slot deleted successfully",
  "success": true
}
```

### GET `/admin/bookings`

Returns all bookings with pagination and optional status filter.

Query params:

- `page`
- `limit`
- `status`

Example:

```txt
GET /api/v1/admin/bookings?page=1&limit=10&status=pending
```

Response example:

```json
{
  "statusCode": 200,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 0
    }
  },
  "message": "Bookings fetched successfully",
  "success": true
}
```

### PUT `/admin/bookings/:id`

Approves or rejects a pending booking.

Request body:

```json
{
  "action": "approve",
  "notes": "Approved by admin"
}
```

Allowed actions:

- `approve`
- `reject`

Behavior:

- `approve` -> booking becomes `approved`, slot becomes `confirmed`
- `reject` -> booking becomes `rejected`, slot becomes `available`

Response example:

```json
{
  "statusCode": 200,
  "data": {
    "booking": {
      "_id": "67f2b6d7c8e4a91234567900",
      "status": "approved",
      "notes": "Need rehab consultation"
    }
  },
  "message": "Booking approved successfully",
  "success": true
}
```

### GET `/admin/content`

Returns all content entries for admin management.

Query params:

- `page`
- `limit`
- `type`

Response example:

```json
{
  "statusCode": 200,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 0
    }
  },
  "message": "Admin content fetched successfully",
  "success": true
}
```

### POST `/admin/content`

Creates content with optional images.

Body type:

- `multipart/form-data`

Fields:

- `key` required
- `type` optional
- `title` optional
- `body` optional
- `isPublished` optional
- `contactInfo` optional JSON string
- `images` optional image files

Example form-data values:

```txt
key = home-hero
type = hero
title = Welcome to Our Rehabilitation Center
body = Professional rehabilitation booking and care support
isPublished = true
contactInfo = {"email":"contact@example.com","phone":"9999999999","address":"Main Road","website":"https://example.com"}
images = <file upload>
```

Response example:

```json
{
  "statusCode": 201,
  "data": {
    "content": {
      "_id": "67f2b6d7c8e4a91234567910",
      "key": "home-hero",
      "type": "hero",
      "title": "Welcome to Our Rehabilitation Center",
      "body": "Professional rehabilitation booking and care support",
      "images": [
        {
          "url": "https://res.cloudinary.com/example/image/upload/content.jpg",
          "publicId": "rehabilitation/content/abc123",
          "resourceType": "image",
          "width": 1200,
          "height": 800,
          "format": "jpg"
        }
      ],
      "contactInfo": {
        "email": "contact@example.com",
        "phone": "9999999999",
        "address": "Main Road",
        "website": "https://example.com"
      },
      "isPublished": true,
      "createdAt": "2026-04-06T12:00:00.000Z",
      "updatedAt": "2026-04-06T12:00:00.000Z"
    }
  },
  "message": "Content created successfully",
  "success": true
}
```

### PUT `/admin/content/:id`

Updates content and optionally appends or replaces images.

Body type:

- `multipart/form-data`

Fields:

- any of the create fields
- `replaceImages = true | false`

Example:

```txt
title = Updated Hero Title
body = Updated content body
replaceImages = false
images = <file upload>
```

Response example:

```json
{
  "statusCode": 200,
  "data": {
    "content": {
      "_id": "67f2b6d7c8e4a91234567910",
      "key": "home-hero",
      "type": "hero",
      "title": "Updated Hero Title",
      "body": "Updated content body",
      "images": [],
      "contactInfo": {
        "email": "",
        "phone": "",
        "address": "",
        "website": ""
      },
      "isPublished": true,
      "createdAt": "2026-04-06T12:00:00.000Z",
      "updatedAt": "2026-04-06T13:00:00.000Z"
    }
  },
  "message": "Content updated successfully",
  "success": true
}
```

### DELETE `/admin/content/:id`

Deletes a content entry by id.

Response example:

```json
{
  "statusCode": 200,
  "data": null,
  "message": "Content deleted successfully",
  "success": true
}
```

## Validation Rules

### Email / Password

- email must be valid
- password must include:
  - at least 8 characters
  - uppercase letter
  - lowercase letter
  - number
  - special character

### Slot Rules

- `date` must be a valid date
- `startTime` and `endTime` must be in `HH:mm`
- `endTime` must be after `startTime`
- slot statuses:
  - `available`
  - `pending`
  - `confirmed`
  - `cancelled`

### Booking Rules

- booking statuses:
  - `pending`
  - `approved`
  - `rejected`
- only future available slots can be booked
- only pending bookings can be reviewed by admin

## Suggested Postman Flow

1. `POST /auth/signup`
2. `POST /auth/login`
3. `GET /auth/me`
4. `POST /admin/slots` as admin
5. `GET /slots/available`
6. `POST /bookings/request`
7. `GET /bookings/my`
8. `GET /admin/bookings` as admin
9. `PUT /admin/bookings/:id`
10. `POST /admin/content`
11. `GET /content`

## Notes

- Email and password reset links depend on `FRONTEND_URL`.
- Auth cookies are the preferred session mechanism.
- If Cloudinary or SMTP is not configured, image uploads or email delivery will not complete successfully.
- Required env vars at startup are `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, and `REFRESH_TOKEN_SECRET`.
- `CORS_ORIGIN` can be a single origin, a comma-separated list, or `*`.
