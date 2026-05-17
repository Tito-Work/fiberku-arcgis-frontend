import React from 'react';
import { 
  ProtectedComponent, 
  ProtectedByRole, 
  ProtectedByAnyPermission,
  AdminOnly,
  ManagerOnly,
  OperatorOnly 
} from './ProtectedComponent';
import { 
  RoleBasedUI, 
  PermissionBasedUI, 
  NavigationItem 
} from './RoleBasedUI';
import { usePermissions } from '../../hooks/usePermissions';
import { useHasPermission } from '../../hooks/useHasPermission';
import { useCanAccess } from '../../hooks/useCanAccess';
import { PERMISSIONS, ROLES } from '../../utils/permissions';

/**
 * Example component demonstrating RBAC usage patterns
 */
export default function RBACExample() {
  const { 
    permissions, 
    roles, 
    hasPermission, 
    hasAnyPermission,
    analysis 
  } = usePermissions();
  
  const canCreateCustomer = useHasPermission(PERMISSIONS.CUSTOMER_CREATE);
  const canManageUsers = useHasPermission(PERMISSIONS.USER_CREATE);
  const { canAccess: canAccessAdmin } = useCanAccess([PERMISSIONS.SYSTEM_ADMIN], [ROLES.ADMIN]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>RBAC System Examples</h2>
      
      {/* User Information Display */}
      <div style={{ 
        marginBottom: '30px', 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px' 
      }}>
        <h3>Current User Information</h3>
        <p><strong>Roles:</strong> {roles.join(', ') || 'None'}</p>
        <p><strong>Permissions:</strong> {permissions.length} total permissions</p>
        <p><strong>Can Create Customer:</strong> {canCreateCustomer ? 'Yes' : 'No'}</p>
        <p><strong>Can Manage Users:</strong> {canManageUsers ? 'Yes' : 'No'}</p>
        <p><strong>Admin Access:</strong> {canAccessAdmin ? 'Yes' : 'No'}</p>
      </div>

      {/* Permission Analysis */}
      <div style={{ 
        marginBottom: '30px', 
        padding: '15px', 
        backgroundColor: '#e8f5e8', 
        borderRadius: '8px' 
      }}>
        <h3>Permission Analysis</h3>
        <p><strong>Total Permissions:</strong> {analysis.totalPermissions}</p>
        <p><strong>Direct Permissions:</strong> {analysis.directPermissions}</p>
        <p><strong>Derived Permissions:</strong> {analysis.derivedPermissions}</p>
        <p><strong>Role Level:</strong> {analysis.roleLevel}</p>
      </div>

      {/* Component-Level Protection Examples */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Component-Level Protection</h3>
        
        <ProtectedComponent permission={PERMISSIONS.CUSTOMER_CREATE}>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#d4edda', 
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            ✅ This content is visible only to users with CUSTOMER_CREATE permission
          </div>
        </ProtectedComponent>

        <ProtectedByRole roles={[ROLES.ADMIN]}>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            👑 This content is visible only to Admin users
          </div>
        </ProtectedByRole>

        <ProtectedByAnyPermission permissions={[PERMISSIONS.USER_READ, PERMISSIONS.CUSTOMER_READ]}>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#d1ecf1', 
            border: '1px solid #bee5eb',
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            👁️ This content is visible to users who can read users OR customers
          </div>
        </ProtectedByAnyPermission>

        <AdminOnly>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f8d7da', 
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            🚨 Admin-only content
          </div>
        </AdminOnly>

        <ManagerOnly>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#e2e3e5', 
            border: '1px solid #d6d8db',
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            📊 Manager-level content
          </div>
        </ManagerOnly>

        <OperatorOnly>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#cce5ff', 
            border: '1px solid #b3d7ff',
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            🔧 Operator-level content
          </div>
        </OperatorOnly>
      </div>

      {/* Role-Based UI Examples */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Role-Based UI</h3>
        
        <RoleBasedUI
          roleUI={{
            [ROLES.SUPER_ADMIN]: (
              <div style={{ padding: '10px', backgroundColor: '#ff6b6b', color: 'white', borderRadius: '4px' }}>
                🔥 Super Admin Dashboard
              </div>
            ),
            [ROLES.ADMIN]: (
              <div style={{ padding: '10px', backgroundColor: '#4ecdc4', color: 'white', borderRadius: '4px' }}>
                ⚙️ Admin Dashboard
              </div>
            ),
            [ROLES.MANAGER]: (
              <div style={{ padding: '10px', backgroundColor: '#45b7d1', color: 'white', borderRadius: '4px' }}>
                📈 Manager Dashboard
              </div>
            ),
            [ROLES.OPERATOR]: (
              <div style={{ padding: '10px', backgroundColor: '#96ceb4', color: 'white', borderRadius: '4px' }}>
                🔧 Operator Dashboard
              </div>
            ),
            [ROLES.VIEWER]: (
              <div style={{ padding: '10px', backgroundColor: '#ffeaa7', color: 'black', borderRadius: '4px' }}>
                👁️ Viewer Dashboard
              </div>
            )
          }}
          fallback={
            <div style={{ padding: '10px', backgroundColor: '#ddd', borderRadius: '4px' }}>
              No dashboard available
            </div>
          }
        />
      </div>

      {/* Navigation Examples */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Navigation Items with RBAC</h3>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <NavigationItem 
            permissions={[PERMISSIONS.DASHBOARD_VIEW]}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Dashboard
          </NavigationItem>
          
          <NavigationItem 
            permissions={[PERMISSIONS.USER_READ]}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Users
          </NavigationItem>
          
          <NavigationItem 
            permissions={[PERMISSIONS.CUSTOMER_READ]}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#17a2b8', 
              color: 'white', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Customers
          </NavigationItem>
          
          <NavigationItem 
            permissions={[PERMISSIONS.SYSTEM_ADMIN]}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            System Admin
          </NavigationItem>
        </div>
      </div>

      {/* Hook Usage Examples */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Programmatic Permission Checks</h3>
        
        <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <p>Current permission checks:</p>
          <ul>
            <li>Has CUSTOMER_CREATE: {hasPermission(PERMISSIONS.CUSTOMER_CREATE) ? '✅' : '❌'}</li>
            <li>Has USER_CREATE: {hasPermission(PERMISSIONS.USER_CREATE) ? '✅' : '❌'}</li>
            <li>Has ANY customer permission: {hasAnyPermission([
              PERMISSIONS.CUSTOMER_CREATE, 
              PERMISSIONS.CUSTOMER_READ, 
              PERMISSIONS.CUSTOMER_UPDATE, 
              PERMISSIONS.CUSTOMER_DELETE
            ]) ? '✅' : '❌'}</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons with RBAC */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Action Buttons with RBAC</h3>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <ProtectedComponent permission={PERMISSIONS.CUSTOMER_CREATE}>
            <button style={{ 
              padding: '8px 16px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              ➕ Add Customer
            </button>
          </ProtectedComponent>
          
          <ProtectedComponent permission={PERMISSIONS.USER_CREATE}>
            <button style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              👤 Add User
            </button>
          </ProtectedComponent>
          
          <ProtectedComponent permission={PERMISSIONS.MAP_EDIT}>
            <button style={{ 
              padding: '8px 16px', 
              backgroundColor: '#17a2b8', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              🗺️ Edit Map
            </button>
          </ProtectedComponent>
          
          <ProtectedComponent permission={PERMISSIONS.SYSTEM_ADMIN}>
            <button style={{ 
              padding: '8px 16px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              ⚙️ System Settings
            </button>
          </ProtectedComponent>
        </div>
      </div>
    </div>
  );
}
