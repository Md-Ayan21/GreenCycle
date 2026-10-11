# GreenCycle client

## API configuration

The client reads its API base URL from `VITE_API_URL`. Include the backend's
`/api` prefix, for example:

```text
VITE_API_URL=https://your-deployed-backend.example.com/api
```

Set this variable in the frontend hosting provider's environment settings
before building/deploying the client. Vite embeds `VITE_` variables in the
build, so rebuild after changing it. If unset, the client uses same-origin
`/api`, which works with a production reverse proxy. In local development, Vite
proxies `/api` requests to `http://localhost:5000`.

If the deployed backend has a separate public domain, set `VITE_API_URL` to
that backend URL ending in `/api`, then rebuild the client.
