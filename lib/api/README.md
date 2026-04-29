# Hela AI – Front‑End API Layer

## Overview
This folder contains a small, typed data‑access layer that talks to the Hela AI FastAPI backend.  
All calls go through a single **Axios** instance which automatically injects the required `X‑Internal‑Key` header.

## Usage
```ts
import { HelaApiService } from './HelaApiService';
// Example: check health
const result = await HelaApiService.healthCheck();
if (result.ok) {
  console.log('Backend is healthy');
} else {
  console.error('API Error:', result.val.message);
}
```

## Environment Variables
Variable | Description
--- | ---
`NEXT_PUBLIC_HELA_API_URL` | Backend base URL (default: https://web-production-fadce.up.railway.app/api/v1).
`NEXT_PUBLIC_HELA_API_KEY` | Secret internal key – never commit to source control.

## Testing
Run `npm run test` (if configured) to run Jest suite that mocks Axios.
