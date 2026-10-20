# Changelog

Versioning: the major and minor numbers follow the hosted server
(`com.smklog/parcel-shipping-rates` in the official MCP registry); the patch
number moves when only this bridge, its snapshots or its documentation change.
The hosted endpoint is updated in place, so a client always talks to the
current server whatever version of the bridge it runs.

## 2026-10-20 — documentation, no version change

- `SECURITY.md`: how to report a vulnerability, scope, supported versions.
- README: configuration of the bridge, secrets (there are none) and what data
  the hosted server keeps.
- This changelog.

## 2026-10-12 — 1.4.2 (README)

- README links the shipping calculator for people not using an assistant.

## 2026-09-28 — 1.4.2

- Parcels only: the README no longer offers freight, pallets or multi-box
  quotes. One box is one label.
- Snapshots (`initialize.json`, `tools.json`, `server-card.json`) re-taken
  from the live server.

## 2026-09-04 — 1.4.1

- Snapshots: each rate carries one checkout total; the fee is itemized only on
  the receipt.

## 2026-09-02 — 1.4.0 (bridge)

- The repository runs as a local MCP server: zero-dependency stdio bridge,
  Dockerfile, `package.json`.
- The bridge mirrors the MCP 2026-07-28 routing envelope into HTTP headers
  (`MCP-Protocol-Version`, `Mcp-Method`, `Mcp-Name`).
- CI runs the bridge tests on push, on pull requests and once a day against
  the live endpoint.
- Manifests for editor directories (`.mcp.json`) and the Gemini CLI
  (`gemini-extension.json`, `GEMINI.md`).

## 2026-09-01 — server 1.4.0

- Fifth tool `get_checkout_status`; `create_checkout_link` returns a
  `session_id` and accepts a `quote_id`.
- Every tool description carries its parameter rules and limits.
- DHL Express named where it rates (Germany and Australia).

## 2026-09-01 — server 1.3.0

- Published card, tools and README synced with the live server.

## 2026-08-28 — server 1.2.0

- First public commit: README, live tool schemas, server card.
