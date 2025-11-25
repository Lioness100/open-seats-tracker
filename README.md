# Spanish 311 Open Seats Tracker

A proof-of-concept application that tracks open seats for Spanish 311 at UMass
using the Proxy Schedule Builder API.

## Configuration

- `PROXY_URL`: URL of the [schedule builder proxy](https://github.com/Lioness100/schedule-builder) (required, default: http://localhost:3007)
- `CHECK_INTERVAL`: Time between checks in milliseconds (default: 60000 = 1 minute)
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
