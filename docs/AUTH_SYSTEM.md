# DevSolve Authentication System

A complete guide to understanding how authentication works in DevSolve.

---

## Table of Contents

1. [Overview](#overview)
2. [Registration Flow](#registration-flow)
3. [Email Verification Flow](#email-verification-flow)
4. [Login Flow](#login-flow)
5. [Password Reset Flow](#password-reset-flow)
6. [Protected Routes](#protected-routes)
7. [API Reference](#api-reference)
8. [Security Features](#security-features)

---

## Overview

DevSolve uses **JWT (JSON Web Tokens)** stored in **HTTP-only cookies** for authentication. This approach provides:

- ✅ Protection against XSS attacks (cookies are not accessible via JavaScript)
- ✅ Automatic token refresh
- ✅ Secure session management

### Token Types

| Token | Lifetime | Purpose |
|-------|----------|---------|
| Access Token | 15 minutes | Used for API authentication |
| Refresh Token | 7 days | Used to get new access tokens |

---

## Registration Flow

### Step-by-Step Process

```
User fills form → API validates → Create user → Send email → Set cookies → Redirect
```

### 1. User Submits Registration Form

**Page:** `/register`

```javascript
// User enters:
{
  name: "John Doe",
  email: "john@example.com",
  password: "SecurePass123"
}
```

### 2. Frontend Calls API

```javascript
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, password })
})
```

### 3. Backend Processing

**File:** `app/api/auth/register/route.ts`

```
1. Check rate limit (3 registrations/hour per IP)
2. Validate input (name, email format, password length)
3. Check if email already exists
4. Generate verification token
5. Hash password with bcrypt
6. Create user in MongoDB
7. Send verification email
8. Generate JWT tokens
9. Set HTTP-only cookies
10. Return success response
```

### 4. Response

```json
{
  "success": true,
  "message": "Account created. Check your email to verify.",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": false
  }
}
```

### 5. Cookies Set

```
access_token=eyJhbGci... (HTTP-only, 15 min)
refresh_token=eyJhbGci... (HTTP-only, 7 days)
```

---

## Email Verification Flow

### Step-by-Step Process

```
User clicks email link → API verifies token → Update user → Show success
```

### 1. User Receives Email

The email contains a link like:
```
https://devsolve.com/verify-email?token=abc123xyz...
```

### 2. User Clicks Link

**Page:** `/verify-email?token=...`

### 3. Frontend Calls API

```javascript
fetch(`/api/auth/verify-email?token=${token}`)
```

### 4. Backend Processing

**File:** `app/api/auth/verify-email/route.ts`

```
1. Get token from URL
2. Hash the token (tokens stored hashed for security)
3. Find user with matching verification token
4. Update user: isVerified = true
5. Clear verification token
6. Return success
```

### 5. User Can Now Login

After verification, the login page will allow access.

---

## Login Flow

### Step-by-Step Process

```
User enters credentials → API validates → Check verification → Set cookies → Redirect
```

### 1. User Submits Login Form

**Page:** `/login`

### 2. Frontend Calls API

```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

### 3. Backend Processing

**File:** `app/api/auth/login/route.ts`

```
1. Check rate limit (5 attempts/15 min per IP)
2. Find user by email
3. Compare password with bcrypt
4. Check if email is verified (return error if not)
5. Update lastLoginAt timestamp
6. Generate new JWT tokens
7. Set HTTP-only cookies
8. Return user data
```

### 4. Possible Responses

**Success:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Email Not Verified:**
```json
{
  "success": false,
  "message": "Please verify your email before logging in",
  "requiresVerification": true
}
```

### 5. Redirect to Dashboard

After successful login, user is redirected to `/dashboard`.

---

## Password Reset Flow

### Step-by-Step Process

```
User requests reset → Email sent → User clicks link → New password → Login
```

### Part 1: Request Reset

**Page:** `/forgot-password`

```javascript
fetch('/api/auth/forgot-password', {
  method: 'POST',
  body: JSON.stringify({ email })
})
```

**Backend:** `app/api/auth/forgot-password/route.ts`
```
1. Check rate limit (3 requests/hour)
2. Find user by email
3. Generate reset token (expires in 1 hour)
4. Save hashed token to database
5. Send reset email
6. Return success (always, to prevent email enumeration)
```

### Part 2: Reset Password

**Page:** `/reset-password?token=...`

```javascript
fetch('/api/auth/reset-password', {
  method: 'POST',
  body: JSON.stringify({ token, password })
})
```

**Backend:** `app/api/auth/reset-password/route.ts`
```
1. Validate token and password
2. Find user with valid, non-expired token
3. Update password (auto-hashed)
4. Clear reset token
5. Return success
```

---

## Protected Routes

### How Route Protection Works

**File:** `middleware.ts`

```javascript
// Protected routes - require authentication
const protectedRoutes = ['/dashboard', '/api/questions'];

// Auth routes - redirect to dashboard if logged in
const authRoutes = ['/login', '/register'];
```

### Middleware Flow

```
Request comes in
    ↓
Check if route is protected
    ↓
Get access_token from cookies
    ↓
Verify JWT signature and expiry
    ↓
┌─────────────────┬─────────────────┐
│ Token Valid     │ Token Invalid   │
│       ↓         │       ↓         │
│ Allow access    │ Redirect to     │
│                 │ /login          │
└─────────────────┴─────────────────┘
```

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login and get tokens |
| POST | `/api/auth/logout` | Clear auth cookies |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/verify-email?token=` | Verify email |
| POST | `/api/auth/verify-email` | Resend verification |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/refresh` | Refresh access token |

### Request/Response Examples

#### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"Secret123"}'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Secret123"}'
```

#### Get Current User
```bash
curl http://localhost:3000/api/auth/me \
  --cookie "access_token=YOUR_TOKEN"
```

---

## Security Features

### 1. Password Hashing

Passwords are hashed using **bcrypt** with 12 salt rounds.

```javascript
// Never stored in plain text
const hashedPassword = await bcrypt.hash(password, 12);
```

### 2. Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Register | 3 per hour |
| Login | 5 per 15 minutes |
| Password Reset | 3 per hour |
| General API | 100 per minute |

### 3. HTTP-Only Cookies

Tokens are stored in HTTP-only cookies, making them:
- ✅ Invisible to JavaScript (prevents XSS)
- ✅ Automatically sent with requests
- ✅ Secure in production (HTTPS only)

### 4. Token Hashing

Verification and reset tokens are stored as SHA-256 hashes:
```javascript
// Raw token sent in email
const token = "abc123xyz...";

// Hashed token stored in database
const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
```

### 5. Token Expiry

| Token Type | Expiry |
|------------|--------|
| Access Token | 15 minutes |
| Refresh Token | 7 days |
| Verification Token | 24 hours |
| Reset Token | 1 hour |

---

## File Structure

```
lib/
├── auth/
│   ├── index.ts          # Barrel exports
│   ├── jwt.ts            # JWT sign/verify, cookies
│   ├── email.ts          # Email sending
│   ├── rateLimit.ts      # Rate limiter
│   └── AuthContext.tsx   # React context
├── db/
│   └── connection.ts     # MongoDB connection
└── models/
    └── User.ts           # User schema

app/
├── api/auth/
│   ├── register/route.ts
│   ├── login/route.ts
│   ├── logout/route.ts
│   ├── me/route.ts
│   ├── verify-email/route.ts
│   ├── forgot-password/route.ts
│   ├── reset-password/route.ts
│   └── refresh/route.ts
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── verify-email/page.tsx
│   └── reset-password/page.tsx
└── middleware.ts
```

---

## Quick Reference

### Environment Variables

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-32-chars-minimum
NEXT_PUBLIC_APP_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com      # Optional
SMTP_PORT=587                  # Optional
SMTP_USER=email@gmail.com      # Optional
SMTP_PASS=app-password         # Optional
```

### Using Auth in Components

```jsx
import { useAuth } from '@/lib/auth/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }
  
  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```
