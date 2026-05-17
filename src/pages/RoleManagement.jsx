import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, X, Shield, Key, Check, X as XIcon } from "lucide-react";
import { roleService } from "../services/roleService";
import Swal from "sweetalert2";
import Navbar from "../components/layout/Navbar";

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [activeTab, setActiveTab] = useState("roles"); // "roles" or "permissions"

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [permissionFormData, setPermissionFormData] = useState({
    name: "",
    description: "",
    resource: "",
    action: "",
  });

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [permissionSearchTerm, setPermissionSearchTerm] = useState("");

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleService.getRoles();
      setRoles(response.data || response);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch roles"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await roleService.getPermissions();
      setPermissions(response.data || response);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingRole) {
        // Update role
        await roleService.updateRole(editingRole.id, formData);
        
        // Update role permissions
        const currentRolePerms = rolePermissions.map(perm => perm.id);
        
        // Remove permissions that are no longer selected
        for (const permId of currentRolePerms) {
          if (!selectedPermissions.includes(permId)) {
            await roleService.removePermissionFromRole(editingRole.id, permId);
          }
        }
        
        // Add new permissions
        for (const permId of selectedPermissions) {
          if (!currentRolePerms.includes(permId)) {
            await roleService.assignPermissionToRole(editingRole.id, permId);
          }
        }
        
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Role updated successfully"
        });
      } else {
        // Create role
        const roleResponse = await roleService.createRole(formData);
        const newRole = roleResponse.data || roleResponse;
        
        // Assign permissions to new role
        for (const permId of selectedPermissions) {
          await roleService.assignPermissionToRole(newRole.id, permId);
        }
        
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Role created successfully"
        });
      }
      
      resetForm();
      fetchRoles();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save role"
      });
    }
  };

  const handlePermissionSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingRole) {
        await roleService.updatePermission(editingRole.id, permissionFormData);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Permission updated successfully"
        });
      } else {
        await roleService.createPermission(permissionFormData);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Permission created successfully"
        });
      }
      
      resetPermissionForm();
      fetchPermissions();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save permission"
      });
    }
  };

  const handleEdit = async (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
    });
    
    // Use role permissions from the role data
    const rolePerms = role.permissions || [];
    setRolePermissions(rolePerms);
    setSelectedPermissions(rolePerms.map(perm => perm.id));
    
    setIsModalOpen(true);
  };

  const handleEditPermission = (permission) => {
    setEditingRole(permission);
    setPermissionFormData({
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
    });
    setIsPermissionModalOpen(true);
  };

  const handleDelete = async (role) => {
    const result = await Swal.fire({
      title: "Delete Role?",
      text: `Are you sure you want to delete ${role.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await roleService.deleteRole(role.id);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Role deleted successfully"
        });
        fetchRoles();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete role"
        });
      }
    }
  };

  const handleDeletePermission = async (permission) => {
    const result = await Swal.fire({
      title: "Delete Permission?",
      text: `Are you sure you want to delete ${permission.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await roleService.deletePermission(permission.id);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Permission deleted successfully"
        });
        fetchPermissions();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete permission"
        });
      }
    }
  };

  const handleManagePermissions = (role) => {
    setSelectedRole(role);
    setIsPermissionModalOpen(true);
  };

  const handlePermissionCheckboxChange = (permissionId, isChecked) => {
    if (isChecked) {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permissionId));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
    setSelectedPermissions([]);
    setRolePermissions([]);
    setPermissionSearchTerm("");
    setEditingRole(null);
    setIsModalOpen(false);
  };

  const resetPermissionForm = () => {
    setPermissionFormData({
      name: "",
      description: "",
      resource: "",
      action: "",
    });
    setEditingRole(null);
    setIsPermissionModalOpen(false);
    setSelectedRole(null);
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.resource?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading roles...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold">RBAC & Role Management</h1>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setActiveTab("roles");
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
              >
                <Shield size={18} />
                Add Role
              </button>
              <button
                onClick={() => {
                  setActiveTab("permissions");
                  setIsPermissionModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all cursor-pointer"
              >
                <Key size={18} />
                Add Permission
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab("roles")}
              className={`px-4 py-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "roles"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Roles
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={`px-4 py-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "permissions"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Permissions
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Content */}
          {activeTab === "roles" ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRoles.map((role) => (
                      <tr key={role.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {role.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {role.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex flex-wrap gap-1">
                            {role.permissions && role.permissions.length > 0 ? (
                              role.permissions.map((perm) => (
                                <span
                                  key={perm.id}
                                  className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                                >
                                  {perm.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">No permissions</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(role)}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1 cursor-pointer"
                              title="Edit Role"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(role)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1 cursor-pointer"
                              title="Delete Role"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permission Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPermissions.map((permission) => (
                      <tr key={permission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {permission.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {permission.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            {permission.resource}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                            {permission.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditPermission(permission)}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1 cursor-pointer"
                              title="Edit Permission"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeletePermission(permission)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1 cursor-pointer"
                              title="Delete Permission"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Role Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold">
                    {editingRole ? "Edit Role" : "Add Role"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    
                    {/* Permissions Assignment Table */}
                    <div className="mt-6">
                      {/* Header and Search Inline */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <h3 className="text-base sm:text-lg font-semibold">Assign Permissions</h3>
                        <div className="relative max-w-md w-full">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            placeholder="Search permissions..."
                            value={permissionSearchTerm}
                            onChange={(e) => setPermissionSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="border rounded-lg overflow-hidden">
                        <div className="max-h-64 overflow-y-auto">
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[500px]">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Assign
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Permission Name
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Resource
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {permissions
                                  .filter(permission =>
                                    permission.name.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                                    permission.description?.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                                    permission.resource?.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                                    permission.action?.toLowerCase().includes(permissionSearchTerm.toLowerCase())
                                  )
                                  .map((permission) => (
                                  <tr key={permission.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 whitespace-nowrap">
                                      <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes(permission.id)}
                                        onChange={(e) => handlePermissionCheckboxChange(permission.id, e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                      />
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {permission.name}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                        {permission.resource}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                      <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                                        {permission.action}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      {permission.description || "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      {permissions.filter(permission =>
                        permission.name.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                        permission.description?.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                        permission.resource?.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                        permission.action?.toLowerCase().includes(permissionSearchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          {permissionSearchTerm ? "No permissions found matching your search." : "No permissions available. Create permissions first."}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm"
                    >
                      {editingRole ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Permission Modal */}
          {isPermissionModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold">
                    {editingRole ? "Edit Permission" : "Add Permission"}
                  </h2>
                  <button
                    onClick={resetPermissionForm}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handlePermissionSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Permission Name
                      </label>
                      <input
                        type="text"
                        required
                        value={permissionFormData.name}
                        onChange={(e) => setPermissionFormData({ ...permissionFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={permissionFormData.description}
                        onChange={(e) => setPermissionFormData({ ...permissionFormData, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resource
                      </label>
                      <input
                        type="text"
                        required
                        value={permissionFormData.resource}
                        onChange={(e) => setPermissionFormData({ ...permissionFormData, resource: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="e.g., users, roles, maps"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Action
                      </label>
                      <select
                        value={permissionFormData.action}
                        onChange={(e) => setPermissionFormData({ ...permissionFormData, action: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                      >
                        <option value="">Select action</option>
                        <option value="create">Create</option>
                        <option value="read">Read</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                        <option value="manage">Manage</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={resetPermissionForm}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-sm"
                    >
                      {editingRole ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
