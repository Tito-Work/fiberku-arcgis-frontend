import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import MapPage from "./pages/MapPage";
import UserManagement from "./pages/UserManagement";
import RoleManagement from "./pages/RoleManagement";
import SegmentsPage from "./pages/SegmentsPage";
import OperatorsPage from "./pages/OperatorsPage";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LandingPage />} />
        
        <Route path="/login" element={<Login />} />

        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <RoleManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/segments"
          element={
            <ProtectedRoute>
              <SegmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operators"
          element={
            <ProtectedRoute>
              <OperatorsPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}