# Verge Five Public Visibility Scan Setup

The homepage visibility scan now calls a Cloudflare Pages Function:

- Endpoint: `POST /api/visibility-scan`
- Function: `functions/api/visibility-scan.js`

## Current Behavior

The scan always runs through the backend endpoint when deployed with Wrangler.

If no search API key is configured, it returns a basic entered-signal score from the business name, state, website, phone, and selected public proof signals.

If a search API key is configured, it performs a lightweight public web lookup and returns:

- visibility score from 1 to 5
- visibility label
- findings
- red flags
- public evidence links
- source mode
- disclaimer

## Supported Search Providers

Configure one of these Cloudflare Pages environment variables:

- `BRAVE_SEARCH_API_KEY`
- `SERPAPI_API_KEY`

Brave Search is checked first. SerpApi is used if Brave is not configured.

## Optional AI Review

The function can use a Cloudflare Workers AI binding named `AI`. The Wrangler config includes:

```toml
[ai]
binding = "AI"
```

For Cloudflare Pages Functions, also confirm the Pages project has a Workers AI binding named `AI` in the Cloudflare dashboard for the dev branch/environment. Without that binding, the endpoint returns deterministic findings and `aiStatus: "not-configured"` without exposing or hardcoding any API keys.

When the binding is available, the endpoint returns:

- `aiStatus: "active"`
- `aiRecommendation`: a short member-facing recommendation based on the live public search evidence, business identifiers, findings, and red flags.

## Deployment note

Visibility-scan changes follow the repository's GitHub Actions pipeline. Do not deploy Pages Functions or Workers from a local Wrangler command. The migration dev workflow deploys the `vergefive-next-dev` Worker only after environment-separation checks pass.

## Important Limits

This scan is a lead-generation visibility check, not a credit approval guarantee.

It cannot confirm:

- private business credit bureau files
- lender underwriting systems
- bank risk systems
- vendor internal approval rules

