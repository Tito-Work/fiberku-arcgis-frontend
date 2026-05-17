import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "../../utils/permissions";
import { packageService } from "../../services/packageService";

export default function MapCustomerForm({
  position,
  form,
  setForm,
  onClose,
  isLoading,
  message,
  mode = "create",
  onSave,
  onUpdate,
  onDelete,
  isEditMode,
}) {
  const popupWidth = window.innerWidth < 640 ? window.innerWidth - 32 : 520;

  const { hasPermission } = usePermissions();
  const canCreateCustomer = hasPermission(PERMISSIONS.CREATE_CUSTOMER);
  const canUpdateCustomer = hasPermission(PERMISSIONS.UPDATE_CUSTOMER);
  const canDeleteCustomer = hasPermission(PERMISSIONS.DELETE_CUSTOMER);
  
  const [packages, setPackages] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const packagesData = await packageService.getPackages();
        
        if (Array.isArray(packagesData)) {
          setPackages(packagesData);
        }
      } catch (err) {
        console.error("Error loading packages:", err);
      }
    };

    loadPackages();
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!form.name?.trim()) {
      errors.name = "Customer name is required";
    }

    if (!form.code?.trim()) {
      errors.code = "Customer code is required";
    }

    if (!form.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!form.phone?.trim()) {
      errors.phone = "Phone number is required";
    }

    if (!form.package) {
      errors.package = "Please select a package";
    }

    if (!form.price || form.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    if (!form.address?.trim()) {
      errors.address = "Address is required";
    }

    if (!form.latitude || !form.longitude) {
      errors.location = "Please select a location on the map";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave();
    }
  };

  const handleUpdate = () => {
    if (validateForm()) {
      onUpdate();
    }
  };

  const safeLeft =
    position.x > window.innerWidth - popupWidth
      ? position.x - popupWidth
      : position.x;

  const [pos, setPos] = useState({
    x: safeLeft,
    y: position.y,
  });

  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    dragging.current = true;

    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;

    setPos({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const handleMouseUp = () => {
    dragging.current = false;

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e) => {
    dragging.current = true;
    const touch = e.touches[0];

    offset.current = {
      x: touch.clientX - pos.x,
      y: touch.clientY - pos.y,
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  const handleTouchMove = (e) => {
    if (!dragging.current) return;
    e.preventDefault();
    const touch = e.touches[0];

    setPos({
      x: touch.clientX - offset.current.x,
      y: touch.clientY - offset.current.y,
    });
  };

  const handleTouchEnd = () => {
    dragging.current = false;

    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
  };

  return (
    <div
      className="
        absolute
        z-[1]
        bg-white
        rounded-xl
        shadow-2xl
        border
        w-[calc(100vw-2rem)] sm:w-[520px]
      "
      style={{
        left: pos.x,
        top: pos.y,
      }}
    >
      {/* HEADER (DRAG HANDLE) */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="
          cursor-move
          flex items-center justify-between
          px-2 sm:px-2 py-2
          border-b
          bg-green-600
          text-white
          rounded-t-xl
        "
      >
        <h3 className="font-semibold text-base sm:text-lg">
          {mode === "edit" ? "Customer Detail" : "Add Customer"}
        </h3>

        <button
          onClick={onClose}
          className="
            w-8 h-8 rounded-lg
            bg-green-600 hover:bg-green-700
            text-white
            flex items-center justify-center
            cursor-pointer
            border border-gray-800
          "
        >
          <X size={16} />
        </button>
      </div>

      {message && (
        <div
          className={`mb-3 text-sm px-3 py-2 rounded-xl mx-4 ${
            message.includes("success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      {/* FORM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">

        <div>
          <input
            type="text"
            placeholder="Customer Code *"
            value={form.code || ""}
            onChange={(e) => {
              setForm({ ...form, code: e.target.value });
              if (validationErrors.code) {
                setValidationErrors({ ...validationErrors, code: "" });
              }
            }}
            className={`w-full rounded-lg border px-2 sm:px-2 py-2 text-sm ${
              validationErrors.code ? "border-red-500" : ""
            }`}
            disabled={canCreateCustomer && canUpdateCustomer ? false : true}
          />
          {validationErrors.code && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.code}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Customer Name *"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (validationErrors.name) {
                setValidationErrors({ ...validationErrors, name: "" });
              }
            }}
            className={`w-full rounded-lg border px-2 sm:px-2 py-2 text-sm ${
              validationErrors.name ? "border-red-500" : ""
            }`}
            disabled={canCreateCustomer && canUpdateCustomer ? false : true}
          />
          {validationErrors.name && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email *"
            value={form.email || ""}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              if (validationErrors.email) {
                setValidationErrors({ ...validationErrors, email: "" });
              }
            }}
            className={`w-full rounded-lg border px-2 sm:px-2 py-2 text-sm ${
              validationErrors.email ? "border-red-500" : ""
            }`}
            disabled={canCreateCustomer && canUpdateCustomer ? false : true}
          />
          {validationErrors.email && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Phone *"
            value={form.phone || ""}
            onChange={(e) => {
              setForm({ ...form, phone: e.target.value });
              if (validationErrors.phone) {
                setValidationErrors({ ...validationErrors, phone: "" });
              }
            }}
            className={`w-full rounded-lg border px-2 sm:px-2 py-2 text-sm ${
              validationErrors.phone ? "border-red-500" : ""
            }`}
            disabled={canCreateCustomer && canUpdateCustomer ? false : true}
          />
          {validationErrors.phone && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
          )}
        </div>

        <div>
          <select
            value={form.package}
            onChange={(e) => {
              setForm({ ...form, package: e.target.value });
              if (validationErrors.package) {
                setValidationErrors({ ...validationErrors, package: "" });
              }
            }}
            className={`w-full rounded-xl border px-2 sm:px-2 py-2 bg-white text-sm ${
              validationErrors.package ? "border-red-500" : ""
            }`}
            disabled={canCreateCustomer && canUpdateCustomer ? false : true}
          >
            <option value="">Select Package *</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))}
          </select>
          {validationErrors.package && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.package}</p>
          )}
        </div>

        <div>
          <input
            type="number"
            placeholder="Price *"
            value={form.price}
            onChange={(e) => {
              setForm({ ...form, price: e.target.value });
              if (validationErrors.price) {
                setValidationErrors({ ...validationErrors, price: "" });
              }
            }}
            className={`w-full rounded-lg border px-2 sm:px-2 py-2 text-sm ${
              validationErrors.price ? "border-red-500" : ""
            }`}
            disabled={canCreateCustomer && canUpdateCustomer ? false : true}
          />
          {validationErrors.price && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.price}</p>
          )}
        </div>

        <div className="col-span-1 sm:col-span-2">
          <input
            type="text"
            placeholder="Address *"
            value={form.address || ""}
            onChange={(e) => {
              setForm({ ...form, address: e.target.value });
              if (validationErrors.address) {
                setValidationErrors({ ...validationErrors, address: "" });
              }
            }}
            className={`col-span-1 sm:col-span-2 w-full rounded-xl border px-2 sm:px-2 py-2 text-sm ${
              validationErrors.address ? "border-red-500" : ""
            }`}
            disabled={canCreateCustomer && canUpdateCustomer ? false : true}
          />
          {validationErrors.address && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Latitude *"
            value={form.latitude}
            readOnly
            className={`w-full rounded-xl border px-2 sm:px-2 py-2 bg-gray-100 text-sm ${
              validationErrors.location ? "border-red-500" : ""
            }`}
            disabled={canCreateCustomer && canUpdateCustomer ? false : true}
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Longitude *"
            value={form.longitude}
            readOnly
            className={`w-full rounded-xl border px-2 sm:px-2 py-2 bg-gray-100 text-sm ${
              validationErrors.location ? "border-red-500" : ""
            }`}
            disabled={canCreateCustomer && canUpdateCustomer ? false : true}
          />
        </div>
        {validationErrors.location && (
          <p className="col-span-1 sm:col-span-2 text-red-500 text-xs mt-1">{validationErrors.location}</p>
        )}
        {canCreateCustomer && canUpdateCustomer && (
          <button
            onClick={isEditMode ? handleUpdate : handleSave}
            disabled={isLoading}
            className={`
              col-span-1 sm:col-span-2
              w-full py-2 px-2 rounded-xl font-semibold cursor-pointer
              transition-all text-sm
              ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            `}
          >
            {isLoading ? "Saving..." : mode === "edit" ? "Update Customer" : "Save Customer"}
          </button>
        )}
        
        {canDeleteCustomer && (
          isEditMode && (
            <button
              onClick={onDelete}
              className="
                col-span-1 sm:col-span-2
                py-2 px-2 rounded-xl font-semibold cursor-pointer
                bg-red-500 hover:bg-red-600 text-white
                text-sm
              "
            >
              Delete
            </button>
          )
        )}  
      </div>
    </div>
  );
}