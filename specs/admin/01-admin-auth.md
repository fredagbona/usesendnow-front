Admin Auth

Goal
- Provide a dedicated internal admin login flow, separate from normal user auth.

Endpoints
- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `POST /api/admin/auth/create`

Login request
```json
{
  "email": "admin@msgflash.com",
  "password": "strong-password"
}
```

Login success
```json
{
  "data": {
    "admin": {
      "id": "uuid",
      "fullName": "Default Admin",
      "email": "admin@msgflash.com",
      "role": "super_admin",
      "status": "active",
      "lastLoginAt": "2026-04-30T12:00:00.000Z"
    },
    "token": "jwt"
  }
}
```

Frontend rules
- Store the returned token separately from normal portal auth.
- All admin requests use `Authorization: Bearer <token>`.
- If `GET /api/admin/auth/me` fails with `401`, redirect to admin login.
- `POST /api/admin/auth/create` is only available to `super_admin`.

UI states
- loading
- invalid credentials
- suspended admin account
- authenticated
