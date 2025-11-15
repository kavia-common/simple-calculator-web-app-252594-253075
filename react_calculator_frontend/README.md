# Minimalist React Calculator

A clean, minimalist calculator built with React (Create React App) using a Pure White theme.

## Features

- Standard operations: +, −, ×, ÷
- Digits 0–9 and decimal input
- Equals (=), Clear (C/AC), Delete (⌫), Sign toggle (+/-), Percent (%)
- Chaining behavior (e.g., 2 + 3 × 4)
- Percent semantics:
  - Standalone: x → x/100
  - With operator: previous × current / 100
- Divide-by-zero shows “Error” until cleared
- Keyboard support:
  - Digits 0–9
  - Operators: +, -, *, /
  - Enter/Return (=)
  - Backspace (⌫)
  - Escape (Clear)
  - Period (.)
  - Percent (%)
- Accessible: ARIA labels, high-contrast focus outlines
- Minimalist Pure White theme with subtle shadow and rounded corners

## Getting Started

In the project directory:

### `npm start`
Runs the app in development mode.
Open http://localhost:3000 to view it in your browser.

### `npm test`
Launches the test runner.

### `npm run build`
Builds the app for production to the `build` folder.

## Tests

Lightweight tests cover:
- Initial display shows `0`
- `7 + 5 = 12`
- `1.2 + 3.4 = 4.6`
- Division by zero → `Error`
- Clear resets to `0`

## Theme

The Minimalist Pure White theme uses these colors:
- Primary: `#374151`
- Secondary: `#9CA3AF`
- Success: `#10B981`
- Error: `#EF4444`
- Background: `#FFFFFF`
- Surface: `#F9FAFB`
- Text: `#111827`

CSS variables are defined in `src/index.css` and consumed in `src/App.css`.
