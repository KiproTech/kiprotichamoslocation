# Location & Device Access (Client-Side)

A small React + Vite web app that lets a visitor see their **own** current
location, on their **own** screen, after explicitly granting browser
location permission.

## What it does

1. Explains what will be shown and asks for consent.
2. On "Allow & Continue", requests the browser's Geolocation API with
   high accuracy.
3. If accuracy is too poor, tells the visitor and offers **Try Again**
   instead of showing an unreliable position.
4. On a good result, shows:
   - Latitude / longitude / accuracy / time retrieved
   - A small embedded map centered on that location
   - An **Open My Location in Maps** link
   - Basic browser/device information (browser, OS, screen size,
     language, time zone)
5. Offers **Refresh Location** to request an updated position.

## What it does NOT do

- It does not send the location or device information to any server.
- It does not save anything to a database.
- It does not have an admin panel or any way for anyone other than the
  current visitor to see this data.
- It does not collect anything beyond what the standard, publicly
  documented browser APIs (`navigator.geolocation`, `navigator`,
  `screen`, `Intl`) provide with the visitor's explicit permission.

Everything lives in React component state for the current browser tab
only. Closing or refreshing the page clears it — there is no location
history.

## Development

```bash
npm install
npm run dev
```

Location access requires a secure context (HTTPS), except on
`localhost`, which browsers treat as secure for development.

## Build

```bash
npm run build
```
