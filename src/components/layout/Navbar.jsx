import {
  Menu,
  X,
  Users,
  Map,
  Settings,
  LogOut,
  Shield,
  User,
  ChevronDown,
  Users2,
  Layers,
  Network
} from "lucide-react";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "../../utils/permissions";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useState, useRef, useEffect } from "react";

export default function Navbar({
  sidebarOpen = false,
  setSidebarOpen = () => {},
}) {
  const { hasPermission } = usePermissions();
  const canManageUsers = hasPermission(PERMISSIONS.CREATE_USER);
  const canManageRoles = hasPermission(PERMISSIONS.CREATE_ROLE);
  const canManageSegments = hasPermission(PERMISSIONS.CREATE_SEGMENT);
  const canManageOperators = hasPermission(PERMISSIONS.CREATE_OPERATOR);
  const navigate = useNavigate();
  const location = useLocation();
  const { getUserInfo } = useAuthStore();
  const userInfo = getUserInfo();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('auth-storage');
    
    // Navigate to login
    navigate('/login');
  };

  const handleNavigateHome = () => {
    navigate('/map');
  };
  return (
    <div
      className="
        h-16
        bg-white
        border-b
        flex
        items-center
        justify-between
        px-4
        shadow-sm
        z-50
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* BURGER */}
        <button
          onClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* LOGO/BRAND */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={handleNavigateHome}
            className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
          >
            <img 
              src="/icon.png" 
              alt="Network Management System" 
              style={{ 
                width: '32px', 
                height: '32px',
                borderRadius: '6px'
              }}
            />
            {/* TITLE */}
            <div>
              <h1 className="font-bold text-lg">
                Network Management
              </h1>

              <p className="text-sm text-gray-500">
                Esri ArcGIS
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* CENTER - MENU */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate('/map')}
          className={`
            px-3 sm:px-4
            py-2
            rounded-xl
            border-2
            transition-all
            cursor-pointer
            shadow-sm
            hover:shadow-md
            flex items-center gap-2
            text-sm sm:text-base
            ${
              location.pathname === '/map'
                ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
            }
          `}
        >
          <Map size={14} />
          <span className="hidden sm:inline">Network Coverage</span>
        </button>
        
        { canManageRoles && (
          <button
            onClick={() => navigate('/roles')}
            className={`
              px-3 sm:px-4
              py-2
              rounded-xl
              border-2
              transition-all
              cursor-pointer
              shadow-sm
              hover:shadow-md
              flex items-center gap-2
              text-sm sm:text-base
              ${
                location.pathname === '/roles'
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }
            `}
          >
            <Shield size={14} />
            <span className="hidden sm:inline">Role Management</span>
          </button>
        )}

        {canManageUsers && (
          <button
            onClick={() => navigate('/users')}
            className={`
              px-3 sm:px-4
              py-2
              rounded-xl
              border-2
              transition-all
              cursor-pointer
              shadow-sm
              hover:shadow-md
              flex items-center gap-2
              text-sm sm:text-base
              ${
                location.pathname === '/users'
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }
            `}
          >
            <Users2 size={14} />
            <span className="hidden sm:inline">User Management</span>
          </button>
        )}

        {canManageSegments && (
          <button
            onClick={() => navigate('/segments')}
            className={`
              px-3 sm:px-4
              py-2
              rounded-xl
              border-2
              transition-all
              cursor-pointer
              shadow-sm
              hover:shadow-md
              flex items-center gap-2
              text-sm sm:text-base
              ${
                location.pathname === '/segments'
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }
            `}
          >
            <Layers size={14} />
            <span className="hidden sm:inline">Segments</span>
          </button>
        )}

        {canManageOperators && (
          <button
            onClick={() => navigate('/operators')}
            className={`
              px-3 sm:px-4
              py-2
              rounded-xl
              border-2
              transition-all
              cursor-pointer
              shadow-sm
              hover:shadow-md
              flex items-center gap-2
              text-sm sm:text-base
              ${
                location.pathname === '/operators'
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }
            `}
          >
            <Network size={14} />
            <span className="hidden sm:inline">Operators</span>
          </button>
        )}
      </div>

      {/* RIGHT - USER INFO & LOGOUT */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="
              flex items-center gap-2
              px-3 sm:px-4
              py-2
              rounded-xl
              border-2
              border-gray-200
              bg-gray-50
              text-gray-700
              hover:bg-gray-100
              hover:border-gray-300
              transition-all
              cursor-pointer
              shadow-sm
              hover:shadow-md
            "
          >
            <User size={16} />
            <span className="font-medium text-sm hidden sm:inline">
              {userInfo?.full_name || userInfo?.displayName || 'Guest'}
            </span>
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-200 ${
                isUserMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="
              absolute right-0 top-full mt-1
              border-2
              border-gray-200
              bg-white
              border border-gray-200
              rounded-lg
              shadow-lg
              z-50
              min-w-[118px]
              overflow-hidden
            ">
              <button
                onClick={handleLogout}
                className="
                  w-full
                  px-3 sm:px-4
                  py-2
                  text-left
                  hover:bg-red-50
                  text-red-600
                  hover:text-red-700
                  transition-colors
                  flex items-center gap-3
                  cursor-pointer
                  border-0
                "
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}