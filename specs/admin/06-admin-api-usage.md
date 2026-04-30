Admin API Usage

Goal
- Monitor public API consumption and API key behavior.

Endpoints
- `GET /api/admin/api-keys`
- `GET /api/admin/api-keys/:id`
- `GET /api/admin/analytics/requests`

Important distinction
- This module focuses on public API traffic.
- Dashboard JWT traffic is visible in request analytics but should be rendered separately.

List fields
- API key id
- owner user
- key name
- key prefix
- request count
- last request at
- revoked at
- created at

Detail page
- key identity
- owner account
- recent request logs
- revoke action
