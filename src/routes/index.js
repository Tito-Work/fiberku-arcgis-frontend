// Export all route guards for easy importing
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as RoleGuard } from './RoleGuard';
export { default as PermissionGuard } from './PermissionGuard';
export { 
  default as AccessGuard, 
  SimpleAccessGuard, 
  AdminGuard, 
  ManagerGuard 
} from './AccessGuard';

// Re-export commonly used combinations
export { ProtectedRoute as AuthenticatedRoute } from './ProtectedRoute';
