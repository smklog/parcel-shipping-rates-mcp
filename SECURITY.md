# Security policy

## Reporting a vulnerability

Email **info@smklog.com**. Plain text is fine; there is no form. The same
contact is published at <https://smklog.com/.well-known/security.txt>
(RFC 9116).

What helps: the exact endpoint or file, what you sent, what came back, and
whether you needed credentials. A single request that demonstrates the problem
is worth more than a scanner report.

Please do not load-test the hosted endpoint, attempt denial of service, or
touch a real customer's order or address data. It is a live logistics service
with real shipments in it. If a proof needs customer data, describe the path
and we will reproduce it ourselves.

There is no bug bounty and we do not pay for reports. Send the finding anyway;
we fix what is real.

## What is in scope

- This repository: the stdio bridge in `bin/`, the Dockerfile and the
  published snapshots.
- The hosted MCP endpoint `https://quote-api.smklog.com/mcp`.

## Supported versions

Only the latest commit on `main` and the endpoint as it runs today. The bridge
has no dependencies, so there is nothing to patch downstream: update by
re-running `npx -y github:smklog/parcel-shipping-rates-mcp` or rebuilding the
Docker image.

## Design notes that limit exposure

- No secrets anywhere. The server needs no API key, token or account, and the
  bridge reads none. Carrier and payment credentials live only on the server
  side and never reach a client.
- Nothing here can spend money. `create_checkout_link` returns a URL; a person
  opens it, confirms the contents and pays on the smklog.com checkout.
- All traffic is HTTPS. The bridge talks to one endpoint, set by
  `SMKLOG_MCP_URL`.
