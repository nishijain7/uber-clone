# Users API (backend)

## POST /users/register

Creates a new user account and returns a short-lived auth token and the created user object.

URL
- POST /users/register
- Mounted in `app.js` as `app.use('/users', userRoutes)` so the router path `/register` becomes `/users/register`.

Description
- Validates the incoming payload (email, fullname.firstname, password).
- Hashes the password and creates a user record in MongoDB.
- Returns a JSON object containing an authentication token and the created user document (without the password field).

Request
- Content-Type: application/json
- Body (example):

```json
{
  "fullname": { "firstname": "John", "lastname": "Doe" },
  "email": "john@example.com",
  "password": "secret123"
}
```

Required fields and validation rules
- `fullname.firstname` (string) — required, minimum length 3
- `fullname.lastname` (string) — optional, minimum length 3 if provided
- `email` (string) — required, must be a valid email address, unique
- `password` (string) — required, minimum length 6

Status codes
- 201 Created
  - Returned when the user is successfully created. Response contains `{ token, user }` where `token` is a JWT and `user` is the created user document (password excluded).
- 400 Bad Request
  - Validation failed. Response body: `{ errors: [ { msg, param, location, ... } ] }`.
- 404 Not Found
  - This will occur if the router is not mounted in `app.js` or the server isn't running on the requested URL/port. Ensure `app.use('/users', userRoutes)` is present in `app.js` and server is running.
- 500 Internal Server Error
  - DB or runtime errors during user creation.

Response examples
- Success (201):

```json
{
  "token": "<jwt token>",
  "user": {
    "_id": "64...",
    "fullname": { "firstname": "John", "lastname": "Doe" },
    "email": "john@example.com",
    "socketId": null,
    "__v": 0
  }
}
```

- Validation error (400):

```json
{
  "errors": [
    { "msg": "Invalid Email", "param": "email", "location": "body" },
    { "msg": "First name must be at least 3 characters long", "param": "fullname.firstname", "location": "body" }
  ]
}
```

Notes & debugging
- Make sure environment variable `JWT_SECRET` is set before starting the server or token generation will fail.
- Ensure MongoDB connection is successful (see `db/db.js`/`connectToDb`) — if the DB isn't connected, user creation will fail.
- To confirm the server is reachable, add a simple health route in `app.js`:

```js
app.get('/health', (req, res) => res.send('ok'));
```

Then visit `http://localhost:3000/health`.

- If you get 404 in Postman:
  1. Confirm server is running and console logs `Server is running on port ...`.
  2. Confirm you're sending POST to `http://localhost:<PORT>/users/register` (note `/users`).
  3. Confirm `app.use('/users', userRoutes)` exists in `app.js`.

Contact
- If an error persists, paste the server console output and the exact Postman request (URL, headers, body) and I'll help debug further.

## POST /users/login

Authenticates a user using email and password. On success returns a JWT token and the user object. The controller also sets a cookie named `token` with the JWT.

URL
- POST /users/login
- Full path (when mounted): `POST /users/login`

Description
- Validates email and password in the request body.
- Looks up the user by email and compares the provided password with the stored hash.
- On success, creates a JWT using `user.generateAuthToken()` and returns `{ token, user }` and sets a cookie `token`.

Request
- Content-Type: application/json
- Body (example):

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

Required fields and validation rules
- `email` — required, must be a valid email (controller expects it and the route should validate it).
- `password` — required, minimum length 6 (route-level validation should enforce this).

Status codes
- 200 OK
  - Returned when authentication succeeds. Response body: `{ token, user }` and cookie `token` is set.
- 400 Bad Request
  - Validation failed. Response includes `{ errors: [...] }` from express-validator.
- 401 Unauthorized
  - Invalid email or password. Response: `{ message: 'Invalid email or password' }`.
- 404 Not Found
  - Router not mounted or wrong URL/port (same notes as register endpoint).
- 500 Internal Server Error
  - DB or runtime errors.

Response examples
- Success (200):

```json
{
  "token": "<jwt token>",
  "user": {
    "_id": "64...",
    "fullname": { "firstname": "John", "lastname": "Doe" },
    "email": "john@example.com",
    "socketId": null,
    "__v": 0
  }
}
```

- Authentication error (401):

```json
{
  "message": "Invalid email or password"
}
```

Notes
- The controller calls `res.cookie('token', token)` to set a cookie. If you're calling from Postman, enable cookie persistence or read the `token` field from the JSON response.
- The controller uses `userModel.findOne({ email }).select('+password')` to fetch the password hash; ensure your model stores the password and that the DB is accessible.

## GET /users/profile

Returns the authenticated user's profile information. Requires authentication via token cookie or Authorization header.

URL
- GET /users/profile
- Full path (when mounted): `GET /users/profile`

Description
- Uses `authMiddleware.authUser` to verify the JWT token.
- Returns the authenticated user's profile information (user object attached by auth middleware).
- No request body needed, authentication is via token only.

Authentication
- Required: Yes
- Method: JWT token in either:
  - Cookie named 'token'
  - Authorization header: `Bearer <token>`

Status codes
- 200 OK
  - Profile retrieved successfully. Response contains the user document.
- 401 Unauthorized
  - No token provided or invalid/expired token.
- 404 Not Found
  - Router not mounted or wrong URL/port.

Response example
- Success (200):

```json
{
  "_id": "64...",
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john@example.com",
  "socketId": null,
  "__v": 0
}
```

Notes
- The user object comes from `req.user` set by the auth middleware.
- Password field is excluded by default due to `select: false` in the model.

## GET /users/logout

Logs out the current user by clearing the token cookie and blacklisting the current token.

URL
- GET /users/logout
- Full path (when mounted): `GET /users/logout`

Description
- Uses `authMiddleware.authUser` to verify the JWT token.
- Clears the `token` cookie from the client.
- Adds the token to a blacklist in the database to prevent reuse.
- No request body needed, authentication is via token only.

Authentication
- Required: Yes
- Method: JWT token in either:
  - Cookie named 'token'
  - Authorization header: `Bearer <token>`

Status codes
- 200 OK
  - Logout successful. Cookie cleared and token blacklisted.
- 401 Unauthorized
  - No token provided or invalid/expired token.
- 404 Not Found
  - Router not mounted or wrong URL/port.
- 500 Internal Server Error
  - Error adding token to blacklist.

Response example
- Success (200):

```json
{
  "message": "Logged out"
}
```

Notes
- The endpoint attempts to get the token from either cookies or Authorization header.
- Tokens are stored in `blackListTokenModel` to prevent reuse after logout.
- Make sure your auth middleware checks the blacklist before accepting tokens.

