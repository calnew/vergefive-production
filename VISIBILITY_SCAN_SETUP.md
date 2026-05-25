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

The function can use a Cloudflare Workers AI binding named `AI` if that binding is added to the Pages project. Without the binding, the endpoint still returns deterministic findings and recommendations.

## Wrangler Deploy Note

Cloudflare Pages Direct Upload supports Pages Functions only when deploying with Wrangler from the project root. This project deploy command already runs from the root:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' wrangler pages deploy public --project-name vergefive --branch main
```

Because the root now contains a `functions` folder, Wrangler uploads the Pages Function along with the static `public` assets.

## Important Limits

This scan is a lead-generation visibility check, not a credit approval guarantee.

It cannot confirm:

- private business credit bureau files
- lender underwriting systems
- bank risk systems
- vendor internal approval rules

