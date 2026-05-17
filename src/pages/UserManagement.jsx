import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, X, UserPen, UserMinus, UserPlus } from "lucide-react";
import { userService } from "../services/userService";
import { roleService } from "../services/roleService";
import Swal from "sweetalert2";
import Navbar from "../components/layout/Navbar";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    role: "viewer"
  });

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await roleService.getRoles();
      setRoles(response.data || response);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.data || response);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch users"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Only include fields that are actually set
        const updateData = {};
        if (formData.username) updateData.username = formData.username;
        if (formData.email) updateData.email = formData.email;
        if (formData.password) updateData.password = formData.password;
        if (formData.full_name) updateData.full_name = formData.full_name;
        if (formData.role) updateData.role_id = formData.role;
        
        await userService.updateUser(editingUser.id, updateData);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User updated successfully"
        });
      } else {
        // Send role_id instead of role for create user
        const createData = {
          ...formData,
          role_id: formData.role
        };
        delete createData.role;
        
        await userService.createUser(createData);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User created successfully"
        });
      }
      
      resetForm();
      fetchUsers();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Operation failed"
      });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      full_name: user.full_name,
      role: user.roles && user.roles.length > 0 ? user.roles[0].id : "viewer"
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: `Are you sure you want to delete ${user.username}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await userService.deleteUser(user.id);
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "User deleted successfully"
        });
        fetchUsers();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete user"
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      full_name: "",
      role: "viewer"
    });
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleToggleUserStatus = async (user) => {
    const result = await Swal.fire({
      title: `${user.is_active ? 'Deactivate' : 'Activate'} User?`,
      text: `Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.username}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: user.is_active ? "Deactivate" : "Activate",
      cancelButtonText: "Cancel",
      confirmButtonColor: user.is_active ? "#f59e0b" : "#10b981"
    });

    if (result.isConfirmed) {
      try {
        const updatedUser = await userService.updateUser(user.id, {
          is_active: !user.is_active
        });
        
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === user.id ? { ...u, is_active: !u.is_active } : u
          )
        );
        
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `User ${user.is_active ? 'deactivated' : 'activated'} successfully`
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update user status"
        });
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading users...</div>
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
            <h1 className="text-xl sm:text-2xl font-bold">User Management</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all cursor-pointer w-full sm:w-auto justify-center"
            >
              <UserPlus size={18} />
              Add User
            </button>
          </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.full_name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.roles && user.roles.length > 0 && user.roles[0].name === 'admin' 
                          ? 'bg-red-100 text-red-800'
                          : user.roles && user.roles.length > 0 && user.roles[0].name === 'operator'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.roles && user.roles.length > 0 ? user.roles[0].name : 'No Role'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1 cursor-pointer"
                          title="Edit User"
                        >
                          <UserPen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1 cursor-pointer"
                          title="Delete User"
                        >
                          <UserMinus size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                            user.is_active 
                              ? "bg-blue-600" 
                              : "bg-gray-300"
                          }`}
                          title={user.is_active ? "Deactivate User" : "Activate User"}
                        >
                          <span
                            className={`${
                              user.is_active 
                                ? "translate-x-6" 
                                : "translate-x-1"
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold">
                  {editingUser ? "Edit User" : "Add User"}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {roles.map((role) => (
                        <option key={role.id || role.name} value={role.id || role.name}>
                          {role.name || role.label}
                        </option>
                      ))}
                    </select>
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
                    {editingUser ? "Update" : "Create"}
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
