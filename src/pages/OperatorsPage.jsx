import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, X, Shield, Key, Check, X as XIcon } from "lucide-react";
import { operatorService } from "../services/operatorService";
import Swal from "sweetalert2";
import Navbar from "../components/layout/Navbar";

export default function OperatorsPage() {
  const [operators, setOperators] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    code: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadOperators = async () => {
    try {
      const data = await operatorService.getOperators();
      setOperators(data);
    } catch (err) {
      console.error("Error loading operators:", err);
    }
  };

  useEffect(() => {
    loadOperators();
  }, []);

  const handleCreate = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await operatorService.createOperator(form);

      if (response.status === true || response.id) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message || "Operator created successfully",
        });

        await loadOperators();
        setIsModalOpen(false);
        setForm({ code: "", name: "" });
      } else {
        setMessage(response.message || "Failed to create operator");
      }
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message || "Failed to create operator");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await operatorService.updateOperator(selectedOperator.id, form);

      if (response.status === true || response.id) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message || "Operator updated successfully",
        });

        await loadOperators();
        setIsModalOpen(false);
        setSelectedOperator(null);
        setForm({ code: "", name: "" });
      } else {
        setMessage(response.message || "Failed to update operator");
      }
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message || "Failed to update operator");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (operator) => {
    const confirm = await Swal.fire({
      title: "Delete operator?",
      text: `Are you sure you want to delete "${operator.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await operatorService.deleteOperator(operator.id);

      if (response.status === true) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: response.message || "Operator deleted successfully",
        });

        await loadOperators();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to delete operator",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || err.message || "Failed to delete operator",
      });
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedOperator(null);
    setForm({ code: "", name: "" });
    setIsModalOpen(true);
    setMessage(null);
  };

  const openEditModal = (operator) => {
    setIsEditMode(true);
    setSelectedOperator(operator);
    setForm({ code: operator.code, name: operator.name });
    setIsModalOpen(true);
    setMessage(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOperator(null);
    setForm({ code: "", name: "" });
    setMessage(null);
  };

  const filteredOperators = operators.filter(operator =>
    operator.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operator.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Operators</h1>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer"
            >
              <Plus size={18} className="inline-block mr-1" />
              Add Operator
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search operators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOperators.map((operator) => (
                  <tr key={operator.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {operator.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {operator.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(operator)}
                        className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(operator)}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredOperators.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No operators found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  {isEditMode ? "Edit Operator" : "Add Operator"}
                </h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter operator code"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter operator name"
                  />
                </div>

                {message && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {message}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={isEditMode ? handleUpdate : handleCreate}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? "Saving..." : isEditMode ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
