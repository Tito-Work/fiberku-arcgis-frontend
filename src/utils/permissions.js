// Permission constants for the application
// These should match the permissions defined in the FastAPI backend

export const PERMISSIONS = {
  // User management permissions
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  
  // Role management permissions
  CREATE_ROLE: 'create_role',
  READ_ROLE: 'read_role',
  UPDATE_ROLE: 'update_role',
  DELETE_ROLE: 'delete_role',
  
  // Customer management permissions
  CREATE_CUSTOMER: 'create_customer',
  READ_CUSTOMER: 'read_customer',
  UPDATE_CUSTOMER: 'update_customer',
  DELETE_CUSTOMER: 'delete_customer',
  
  // Package management permissions
  CREATE_PACKAGE: 'create_package',
  READ_PACKAGE: 'read_package',
  UPDATE_PACKAGE: 'update_package',
  DELETE_PACKAGE: 'delete_package',
  
  // Coverage management permissions
  CREATE_COVERAGE: 'create_coverage',
  READ_COVERAGE: 'read_coverage',
  UPDATE_COVERAGE: 'update_coverage',
  DELETE_COVERAGE: 'delete_coverage',
  
  // Segment management permissions
  CREATE_SEGMENT: 'create_segment',
  READ_SEGMENT: 'read_segment',
  UPDATE_SEGMENT: 'update_segment',
  DELETE_SEGMENT: 'delete_segment',
  
  // Operator management permissions
  CREATE_OPERATOR: 'create_operator',
  READ_OPERATOR: 'read_operator',
  UPDATE_OPERATOR: 'update_operator',
  DELETE_OPERATOR: 'delete_operator',
  
  // Fiber optic management permissions
  CREATE_FIBER_OPTIC: 'create_fiber_optic',
  READ_FIBER_OPTIC: 'read_fiber_optic',
  UPDATE_FIBER_OPTIC: 'update_fiber_optic',
  DELETE_FIBER_OPTIC: 'delete_fiber_optic',
  
  // System admin permissions
  SYSTEM_ADMIN: 'system_admin'
};

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER
  ],
  
  ROLE_MANAGEMENT: [
    PERMISSIONS.CREATE_ROLE,
    PERMISSIONS.READ_ROLE,
    PERMISSIONS.UPDATE_ROLE,
    PERMISSIONS.DELETE_ROLE
  ],
  
  CUSTOMER_MANAGEMENT: [
    PERMISSIONS.CREATE_CUSTOMER,
    PERMISSIONS.READ_CUSTOMER,
    PERMISSIONS.UPDATE_CUSTOMER,
    PERMISSIONS.DELETE_CUSTOMER
  ],
  
  PACKAGE_MANAGEMENT: [
    PERMISSIONS.CREATE_PACKAGE,
    PERMISSIONS.READ_PACKAGE,
    PERMISSIONS.UPDATE_PACKAGE,
    PERMISSIONS.DELETE_PACKAGE
  ],
  
  COVERAGE_MANAGEMENT: [
    PERMISSIONS.CREATE_COVERAGE,
    PERMISSIONS.READ_COVERAGE,
    PERMISSIONS.UPDATE_COVERAGE,
    PERMISSIONS.DELETE_COVERAGE
  ],
  
  SEGMENT_MANAGEMENT: [
    PERMISSIONS.CREATE_SEGMENT,
    PERMISSIONS.READ_SEGMENT,
    PERMISSIONS.UPDATE_SEGMENT,
    PERMISSIONS.DELETE_SEGMENT
  ],
  
  OPERATOR_MANAGEMENT: [
    PERMISSIONS.CREATE_OPERATOR,
    PERMISSIONS.READ_OPERATOR,
    PERMISSIONS.UPDATE_OPERATOR,
    PERMISSIONS.DELETE_OPERATOR
  ],
  
  FIBER_OPTIC_MANAGEMENT: [
    PERMISSIONS.CREATE_FIBER_OPTIC,
    PERMISSIONS.READ_FIBER_OPTIC,
    PERMISSIONS.UPDATE_FIBER_OPTIC,
    PERMISSIONS.DELETE_FIBER_OPTIC
  ],
  
  SYSTEM_ACCESS: [
    PERMISSIONS.SYSTEM_ADMIN
  ]
};

// Role constants (these should match roles in the backend)
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  VIEWER: 'viewer'
};

// Default permissions for each role (this matches the backend seed_admin.py assignments)
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Admin gets all permissions (matches backend)
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.OPERATOR]: [
    // Operator gets create, read, update permissions for operational data
    // (matches backend: customers, packages, coverages, segments, operators, fiber_optics)
    PERMISSIONS.CREATE_CUSTOMER,
    PERMISSIONS.READ_CUSTOMER,
    PERMISSIONS.UPDATE_CUSTOMER,
    PERMISSIONS.CREATE_PACKAGE,
    PERMISSIONS.READ_PACKAGE,
    PERMISSIONS.UPDATE_PACKAGE,
    PERMISSIONS.CREATE_COVERAGE,
    PERMISSIONS.READ_COVERAGE,
    PERMISSIONS.UPDATE_COVERAGE,
    PERMISSIONS.CREATE_SEGMENT,
    PERMISSIONS.READ_SEGMENT,
    PERMISSIONS.UPDATE_SEGMENT,
    PERMISSIONS.CREATE_OPERATOR,
    PERMISSIONS.READ_OPERATOR,
    PERMISSIONS.UPDATE_OPERATOR,
    PERMISSIONS.CREATE_FIBER_OPTIC,
    PERMISSIONS.READ_FIBER_OPTIC,
    PERMISSIONS.UPDATE_FIBER_OPTIC
  ],
  
  [ROLES.VIEWER]: [
    // Viewer gets only read permissions (matches backend)
    PERMISSIONS.READ_USER,
    PERMISSIONS.READ_ROLE,
    PERMISSIONS.READ_CUSTOMER,
    PERMISSIONS.READ_PACKAGE,
    PERMISSIONS.READ_COVERAGE,
    PERMISSIONS.READ_SEGMENT,
    PERMISSIONS.READ_OPERATOR,
    PERMISSIONS.READ_FIBER_OPTIC
  ],
  
  [ROLES.SUPER_ADMIN]: [
    // Super Admin gets all permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.MANAGER]: [
    // Manager role (not in backend seed, but included for completeness)
    ...PERMISSION_GROUPS.CUSTOMER_MANAGEMENT,
    ...PERMISSION_GROUPS.PACKAGE_MANAGEMENT,
    ...PERMISSION_GROUPS.COVERAGE_MANAGEMENT,
    ...PERMISSION_GROUPS.SEGMENT_MANAGEMENT,
    ...PERMISSION_GROUPS.OPERATOR_MANAGEMENT,
    ...PERMISSION_GROUPS.FIBER_OPTIC_MANAGEMENT
  ]
};

// Helper functions
export const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

export const hasPermissionInGroup = (permissions, group) => {
  return PERMISSION_GROUPS[group]?.some(permission => permissions.includes(permission)) || false;
};

export const getAllPermissionNames = () => Object.values(PERMISSIONS);

export const getAllRoleNames = () => Object.values(ROLES);
