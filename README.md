<p align="center">
  <img src="https://smklog.com/assets/icon-192.png" width="88" alt="SMKlog">
</p>

<h1 align="center">SMKlog Parcel Shipping Rates — MCP Server</h1>

<p align="center">
  Live USPS, UPS and FedEx rates for a US parcel described in plain words.<br>
  No scale. No account. No API key.
</p>

<p align="center">
  <code>https://quote-api.smklog.com/mcp</code> · streamable-http · MCP 2026-07-28, 2025-06-18, 2025-03-26
</p>

---

Most shipping APIs want a box: length, width, height, weight. People don't have
that — they have a thing on the table and a ZIP code to send it to. This server
takes the thing.

Describe **"a full-size acoustic guitar in its hard case"** and it estimates the
packed carton, prices it live across three carriers, and hands back services you
can actually buy — with the checkout total and the carrier's own cost side by
side, so you can always show a person both numbers.

## What you can ask your assistant

- *"How much to ship a 12 lb box from 07922 to 90011?"*
- *"What would it cost to send a full-size acoustic guitar in a hard case from New Jersey to Los Angeles?"*
- *"Compare USPS, UPS and FedEx for a 5 lb box, Newark to Chicago — which is cheapest and which is fastest?"*
- *"Price a 24 × 18 × 12 in box at 22 lb going to 33101, then give me a link to buy the label."*
- *"Where is my package? Tracking 9400111899561234567890."*
- *"What has a 5 lb box to Denver cost over the last few months?"*
- *"I have a pallet of ceramic tile going from Hoboken to Miami — can you get me a quote?"*

That last one is not a parcel, and the server says so rather than guessing: it
returns a task handle, a person prices the freight, and the answer comes back
when you poll it.

## Tools

| Tool | What it does |
|---|---|
| **`get_parcel_quote`** | Live rates for one US-domestic parcel across USPS, UPS and FedEx. Plain-words description → estimated packed box; or pass exact dimensions and weight to skip the estimate. Returns up to five purchasable services with the checkout total, the carrier cost beneath it, and the delivery window. |
| **`create_checkout_link`** | Prices the shipment and returns a payment session: the amount, and a handoff URL that opens the SMKlog checkout prefilled with this shipment. The human confirms the contents certification and the carrier-adjustment consent there and pays on Stripe. |
| **`track_parcel`** | Delivery status, scan events and the carrier's estimated delivery date for a shipment whose label was bought on smklog.com. Not a universal tracker for arbitrary numbers. |
| **`get_price_index`** | The monthly SMKlog parcel price index: six common boxes (1–20 lb) from Newark, NJ to five US cities, repriced through the same live pipeline that prices real shipments. Reading it spends no quote allowance. |

## Things worth knowing before you wire it in

**A quote is a real carrier call and costs real money to produce.** Call
`get_parcel_quote` once per shipment, not once per variation you are curious
about. The server is rate limited per client and will say so plainly rather than
silently degrading.

**Origin is the United States.** Domestic lanes and US-origin exports. A lane
that starts somewhere else is out of scope, and the server will tell you instead
of inventing a number.

**Prices are checkout totals with the SMKlog fee inside**, and the carrier cost
comes back as its own field. Show whichever one the conversation needs — but the
total is what the person pays.

**Oversized, palletized and multi-piece freight is priced by a person.** Declare
the `io.modelcontextprotocol/tasks` extension and `get_parcel_quote` returns a
task handle for those; poll it with `tasks/get`.

**Nothing here buys a label on its own.** `create_checkout_link` produces a URL;
a human completes the purchase, certifies the contents and consents to carrier
adjustments. An agent cannot spend someone's money through this server.

## Connect

```json
{
  "mcpServers": {
    "smklog": {
      "type": "http",
      "url": "https://quote-api.smklog.com/mcp"
    }
  }
}
```

No key, no OAuth, no signup. Quoting, tracking and the price index are all open.

Other ways in, if MCP is not your transport:
[OpenAPI](https://quote-api.smklog.com/openapi.json) ·
[A2A agent card](https://quote-api.smklog.com/.well-known/agent-card.json) ·
[API docs](https://smklog.com/api) ·
[llms.txt](https://smklog.com/llms.txt)

## Who runs it

[SMKlog](https://smklog.com) sells US shipping labels. The same pricing pipeline
that answers this server answers the website — there is no separate "API rate".
Questions, bugs and odd results: **info@smklog.com**.
