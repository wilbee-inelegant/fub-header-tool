# FUB → Muse header builder

Create a Follow Up Boss HTTP Basic `Authorization` value **entirely in your browser**.

- **Hosted tool:** https://fub.inelegant.solutions/mcp/muse-header/
- **Source:** https://github.com/wilbee-inelegant/fub-header-tool
- **Standalone file:** [`muse.html`](muse.html)
- **Setup instructions:** https://fub.inelegant.solutions/mcp/instructions/

## Run fully offline

```sh
git clone https://github.com/wilbee-inelegant/fub-header-tool.git
cd fub-header-tool
```

Review `muse.html`, then open that file directly in your browser (double-click it, or use File → Open). **Disconnect from the internet before entering your key.** No package installation, build, local server, account, or external script is needed. You may instead download `muse.html` or save the hosted page before entering a key. Never save a page after entering credentials.

1. Paste your raw FUB API key into the API key field.
2. Choose **Create header**, then **Copy header value**.
3. In Muse's supported protected credential flow, use credential type `custom_header:Authorization`, restricted to `api.followupboss.com`, and paste the generated value including `Basic `.
4. Do not enter the value into an ordinary chat message. If the credential form already labels the field Authorization, do not add `Authorization:` to the value.
5. Clear the fields and replace your clipboard contents after pasting. If automatic copy is unavailable for a local file, the page reveals and selects the value for manual copy.

Have Muse verify the actual connector and credential flow for your account first. This describes a **direct REST connector**, reported working in one owner's account, not an MCP installation or a universal Muse feature. Validate only with an explicitly authorized minimal read-only identity request; the builder does not validate a key or send any FUB request. A read-only test does not reduce the API key's permissions.

**ChatGPT MCP adapter users:** supply the raw key through its protected `FUB_API_KEY` setting. Do not supply this generated header there; the adapter adds Basic authentication itself.

## Exact format

```text
Authorization: Basic BASE64(UTF8(API_KEY + ":"))
```

The tool copies only the value (`Basic …`), not the header name. The trailing colon is required because FUB uses the API key as its Basic username and an empty password. Base64 is reversible encoding, **not encryption**. Treat the generated value exactly like the original key. ASCII and well-formed Unicode are encoded as UTF-8; empty input, whitespace, colons, control characters, malformed UTF-16, and an existing Basic prefix are rejected without echoing the input.

## Security boundary

`muse.html` is one self-contained file. It contains no `fetch`, XMLHttpRequest, WebSocket, beacon, telemetry, external dependencies, service worker, cookies, local/session storage, form submission, URL parameters, or console logging. A hash-based Content Security Policy permits only the reviewed inline script/style and blocks network connections and forms. The code clears its input/output on page exit and restoration, and invalidates old output when the key changes. It does not promise secure erasure of browser memory.

The hosted page must initially be downloaded from its web host, which can receive ordinary page-request metadata. The entered key and generated value are not part of that request and are never deliberately transmitted by this page. Following an external documentation/source link is an ordinary separate navigation. Use a reviewed local file while disconnected for the strongest practical separation from hosting changes.

Clipboard access happens only when you click Copy. The system clipboard, clipboard history/sync, password managers, browser extensions, screenshots, browser recovery behavior, and compromised devices are outside this tool's control. Do not use real keys in automated tests, issues, logs, or screenshots. Opening a modified copy is not covered by this review.

The older `index.html` and `make-fub-headers.html` files are legacy Zapier-format helpers. Use `muse.html` for this Muse workflow. Their source is retained for compatibility; the new hosted Muse tool does not load them.

## Verify the code

With Node installed, the dependency-free check is:

```sh
node scripts/test-muse.cjs
```

An optional browser regression suite uses an existing Playwright installation, with **synthetic keys only**:

```sh
NODE_PATH=/path/to/existing/node_modules node scripts/browser-test-muse.cjs
```

The suite checks local-file operation with the browser offline, UTF-8 Base64 correctness, copying and denied-copy fallback, repeated actions, invalid inputs, key/header masking, clearing/restoration, no persistent storage, CSP, network API instrumentation, and mobile/desktop overflow. The suite uses an isolated headless profile of already-installed Google Chrome; it never uses your signed-in profile. No credential should be provided to the test commands.

Source reference: [Follow Up Boss authentication](https://docs.followupboss.com/reference/authentication).
