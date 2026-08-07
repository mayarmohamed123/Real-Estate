# Aura Estates — Project Memory & API Reference

## Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 + Shadcn UI + `tw-animate-css`
- **Fonts**: Inter (sans), Playfair Display (heading)
- **State**: Redux Toolkit + RTK Query
- **Auth**: AWS Amplify (Cognito)
- **Maps**: `mapbox-gl` (already installed)
- **Forms**: react-hook-form + zod
- **Animations**: framer-motion (installed)

---

## Brand Design Tokens (from globals.css)
| Token | Value |
|---|---|
| `--primary` | `#c2a88e` (warm taupe) |
| `--background` | `#f9f7f2` (ivory) |
| `--foreground` | `#2e2b29` (dark brown) |
| `--tertiary` | `#4a443f` |
| `--muted` | `#f3f0eb` |
| `--border` | `#e5e2dc` |
| `--radius` | `12px` |
| Font Heading | Playfair Display → `font-heading` |
| Font Sans | Inter → `font-sans` |

---

## Server API Endpoints

Base URL: `http://localhost:3000` (dev) / `NEXT_PUBLIC_API_BASE_URL`

### Properties
| Method | Route | Description |
|---|---|---|
| `GET` | `/properties` | Get all properties with filters |
| `GET` | `/properties/:id` | Get single property by ID |
| `POST` | `/properties` | Create property (manager only, multipart) |
| `PUT` | `/properties/:id` | Update property (manager only) |
| `DELETE` | `/properties/:id` | Delete property (manager only) |

#### GET /properties — Query Params
| Param | Type | Description |
|---|---|---|
| `priceMin` | number | Min price per month |
| `priceMax` | number | Max price per month |
| `beds` | number \| "any" | Min bedrooms |
| `baths` | number \| "any" | Min bathrooms |
| `propertyType` | string \| "any" | Enum: Apartment, House, etc. |
| `squareFeetMin` | number | Min sqft |
| `squareFeetMax` | number | Max sqft |
| `amenities` | string (CSV) | e.g. "Pool,Gym" |
| `availableFrom` | timestamp \| ISO date | Filter by availability |
| `latitude` | number | Center lat for geo search (50km radius) |
| `longitude` | number | Center lng for geo search |
| `favoriteIds` | string (CSV) | Filter to specific property IDs |

#### Response shape (GET /properties)
```ts
Property {
  id: number
  name: string
  description: string
  pricePerMonth: number
  securityDeposit: number
  applicationFee: number
  photoUrls: string[]
  amenities: string[]
  highlights: string[]
  isPetsAllowed: boolean
  isParkingIncluded: boolean
  beds: number
  baths: number
  squareFeet: number
  propertyType: string
  postedDate: string
  averageRating?: number
  numberOfReviews?: number
  locationId: number
  managerCognitoId: string
  location: {
    id: number
    address: string
    city: string
    state: string
    country: string
    postalCode: string
    coordinates: { type, coordinates: [lng, lat] }  // GeoJSON Point
  }
}
```

### Users
| Method | Route | Description |
|---|---|---|
| `GET` | `/tenants/:cognitoId` | Get tenant profile |
| `PUT` | `/tenants/:cognitoId` | Update tenant settings |
| `GET` | `/managers/:cognitoId` | Get manager profile |
| `PUT` | `/managers/:cognitoId` | Update manager settings |

### Leases
| Method | Route | Description |
|---|---|---|
| `GET` | `/leases` | Get all leases |
| `GET` | `/leases/:id` | Get single lease |
| `POST` | `/leases` | Create lease |

---

## Redux Store Structure

```
store
├── global (globalSlice)
│   ├── isSidebarCollapsed: boolean
│   ├── isFiltersFullOpen: boolean
│   ├── viewMode: "grid" | "list"
│   └── filters: FiltersState
│       ├── location: string          (default: "Los Angeles")
│       ├── beds: string              (default: "any")
│       ├── baths: string             (default: "any")
│       ├── propertyType: string      (default: "any")
│       ├── amenities: string[]       (default: [])
│       ├── availableFrom: string     (default: "")
│       ├── priceRange: [number, number] | null  (default: null)
│       ├── squareFeet: [number, number] | null  (default: null)
│       └── coordinates: { lat: number, lng: number }
│                                     (default: LA = { lat: 34.0549, lng: -118.2426 })
└── api (RTK Query)
    ├── getAuthUser
    ├── getProperties        ← NEW
    ├── updateTenantSetting
    └── updateManagerSetting
```

### Redux Actions
| Action | Payload | Effect |
|---|---|---|
| `setIsSidebarCollapsed` | boolean | Toggle dashboard sidebar |
| `setFilters` | `Partial<FiltersState>` | Merge-update filter values |
| `toggleFiltersFullOpen` | — | Toggle full filter panel open/close |
| `setViewMode` | `"grid" \| "list"` | Switch listing view mode |

---

## App Route Structure

```
app/
├── (nondashboard)/          ← Public pages (Navbar + Footer layout)
│   ├── page.tsx             ← Landing page (/)
│   ├── properties/
│   │   └── page.tsx         ← Search page (/properties)
│   └── (auth)/              ← Sign in / Sign up
├── (dashboard)/             ← Authenticated pages
│   ├── tenants/
│   └── managers/
└── layout.tsx               ← Root layout (fonts, providers)
```

---

## Component Architecture

```
components/
├── layout/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── DashboardHeader.tsx
│   └── AppSidebar.tsx
├── search/                   ← Search page components
│   ├── FiltersBar.tsx        ← Top filter pill-buttons
│   ├── FiltersPanel.tsx      ← Animated full-filter slide panel
│   ├── PropertyCard.tsx      ← Individual property card
│   ├── PropertyListings.tsx  ← Grid/List container
│   └── MapView.tsx           ← Mapbox GL map
├── sections/                 ← Landing page sections
└── shared/                   ← Shared utility components
```

---

## Key Patterns

### Auth Pattern (JIT user creation)
User is looked up in DB after Cognito login. If 404, they are created automatically. See `state/api.ts → getAuthUser`.

### Map
Uses `mapbox-gl` (already installed). Requires `NEXT_PUBLIC_MAPBOX_TOKEN` env var. Render as client-only component with `dynamic(() => import(...), { ssr: false })`.

### Geocoding
Server uses Nominatim (free, no key) to geocode addresses. PostGIS stores coordinates. Geo-search radius = 50km.
