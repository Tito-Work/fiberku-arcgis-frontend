import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, X, Shield, Key, Check, X as XIcon } from "lucide-react";
import { segmentService } from "../services/segmentService";
import Swal from "sweetalert2";
import Navbar from "../components/layout/Navbar";

export default function SegmentsPage() {
  const [segments, setSegments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    code: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadSegments = async () => {
    try {
      const data = await segmentService.getSegments();
      setSegments(data);
    } catch (err) {
      console.error("Error loading segments:", err);
    }
  };

  useEffect(() => {
    loadSegments();
  }, []);

  const handleCreate = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await segmentService.createSegment(form);

      if (response.status === true || response.id) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message || "Segment created successfully",
        });

        await loadSegments();
        setIsModalOpen(false);
        setForm({ code: "", name: "" });
      } else {
        setMessage(response.message || "Failed to create segment");
      }
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message || "Failed to create segment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await segmentService.updateSegment(selectedSegment.id, form);

      if (response.status === true || response.id) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message || "Segment updated successfully",
        });

        await loadSegments();
        setIsModalOpen(false);
        setSelectedSegment(null);
        setForm({ code: "", name: "" });
      } else {
        setMessage(response.message || "Failed to update segment");
      }
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message || "Failed to update segment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (segment) => {
    const confirm = await Swal.fire({
      title: "Delete segment?",
      text: `Are you sure you want to delete "${segment.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await segmentService.deleteSegment(segment.id);

      if (response.status === true) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: response.message || "Segment deleted successfully",
        });

        await loadSegments();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to delete segment",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || err.message || "Failed to delete segment",
      });
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedSegment(null);
    setForm({ code: "", name: "" });
    setIsModalOpen(true);
    setMessage(null);
  };

  const openEditModal = (segment) => {
    setIsEditMode(true);
    setSelectedSegment(segment);
    setForm({ code: segment.code, name: segment.name });
    setIsModalOpen(true);
    setMessage(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSegment(null);
    setForm({ code: "", name: "" });
    setMessage(null);
  };

  const filteredSegments = segments.filter(segment =>
    segment.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Segments</h1>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer"
            >
              <Plus size={18} className="inline-block mr-1" />
              Add Segment
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search segments..."
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
                {filteredSegments.map((segment) => (
                  <tr key={segment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {segment.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {segment.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(segment)}
                        className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(segment)}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSegments.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No segments found
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
                  {isEditMode ? "Edit Segment" : "Add Segment"}
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
                    placeholder="Enter segment code"
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
                    placeholder="Enter segment name"
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
