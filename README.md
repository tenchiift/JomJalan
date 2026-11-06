# JomJalan

An Electron travel planner for the CSC2923 Object Oriented Programming final assignment.

## Files

- `main.js` creates the Electron window and syncs zoom level.
- `index.html` Explore page: search a destination, see the live forecast, pick a package and itinerary.
- `calculator.html` Budget calculator with optional add-ons and cost breakdown in MYR.
- `plans.html` My Travel Plans: save, rename and delete plans (Local Storage).
- `renderer.js` all application logic.
- `styles.css` shared styling for all pages.

## Run

```bash
npm ci
npm start
```

Requires Node.js and npm. No other setup is needed; saved plans persist in Local Storage.

## Features

1. Destinations: South Korea, Japan or Switzerland, with a selected place and travel dates.
2. Live daily forecast from the Open-Meteo Forecast API for the selected date range.
3. Travel packages per destination, each with a day-by-day itinerary.
4. Weather-based activity suggestion per day (indoor/outdoor), driven by the forecast.
5. Budget calculation in MYR with optional add-ons, plus save, view, rename and delete travel plans.
