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
