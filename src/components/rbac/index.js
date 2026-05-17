// Export all RBAC components for easy importing
export {
  ProtectedComponent,
  ProtectedByAnyPermission,
  ProtectedByAllPermissions,
  ProtectedByRole,
  ProtectedByAccess,
  withProtection,
  withPermissionProtection,
  withRoleProtection
} from './ProtectedComponent';

export {
  RoleBasedUI,
  PermissionBasedUI,
  PermissionGroupUI,
  RoleHierarchyUI,
  ConditionalUI,
  NavigationItem,
  MenuItem,
  AdminOnly,
  ManagerOnly,
  OperatorOnly,
  ViewerPlus
} from './RoleBasedUI';

// Re-export ProtectedComponent as default
export { default } from './ProtectedComponent';
