# Bathroom Finder

Bathroom Finder is a responsive web app for finding a public restroom and checking whether it meets your needs before you go. It grew out of a CS171 Figma prototype and runs in a browser on phones, tablets, and desktops.

[Try the live app](https://yihui-xiong.github.io/bathroom-finder/) · [Read the research](https://yihui-xiong.github.io/bathroom-finder/#research) · [View the Figma design](https://www.figma.com/design/TdM16LxBGuI3lmmV0N2l4w/CS171---Bathroom-Finder)

## Why this project exists

A nearby restroom is useful only if you can get to it and use it. In its November 2025 analysis, the NYC Council estimated that 49.4% of New Yorkers lived within a five-minute walk of a public restroom. It listed just 8 of 973 operational public restrooms as available 24/7. The app's launch page also summarizes published research on urgent access, wheelchair accessibility, and restroom avoidance among transgender and nonbinary youth. [NYC Council public restroom analysis](https://council.nyc.gov/data/public-restroom-analysis/)

## What the app does

- **Find nearby places.** Select **Find near me**, finish the entry guide, and allow location access. Pan the map and select **Search this area** to look somewhere else.
- **Check access before leaving.** Filter for wheelchair-accessible or all-gender facilities. Listings show hours, changing stations, and access notes when the source provides them.
- **Get directions and save favorites.** Tap a pin or result for details. Direction links open in Google Maps. Favorites stay in the current browser.
- **Browse saved listings offline.** The app keeps recent searches and favorites available after the first online visit.

## Run locally

Use Node.js 22 or later.

```sh
git clone https://github.com/yihui-Xiong/bathroom-finder.git
cd bathroom-finder
npm ci
npm run dev
```

Open the local URL that Vite prints. Location access requires browser permission and an HTTPS or localhost URL. The default map uses Leaflet and OpenStreetMap. [Browser geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition)

## Offline use

1. Open the app while online and wait for **Available offline after this visit**.
2. Search an area while connected to save its results in your browser.
3. When offline, choose **Open saved map**. The app opens the most recent saved area or the bundled NYC directory. Favorites remain available. Street map tiles, new searches, and online directions require a connection.

To test offline support locally, run `npm run build` and `npx vite preview`. The production build installs a service worker that caches the app and bundled data.

## Data and privacy

| Source | How the app uses it |
| --- | --- |
| [NYC Open Data](https://data.cityofnewyork.us/d/i7jb-7jku) | Bundled snapshot for the NYC preview, downloaded November 10, 2026. |
| [REFUGE Restrooms](https://www.refugerestrooms.org/) | Community listings returned for the selected search area. Coverage and listing detail vary by location. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) | Default street map tiles. |

The app sends the selected area's rounded coordinates to REFUGE for nearby searches. Saved searches and favorites stay in the browser. Distances in the results are straight-line estimates. Check a facility's listed hours and access notes before visiting, since availability can change.

## Optional Google Maps display

For your browser, open **Profile → Map settings**. You can request a no-cost demo key with a personal Google account for prototyping, or use a standard Maps JavaScript API browser key. Paste the key and select **Save map key**. Google Maps direction links are available from the default map. [Google Maps demo keys](https://developers.google.com/maps/documentation/javascript/demo-key) · [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started)

To enable the Google basemap for all visitors, set `VITE_GOOGLE_MAPS_BROWSER_KEY` in the build environment or in a local `.env.local`, then rebuild and deploy. A standard key requires a billing-enabled Google Cloud project. The browser receives this key with the build, so restrict it to the site's origin and the Maps JavaScript API. [Google Maps browser key setup](https://developers.google.com/maps/documentation/javascript/get-api-key)

## Build and deploy

The app uses React, TypeScript, Vite, Leaflet, and a service worker. It runs as a static site.

```sh
npm ci
npm run build -- --base=./
```

GitHub Pages serves the `gh-pages` branch. For a release, build from `main`, update `gh-pages` with the contents of `dist/`, and keep `.nojekyll` at the root of the publishing branch. Verify the launch page, map, and offline-ready indicator after publishing. [GitHub Pages branch publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

For the launch photo and other credits, see [Attributions](ATTRIBUTIONS.md).
