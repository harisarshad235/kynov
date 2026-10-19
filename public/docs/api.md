# Kynov REST & Agent API Reference

API endpoints and schema definitions for automated agents and integrations.

## Available Endpoints

- `GET /api/v1/sprints`: List active and upcoming sprints.
- `POST /api/v1/issues`: Create new task card with estimation points.
- `PATCH /api/v1/issues/:id`: Update status lane or assignee.

### Example Request

```bash
curl -X POST https://kynov.dev/api/v1/issues \
  -H "Content-Type: application/json" \
  -d '{"title": "Implement Webhooks", "points": 5, "priority": "high"}'
```
