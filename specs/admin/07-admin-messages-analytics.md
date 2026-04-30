Admin Messages Analytics

Goal
- Monitor outbound messaging activity globally.

Endpoint
- `GET /api/admin/analytics/messages`

Query params
- `window`
- `from`
- `to`

Response sections
- `summary`
- `series`
- `breakdowns.byType`
- `rows`

Required summary cards
- total outbound messages
- failed messages
- queued messages
- delivered messages

Charts
- message volume over time
- message type distribution

CSV
- uses `GET /api/admin/export/messages.csv`
