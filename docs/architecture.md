# Kynov Technical Architecture & Decision Records

Detailed system design, data flow diagrams, and isolation boundaries.

## System Topology

Kynov executes on Cloudflare Edge nodes, leveraging distributed D1 SQLite for minimal query latency and maximum tenant isolation.

### Security Constraints

- Authentication via secure HTTP-only JWT cookies with 15-minute rotation.
- Rate limits: 120 requests per minute per IP for public endpoints; 1000/min for authenticated members.
