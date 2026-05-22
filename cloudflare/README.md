# Cloudflare Worker (Defer-first)

Use `cloudflare/worker.js` as your Worker code.

## Required Worker variables
- `DISCORD_PUBLIC_KEY`: Discord application public key (hex)
- `GAS_WEBHOOK_URL`: GAS Web App URL
- `PROXY_TOKEN`: Shared secret with GAS Script Properties

## GAS Script Properties
- `PROXY_TOKEN`: same value as Worker
- `DISCORD_WEBHOOK_URL`: for local GAS test function `message()`
- `CALENDAR_ID`: optional for future calendar command

## Behavior
- Verifies Discord signature
- Responds in 3 seconds with deferred response (`type: 5`)
- Runs GAS in background (`waitUntil`)
- Sends final message by Discord followup webhook
