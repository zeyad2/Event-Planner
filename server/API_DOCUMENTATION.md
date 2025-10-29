# Event Planner API Documentation

## Base URL
```
http://127.0.0.1:8000
```

## Authentication Endpoints

All authentication endpoints are prefixed with `/api/users/auth`

---

### 1. User Signup

**Endpoint:** `POST /api/users/auth/signup`

**Description:** Register a new user account

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Example Request:**
```bash
curl -X POST "http://127.0.0.1:8000/api/users/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@test.com",
    "password": "password123"
  }'
```

**Success Response (201 Created):**
```json
{
  "username": "alice",
  "email": "alice@test.com"
}
```

**Error Responses:**

- **500 Internal Server Error:** Database error or duplicate username/email
```json
{
  "detail": "Error message",
  "type": "ErrorType"
}
```

**Notes:**
- Password is securely hashed using bcrypt before storage
- Username and email must be unique
- Password is NOT returned in the response

---

### 2. User Login (JSON)

**Endpoint:** `POST /api/users/auth/login`

**Description:** Authenticate user and receive JWT access token

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Example Request:**
```bash
curl -X POST "http://127.0.0.1:8000/api/users/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "password123"
  }'
```

**Success Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Responses:**

- **401 Unauthorized:** Invalid credentials
```json
{
  "detail": "Incorrect username or password"
}
```

**Notes:**
- Returns JWT token valid for 7 days (configurable via `ACCESS_TOKEN_EXPIRE_DAYS`)
- Token should be included in subsequent requests as: `Authorization: Bearer <token>`

---

### 3. OAuth2 Token Login (Form)

**Endpoint:** `POST /api/users/auth/token`

**Description:** OAuth2-compliant login endpoint (used by Swagger UI)

**Request Headers:**
```
Content-Type: application/x-www-form-urlencoded
```

**Request Body (Form Data):**
```
username=alice&password=password123
```

**Example Request:**
```bash
curl -X POST "http://127.0.0.1:8000/api/users/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=alice&password=password123"
```

**Success Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Responses:**

- **401 Unauthorized:** Invalid credentials
```json
{
  "detail": "Incorrect username or password"
}
```

**Notes:**
- This endpoint follows OAuth2 password flow specification
- Used by FastAPI's automatic interactive documentation (Swagger UI)
- Functionally identical to `/login` but uses form data instead of JSON

---

## JWT Token Details

### Token Payload
```json
{
  "sub": "alice",      // username
  "id": 1,             // user ID
  "exp": 1762361789    // expiration timestamp
}
```

### Token Configuration
- **Algorithm:** HS256
- **Expiration:** 7 days (configurable in `.env` as `ACCESS_TOKEN_EXPIRE_DAYS`)
- **Secret Key:** Defined in `.env` as `SECRET_KEY`

### Using the Token

Include the token in the `Authorization` header for protected endpoints:

```bash
curl -X GET "http://127.0.0.1:8000/api/protected-endpoint" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Data Models

### User Model (Database)
```python
{
  "id": int,                    # Auto-generated primary key
  "username": str,              # Unique username
  "email": str,                 # Unique email
  "hashed_password": str,       # Bcrypt hashed password
  "created_at": datetime        # Timestamp (auto-generated)
}
```

### Users Schema (API Response)
```python
{
  "username": str,
  "email": str
}
```

### CreateUserRequest Schema
```python
{
  "username": str,
  "email": str,
  "password": str
}
```

### LoginRequest Schema
```python
{
  "username": str,
  "password": str
}
```

### Token Schema
```python
{
  "access_token": str,
  "token_type": str
}
```

---

## Environment Variables

Required environment variables in `.env`:

```env
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7
DEBUG=False
```

---

## Error Handling

All endpoints use a global exception handler that returns errors in the following format:

```json
{
  "detail": "Error message describing what went wrong",
  "type": "ErrorType"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (signup)
- `401` - Unauthorized (invalid credentials)
- `422` - Validation Error (invalid request body)
- `500` - Internal Server Error

---

## Security Features

1. **Password Hashing:** Bcrypt with auto-generated salt
2. **JWT Tokens:** Signed with HS256 algorithm
3. **Token Expiration:** Automatic expiration after configured days
4. **Unique Constraints:** Username and email must be unique
5. **HTTPS Ready:** Can be deployed with SSL/TLS

---

## Interactive API Documentation

FastAPI provides automatic interactive documentation:

- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

These interfaces allow you to:
- View all endpoints
- Test endpoints directly in the browser
- See request/response schemas
- Authenticate using the OAuth2 token endpoint

---

## Frontend Integration Examples

### JavaScript/Fetch

**Signup:**
```javascript
async function signup(username, email, password) {
  const response = await fetch('http://127.0.0.1:8000/api/users/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password })
  });

  if (!response.ok) {
    throw new Error('Signup failed');
  }

  return await response.json();
}
```

**Login:**
```javascript
async function login(username, password) {
  const response = await fetch('http://127.0.0.1:8000/api/users/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  // Store token in localStorage or sessionStorage
  localStorage.setItem('access_token', data.access_token);
  return data;
}
```

**Making Authenticated Requests:**
```javascript
async function makeAuthenticatedRequest(url) {
  const token = localStorage.getItem('access_token');

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
}
```

### React Example

```jsx
import { useState } from 'react';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      // Redirect or update app state
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

### Axios Example

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Signup
export const signup = async (username, email, password) => {
  const response = await api.post('/api/users/auth/signup', {
    username,
    email,
    password,
  });
  return response.data;
};

// Login
export const login = async (username, password) => {
  const response = await api.post('/api/users/auth/login', {
    username,
    password,
  });
  localStorage.setItem('access_token', response.data.access_token);
  return response.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem('access_token');
};
```

---

## Testing Examples

See the separate `TESTING.md` file for comprehensive testing examples including:
- Unit tests
- Integration tests
- End-to-end tests
- Postman collection

---

## Changelog

### v1.0.0 (Current)
- Initial release
- User signup endpoint
- JSON login endpoint
- OAuth2 token endpoint
- JWT authentication
- Bcrypt password hashing
- PostgreSQL database integration
