Admin Campaigns Analytics

Goal
- Monitor campaign creation and status distribution globally.

Endpoint
- `GET /api/admin/analytics/campaigns`

Response sections
- `summary`
- `series`
- `breakdowns.byStatus`
- `rows`

Required summary cards
- total campaigns
- scheduled campaigns
- running campaigns
- paused campaigns
- completed campaigns

CSV
- uses `GET /api/admin/export/campaigns.csv`
