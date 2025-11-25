# Open Seats Tracker

Track open seats for your next semester courses at UMass.

Monitors currently enrolled sections and sections in your shopping cart using the Proxy Schedule Builder API.

## Configuration

- `PROXY_URL`: URL of the [schedule builder proxy](https://github.com/Lioness100/schedule-builder) (required, default: http://localhost:3007)
- `UMASS_TERM`: The semester term to track (required, default: Spring 2026)
- `CHECK_INTERVAL`: Time between checks in milliseconds (required, default: 60000 = 1 minute)
- `API_KEY`: Optional API key for authentication
- `WEBHOOK_URL`: Optional Discord webhook URL for notifications

## Setup

1. Make sure the schedule-builder proxy is running (see parent directory)

2. Install dependencies:
   ```bash
   bun install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   
4. Configure the proxy URL in `.env` (default: `http://localhost:3007`)

5. Run the tracker:
   ```bash
   bun start
   ```
