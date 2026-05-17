# Network Management System

## Overview

The Network Management System is a comprehensive web application built with React and FastAPI for managing fiber optic network infrastructure, customer data, and network coverage analysis.

## Features

### 🗺️ Network Visualization
- Interactive map with ArcGIS integration
- Real-time coverage area visualization
- Customer location mapping
- Fiber optic network route display

### 👥 Customer Management
- Add, update, and delete customers
- Geographic customer placement
- Package assignment and management
- Customer analytics and reporting

### 📦 Package Management
- Dynamic package configuration
- Color-coded package identification
- Package performance analytics
- Revenue tracking by package

### 🌐 Coverage Analysis
- Occupation capacity visualization
- Color-coded utilization indicators:
  - 🟢 **Green**: ≤50% capacity utilization
  - 🟡 **Yellow**: 51-80% capacity utilization  
  - 🔴 **Red**: >80% capacity utilization
- Real-time capacity monitoring

### 👤 User Management
- Role-based access control (RBAC)
- User authentication and authorization
- Permission-based feature access
- Secure session management

### 📊 Analytics Dashboard
- Customer distribution charts
- Package performance metrics
- Revenue analytics
- Coverage utilization statistics

## Technology Stack

### Frontend
- **React 18** - UI framework
- **ArcGIS API for JavaScript** - Map visualization
- **Lucide React** - Icon library
- **Zustand** - State management
- **React Router** - Navigation
- **SweetAlert2** - Alert dialogs

### Backend
- **FastAPI** - API framework
- **SQLAlchemy** - ORM
- **Pydantic** - Data validation
- **ULID** - Unique identifiers
- **PostgreSQL** - Database

## Architecture

### Frontend Structure
```
src/
├── components/
│   ├── layout/          # Layout components (Navbar, Sidebar)
│   ├── map/            # Map-related components
│   └── forms/          # Form components
├── pages/              # Page components
├── services/           # API service layers
├── store/             # State management
└── routes/            # Route protection
```

### Backend Structure
```
app/
├── models/            # Database models
├── schemas/           # Pydantic schemas
├── routers/           # API endpoints
├── services/          # Business logic
└── core/              # Core configuration
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/users/me` - Current user info

### Packages
- `GET /api/v1/packages/` - List all packages
- `POST /api/v1/packages/` - Create package
- `PUT /api/v1/packages/{id}/` - Update package
- `DELETE /api/v1/packages/{id}/` - Delete package

### Customers
- `GET /api/v1/customers/` - List customers
- `POST /api/v1/customers/` - Create customer
- `PUT /api/v1/customers/{id}/` - Update customer
- `DELETE /api/v1/customers/{id}/` - Delete customer

### GeoJSON Data
- `GET /api/v1/geojson/customers` - Customer locations
- `GET /api/v1/geojson/coverages` - Coverage areas
- `GET /api/v1/geojson/fiber-optics` - Fiber routes

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL database

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:8000
DATABASE_URL=postgresql://user:password@localhost/dbname
```

## Security Features

- JWT-based authentication
- Role-based access control
- API endpoint protection
- Secure session management
- CORS configuration

## Performance Optimization

- Lazy loading for map components
- API response caching
- Optimized database queries
- Component memoization

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For technical support or questions, please contact the development team.

---

*Last updated: December 2024*
