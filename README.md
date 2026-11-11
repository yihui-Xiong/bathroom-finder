# Bathroom Finder

A responsive web app based on the [CS171 Bathroom Finder Figma project](https://www.figma.com/design/TdM16LxBGuI3lmmV0N2l4w/CS171---Bathroom-Finder). The launch page introduces the app and summarizes public restroom access research. Choose **Open map** to use the floating search and filter controls to find restrooms, tap map pins for details, and save places to Favorites.

## Run locally

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Run `npm run build` to generate the deployable files in `dist/`.

## Google Maps

In **Profile**, add a browser API key from a Google Cloud project with billing and the Maps JavaScript API enabled. Restrict the key to the Maps JavaScript API and the site origin shown in Profile, including the localhost origin for local use. Choose **Save and reload**. The setting stays in the current browser. OpenStreetMap is available by default and if Google Maps fails to load. Directions open in Google Maps from either map.

[Google Maps API key setup](https://developers.google.com/maps/documentation/javascript/get-api-key)

## Restroom data

**Find near me** on the launch page opens the map and asks for your location. If your browser already allows this site to use location, **Open map** also starts nearby. The NYC preview uses the [NYC Open Data restroom directory](https://data.cityofnewyork.us/d/i7jb-7jku) snapshot downloaded November 10, 2026. Use **Use my location** or pan and choose **Search this area** to look up nearby places through [REFUGE Restrooms](https://www.refugerestrooms.org/). The app sends the selected area's rounded coordinates to REFUGE for that lookup. Browser geolocation requires permission and HTTPS or localhost. REFUGE is a community directory with variable coverage. Hours and access can change.

### Enable Google Maps for every visitor

For a shared deployment, put `VITE_GOOGLE_MAPS_BROWSER_KEY` in your local `.env.local` or set it in your build environment, then rebuild and deploy. Use a browser key restricted to your site's origin and the Maps JavaScript API, since the build serves it to browsers. Your Google Cloud project needs billing and the Maps JavaScript API enabled. An individual key entered in **Profile** can override the site key.

## Use offline

Open the published site once while online and wait for **Available offline after this visit** on the launch page. Search an area online to save its restroom listings automatically. When offline, open the map to see the latest saved area, the bundled NYC directory when no area has been saved, and your favorites. Saved search areas use rounded coordinates and stay in this browser. Street map tiles, new listings, and online directions require a connection.

For a local offline test, run `npm run build` followed by `npx vite preview`. The offline cache is installed by the production build.

## GitHub Pages

The public demo uses the `gh-pages` branch. To update it, build from `main` with `npm ci` and `npm run build -- --base=./`, then update `gh-pages` with the contents of `dist/`. Keep `.nojekyll` at the root of the publishing branch.

[GitHub Pages branch publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
