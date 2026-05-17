# Fiberku - Network Monitoring System

A React + Vite frontend for fiber network management, GIS visualization, and role-based access control.

## Project Overview

This application is a spatial network management dashboard built around ArcGIS mapping. It connects to a backend API to manage customers, packages, operators, segments, users, roles, and permissions.

Key capabilities include:
- Secure login with JWT authentication
- Interactive ArcGIS 2D map with customer points, fiber lines, and coverage polygons
- CRUD operations for customers, packages, operators, segments, users, and roles
- Role and permission management for RBAC enforcement
- Data filtering by coverage area, package, and operator
- Modern UI layout with responsive sidebar and navbar
- Restore soft-deleted records functionality

## Features

### Authentication & User Management
- Login with JWT authentication and session management
- User management: create, edit, delete, activate, deactivate
- Role assignment to users
- Protected routes for authenticated pages

### Role Management
- List roles with their permissions
- Create new roles
- Edit role permissions
- Delete roles

### Customer Management
- Customer CRUD operations via backend services
- Customer geolocation and package assignment
- Filter customers by coverage area, package, and operator
- Soft delete with restore capability

### Network Infrastructure Management
- **Packages**: List, create, edit, delete service packages
- **Coverages**: List, create, edit, delete coverage areas
- **Segments**: List, create, edit, delete network segments (soft delete with restore)
- **Operators**: List, create, edit, delete network operators
- **Fiber Optics**: List, create, edit, delete fiber optic infrastructure

### Map Features
- Interactive ArcGIS 2D map with:
  - Customer point features
  - Fiber optic polyline features
  - Coverage polygon features
  - Interactive selection and availability checks
  - Layer visibility toggles
  - Map legend
- Spatial data loaded from backend via GeoJSON endpoints

### RBAC (Role-Based Access Control)
- Permission-based UI rendering using helper hooks
- Route guards for protected pages
- Permission checks for:
  - Users (create, read, update, delete)
  - Roles (create, read, update, delete)
  - Customers (create, read, update, delete)
  - Packages (create, read, update, delete)
  - Coverages (create, read, update, delete)
  - Segments (create, read, update, delete)
  - Operators (create, read, update, delete)
  - Fiber Optics (create, read, update, delete)

### User Roles
- `admin` - Full access to all features
- `operator` - Operational access to manage operational data
- `viewer` - Read-only access

## Tech Stack

- React 18
- Vite
- Tailwind CSS 4
- ArcGIS API for JavaScript (`@arcgis/core`)
- React Router DOM
- Zustand (state management)
- Axios (HTTP client)
- SweetAlert2 (alerts/modals)
- lucide-react (icons)
- Recharts (charts)

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   ```bash
   copy .env.example .env
   ```

3. **Edit `.env` with your values:**
   ```env
   VITE_ARCGIS_API_KEY=YOUR_KEY_HERE
   VITE_API_URL=http://localhost:8000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_ARCGIS_API_KEY` | ArcGIS API key used by the map |
| `VITE_API_URL` | Backend API base URL for auth and data services |

## App Structure

```
src/
├── pages/              # Page views
│   ├── LandingPage.jsx
│   ├── Login.jsx
│   ├── MapPage.jsx
│   ├── UserManagement.jsx
│   ├── RoleManagement.jsx
│   ├── SegmentsPage.jsx
│   └── OperatorsPage.jsx
├── components/
│   ├── layout/         # UI layout components (Sidebar, Navbar)
│   ├── map/            # ArcGIS map components (MapView)
│   └── rbac/           # RBAC helper UI components
├── routes/
│   ├── ProtectedRoute.jsx    # Auth route protection
│   └── PermissionGuard.jsx  # Permission-based access control
├── services/           # API service wrappers
│   ├── authService.js
│   ├── userService.js
│   ├── roleService.js
│   ├── customerService.js
│   ├── packageService.js
│   ├── coverageService.js
│   ├── segmentService.js
│   ├── operatorService.js
│   ├── fiberOpticService.js
│   └── mapService.js
├── store/              # Zustand state stores
│   └── authStore.js
├── hooks/              # Custom React hooks
│   ├── usePermissions.js
│   ├── useHasPermission.js
│   └── useCanAccess.js
└── utils/
    ├── permissions.js      # Permission constants and role definitions
    └── rbac.js              # RBAC helper functions
```

## Backend Integration

This frontend expects the backend API at `VITE_API_URL` to support:

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/check-permission` - Permission verification

### User Management
- CRUD operations at `/api/v1/users/`
- Restore at `/api/v1/users/{id}/restore`

### Role Management
- CRUD operations at `/api/v1/roles/`

### Permission Management
- `GET /api/v1/permissions/` - List all permissions
- `GET /api/v1/permissions/modules` - List permission modules

### Customer Management
- CRUD operations at `/api/v1/customers/`
- Restore at `/api/v1/customers/{id}/restore`

### Network Infrastructure
- **Packages**: CRUD at `/api/v1/packages/`
- **Coverages**: CRUD at `/api/v1/coverages/`
- **Segments**: CRUD at `/api/v1/segments/` with restore capability
- **Operators**: CRUD at `/api/v1/operators/`
- **Fiber Optics**: CRUD at `/api/v1/fiber-optics/`

### GeoJSON Endpoints
- `GET /api/v1/geojson/customers` - Customer locations
- `GET /api/v1/geojson/coverages` - Coverage areas
- `GET /api/v1/geojson/fiber-optics` - Fiber optic lines

## API Response Format

All backend responses follow a consistent structure:

### Success Response
```json
{
  "status": true,
  "code": "10001",
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": false,
  "code": "400",
  "message": "Error description",
  "data": null
}
```

## Requirements

- Node.js 18+
- ArcGIS API Key
- Running backend API at the configured `VITE_API_URL`