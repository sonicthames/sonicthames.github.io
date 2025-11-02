# Sonic Thames

An interactive audio-visual web experience exploring the River Thames through sound, sight, and sensation. This project maps geolocated multimedia recordings along the Thames, presenting them through an immersive interface with categories: **Listen**, **See**, and **Feel**.

🌐 **Live Site**: [https://sonicthames.github.io](https://sonicthames.github.io)

## Documentation

- `README.md` (this file) – overview, setup, and scripts
- `AGENTS.md` – architecture, code patterns, and conventions
- `DEVELOPMENT.md` – quick reference for commands, debugging, and common tasks
- `CONTRIBUTING.md` – git workflow and PR process

## About

Sonic Thames is a React-based web application that combines interactive mapping with multimedia content to create a unique sonic exploration of the Thames. Users can:

- 🗺️ Navigate an interactive Mapbox map showing recording locations along the River Thames
- 🎧 Browse audio-visual recordings categorized by sensory experience (Listen, See, Feel)
- 📍 Explore geotagged content with detailed location information and timestamps
- 📱 Experience responsive design optimized for desktop and mobile devices

The application features recordings of various Thames locations including wooden jetties, industrial structures, wildlife habitats, and peaceful green areas, each capturing a unique moment in time.

## Tech Stack

### Frontend
- **React 17** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v3** - Utility-first CSS framework
- **vanilla-extract** - Type-safe CSS-in-JS for design tokens
- **Radix UI** - Accessible UI primitives
- **shadcn/ui** - Composable component library
- **React Router** - Client-side routing
- **Mapbox GL** - Interactive mapping

### State Management & Utilities
- **RxJS** - Reactive programming
- **fp-ts** - Functional programming utilities
- **io-ts** - Runtime type validation
- **Luxon** - Date/time handling

### Build & Development
- **Vite** - Build tool and dev server
- **Biome** - Linting and formatting
- **Vitest** - Testing framework
- **pnpm** - Package manager

## Prerequisites

- **Node.js** (v16 or higher recommended)
- **pnpm** (v9.12.3 or compatible)
- **Mapbox API Token** - Required for map functionality

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sonicthames/sonicthames.github.io.git
cd sonicthames.github.io
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with your Mapbox token:

```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

You can obtain a Mapbox token by signing up at [mapbox.com](https://www.mapbox.com/) and creating an access token in your account settings.

### 4. Run Development Server

```bash
pnpm dev
```

This will start the development server at `http://localhost:3001` and automatically open it in your browser.

## Available Scripts

### Development

```bash
# Start development server
pnpm dev

# Run type checking
pnpm typecheck

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format

# Check formatting without making changes
pnpm format:check
```

### Building

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm serve

# Clean build artifacts
pnpm clean
```

### Icons

```bash
# Regenerate icon components from SVG files
pnpm build-icons

# Generate icons without cleaning
pnpm generate-icons
```

### Deployment

```bash
# Deploy to GitHub Pages
pnpm deploy
```

## Analytics

Event capture is handled through PostHog Cloud—no local services required.

1. Copy `.env.template` to `.env` and add your values:
   - `VITE_MAPBOX_TOKEN` – public Mapbox token for map tiles
   - `VITE_POSTHOG_KEY` – PostHog project API key (write-only)
   - `VITE_POSTHOG_HOST` – defaults to `https://eu.posthog.com`; adjust if your project uses another region
2. Restart `pnpm dev` so the environment variables are picked up.
3. Trigger interactions (e.g., hover/click the tracked CTA on the About page) and confirm events appear in PostHog → Live events.

Analytics helpers:

- Use `TrackedCta` for buttons/links you want to monitor.
- The `useHoverAnalytics` hook records `cta_hover` events with dwell time.
- `trackCtaClick` and `trackCtaHover` in `src/lib/analytics.ts` are available if you need manual instrumentation elsewhere.

Smoke test checklist:

- `pnpm dev`
- Visit the About page, hover the “Explore the map” CTA for ~1s, then click it.
- In PostHog, filter by `event = cta_click` or `cta_hover` to verify ingestion.

## Project Structure

```
sonicthames.github.io/
├── public/              # Static assets (logos, manifest, robots.txt)
├── scripts/             # Build and deployment scripts
├── src/
│   ├── components/      # Reusable UI components
│   │   └── ui/          # UI component library (Button, Link, Panel, Dialog, etc.)
│   ├── domain/          # Domain models and types
│   ├── icon/            # Icon components
│   │   ├── generated/   # Auto-generated icon components
│   │   └── template.js  # SVGR template for icon generation
│   ├── lib/             # Utility functions and helpers
│   │   └── rxjs/        # RxJS utilities and operators
│   ├── pages/           # Page components
│   │   ├── about/       # About page
│   │   ├── contact/     # Contact page
│   │   ├── main/        # Main page with map
│   │   ├── sound/       # Individual sound detail page
│   │   └── sounds/      # Category listing pages
│   ├── styles/          # Styling system
│   │   ├── theme.css.ts     # vanilla-extract design tokens and themes
│   │   ├── recipes.css.ts   # vanilla-extract component recipes
│   │   └── tailwind.css     # Tailwind CSS entry point
│   ├── theme/           # Legacy theme utilities (colors, spacing, media queries)
│   ├── App.tsx          # Main application component
│   ├── data.json        # Sound recordings data
│   ├── data.io.ts       # Runtime type validation for data
│   └── index.tsx        # Application entry point
├── static/
│   └── icons/           # Source SVG icons
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tailwind.config.ts   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Data Structure

Sound recordings are defined in [src/data.json](src/data.json) with the following schema:

```typescript
{
  title: string;              // Recording title
  description: string[];      // Description paragraphs
  marker: string;             // Short marker label
  category: "Listen" | "See" | "Feel";
  duration: string;           // ISO 8601 duration (e.g., "PT01M29S")
  location: string | null;    // Location name
  access: string | null;      // Access instructions
  coordinates: {
    lat: number;              // Latitude
    lng: number;              // Longitude
  };
  dateTime?: string;          // ISO timestamp
  interval?: string;          // ISO interval
  videoSrc: string;           // YouTube video ID
  thumbnailSrc: string | null;
}
```

## Deployment

The project is configured for deployment to GitHub Pages. The deployment process:

1. Validates that `VITE_MAPBOX_TOKEN` is set (checks multiple environment variable names)
2. Builds the production bundle
3. Deploys to the `gh-pages` branch using `gh-pages` package

### Deploy to GitHub Pages

```bash
# Set your Mapbox token
export VITE_MAPBOX_TOKEN=your_token_here

# Deploy
pnpm deploy
```

### Environment Variables for Deployment

The deployment script accepts the following environment variable names (in order of priority):
- `VITE_MAPBOX_TOKEN`
- `MAPBOX_TOKEN`
- `MAPBOX_ACCESS_TOKEN`

## Accessibility

The project includes comprehensive accessibility features:

- **ARIA Labels**: All interactive elements have appropriate ARIA labels
- **Semantic HTML**: Proper use of semantic elements
- **Icon Accessibility**: Custom SVG icons include `role="img"`, `aria-label`, and `<title>` elements
- **Keyboard Navigation**: Full keyboard support for interactive elements

## Browser Support

The application is optimized for modern browsers:

**Production:**
- Browsers with >0.2% market share
- Excludes dead browsers
- Excludes Opera Mini

**Development:**
- Latest Chrome
- Latest Firefox
- Latest Safari

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for git workflow and PR process. For architecture and code patterns, check [AGENTS.md](AGENTS.md). For development setup and commands, see [DEVELOPMENT.md](DEVELOPMENT.md).

## Icon Generation

Icons are automatically generated from SVG files using SVGR with a custom template that adds accessibility features. To add new icons:

1. Add your SVG file to `static/icons/`
2. Run `pnpm build-icons`
3. Import from `src/icon/generated/`

## License

This project is private and not licensed for public use. Contact the repository owner for permissions.

---

Built with ❤️ for the Thames
