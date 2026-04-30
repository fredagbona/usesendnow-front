Admin Exports

Goal
- Export currently analyzed datasets as CSV for offline analysis.

Endpoints
- `GET /api/admin/export/users.csv`
- `GET /api/admin/export/request-logs.csv`
- `GET /api/admin/export/messages.csv`
- `GET /api/admin/export/campaigns.csv`
- `GET /api/admin/export/api-usage.csv`

Rules
- exports require admin auth
- exports must reuse current filters where relevant
- download as file attachment

UX
- surface export actions close to the related table or analytics module
- show loading state during generation
