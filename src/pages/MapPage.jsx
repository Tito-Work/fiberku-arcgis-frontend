import {
  Plus,
  X,
} from "lucide-react";

import { useState, useRef, useEffect } from "react";

import MapViewComponent from "../components/map/MapView";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import MapCustomerForm from "../components/map/MapCustomerForm";
import MapControls from "../components/map/MapControls";
import {createCustomer, updateCustomer, deleteCustomer} from "../services/customerService";
import { packageService } from "../services/packageService";
import { operatorService } from "../services/operatorService";
import { segmentService } from "../services/segmentService";
import Swal from "sweetalert2";

export default function App() {
  const [customers, setCustomers] = useState([]);
  const [visibleCustomers, setVisibleCustomers] = useState([]);
  const fetchCustomersRef = useRef(null);
  const fetchCoveragesRef = useRef(null);
  const selectAreaHandlerRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [mapFormOpen, setMapFormOpen] = useState(false);
  const [mapClickPosition, setMapClickPosition] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [coverageAreas, setCoverageAreas] = useState([]);
  const [segments, setSegments] = useState([]);
  const [operators, setOperators] = useState([]);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [createCustomerMessage, setCreateCustomerMessage] = useState(null);
  const [mode, setMode] = useState("default");
  const [filterOpen, setFilterOpen] = useState(false);
  const [clearMarkerTrigger, setClearMarkerTrigger] = useState(0);
  const [filters, setFilters] = useState({
    coverageId: null,
    package: null,
    operator: null,
  });
  const [visibleCoverages, setVisibleCoverages] = useState([]);

  const handleSelectAreaFromMap = () => {
    selectAreaHandlerRef.current?.();
  };
  
  const [form, setForm] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    subdistrict: "",
    postcode: "",
    address: "",
    package_id: "",
    price: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const packages = await packageService.getPackages();

        if (!Array.isArray(packages)) {
          return;
        }

        const mapped = packages.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          color: pkg.color || "#3b82f6",
        }));

        setPackages(mapped);
      } catch (err) {
        console.error("Package load error:", err);
      }
    };

    const loadOperators = async () => {
      try {
        const operators = await operatorService.getOperators();

        if (!Array.isArray(operators)) {
          return;
        }

        setOperators(operators);
      } catch (err) {
        console.error("Operator load error:", err);
      }
    };

    const loadSegments = async () => {
      try {
        const segments = await segmentService.getSegments();

        if (!Array.isArray(segments)) {
          return;
        }

        setSegments(segments);
      } catch (err) {
        console.error("Segment load error:", err);
      }
    };

    loadPackages();
    loadOperators();
    loadSegments();
  }, []);
  const COLORS = packages.map((p) => p.color);

  const handleAddCustomer = async () => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Save",
    });

    if (!confirm.isConfirmed) return;

    setIsCreatingCustomer(true);
    setCreateCustomerMessage(null);

    try {
      const payload = {
        code: form.code,
        name: form.name,
        email: form.email,
        phone: form.phone,
        province: form.province,
        city: form.city,
        district: form.district,
        subdistrict: form.subdistrict,
        postcode: form.postcode,
        address: form.address,
        package_id: form.package,
        price: Number(form.price),
        location: `POINT(${form.longitude} ${form.latitude})`,
      };

      const response = await createCustomer(payload);

      try {
        if (response?.status === true) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text:
              response.data.message ||
              "Customer created successfully",
            confirmButtonColor: "#2563eb",
          });

          await fetchCustomersRef.current?.();
          await fetchCoveragesRef.current?.();
        } else {
          setCreateCustomerMessage(err?.response?.data?.message || err.message || "Failed");
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text:
            err.response?.data?.message ||
            err.message ||
            "Something went wrong",
        });
      }

      await fetchCustomersRef.current?.();

      setMapFormOpen(false);
      setIsAddMode(false);

      setForm({
        code: "",
        name: "",
        email: "",
        phone: "",
        province: "",
        city: "",
        district: "",
        subdistrict: "",
        postcode: "",
        address: "",
        package: "",
        price: "",
        latitude: "",
        longitude: "",
      });

    } catch (err) {
      console.error(err);
      console.log(err?.response?.data?.message);
      setCreateCustomerMessage(err?.response?.data?.message || err.message || "Failed");
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleUpdateCustomer = async () => {
    const confirm = await Swal.fire({
      title: "Update customer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Update",
    });

    if (!confirm.isConfirmed) return;

    try {
      const payload = {
        code: form.code,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        package_id: form.package,
        price: Number(form.price),
        location: `POINT(${form.longitude} ${form.latitude})`,
      };

      const response = await updateCustomer(
        selectedCustomer.id,
        payload
      );

      if (response.status === true) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message,
        });

        await fetchCustomersRef.current?.();
        await fetchCoveragesRef.current?.();

        setCustomerModalOpen(false);
        setSelectedCustomerId(null);
      } else {
        setCreateCustomerMessage(err?.response?.data?.message || err.message || "Failed");
      }
    } catch (err) {
      setCreateCustomerMessage(err?.response?.data?.message || err.message || "Failed");
    }
  };

  const handleDeleteCustomer = async () => {
    const confirm = await Swal.fire({
      title: "Delete customer?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await deleteCustomer(
        selectedCustomer.id
      );

      if (response.status === true) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: response.message,
        });

        await fetchCustomersRef.current?.();
        await fetchCoveragesRef.current?.();

        setCustomerModalOpen(false);
        setSelectedCustomerId(null);
      } else {
        setCreateCustomerMessage(err?.response?.data?.message || err.message || "Failed");
      }
    } catch (err) {
      setCreateCustomerMessage(err?.response?.data?.message || err.message || "Failed");
    }
  };

  const selectedCoverage = filters.coverageId
    ? coverageAreas.find((area) => String(area.id) === String(filters.coverageId))
    : null;

  const totalCoverage = coverageAreas.reduce(
    (acc, area) => {
      acc.max_customer += Number(area.max_customer || 0);
      acc.current_customer += Number(area.current_customer || 0);
      return acc;
    },
    {
      id: "total",
      name: "All Coverage",
      area: null,
      max_customer: 0,
      current_customer: 0,
      geometry: null,
    }
  );

  // const activeCoverage = selectedCoverage || (coverageAreas.length ? totalCoverage : null);
  const coverageSource = filters.coverageId
    ? coverageAreas.filter(
        (area) => String(area.id) === String(filters.coverageId)
      )
    : visibleCoverages;

  const activeCoverage = coverageSource.reduce(
    (acc, area) => {
      acc.max_customer += Number(area.max_customer || 0);
      acc.current_customer += Number(area.current_customer || 0);
      return acc;
    },
    {
      max_customer: 0,
      current_customer: 0,
    }
  );

  const packageChartData = packages.map((pkg) => ({
    name: pkg.name,
    value: visibleCustomers.filter(
      (c) => c.package === pkg.name
    ).length,
  }));

  const revenueChartData = packages.map((pkg) => ({
    package: pkg.name,
    revenue: visibleCustomers
      .filter((c) => c.package === pkg.name)
      .reduce((a, b) => a + b.price, 0),
  }));

  const packageStats = packages.map((pkg) => ({
    ...pkg,
    count: visibleCustomers.filter(
      (c) => c.package_id === pkg.id
    ).length,
  }));

  const revenueStats = packages.map((pkg) => ({
    name: pkg.name,
    revenue: visibleCustomers
      .filter((c) => c.package_id === pkg.id)
      .reduce((a, b) => a + b.price, 0),
  }));

  const totalRevenue = visibleCustomers.reduce(
    (a, b) => a + b.price,
    0
  );

  const utilization = activeCoverage
    ? (visibleCustomers.length /
        activeCoverage.max_customer) *
      100
    : 0;

  const remaining = activeCoverage
    ? activeCoverage.max_customer -
      visibleCustomers.length
    : 0;
  
  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          packages={packages}
          visibleCustomers={visibleCustomers}
          packageStats={packageStats}
          revenueStats={revenueStats}
          totalRevenue={totalRevenue}
          utilization={utilization}
          remaining={remaining}
          visibleCount={visibleCustomers.length}
          packageChartData={packageChartData}
          revenueChartData={revenueChartData}
          COLORS={COLORS}
          operators={operators}
        />

        <div className="flex-1 relative min-w-0">
          <MapControls
            isAddMode={isAddMode}
            setIsAddMode={setIsAddMode}
            setMapFormOpen={setMapFormOpen}

            isSelecting={isSelecting}
            hasSelection={hasSelection}
            onSelectArea={handleSelectAreaFromMap}
            
            mode={mode}
            setMode={setMode}
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            segments={segments}
            operators={operators}
          />

          {(mapFormOpen || customerModalOpen) && (
            <MapCustomerForm
              position={
                mapClickPosition || {
                  x: window.innerWidth / 2 - 250,
                  y: 120,
                }
              }
              form={form}
              setForm={setForm}
              onSave={handleAddCustomer}
              onUpdate={handleUpdateCustomer}
              onDelete={handleDeleteCustomer}
              isLoading={isCreatingCustomer}
              message={createCustomerMessage}
              mode={
                customerModalOpen
                  ? "edit"
                  : "create"
              }
              onClose={() => {
                setIsEditMode(false);
                setMapFormOpen(false);
                setCustomerModalOpen(false);
                setIsAddMode(false);
                setSelectedCustomerId(null);
              }}
              isEditMode={isEditMode}
            />
          )}

          <MapViewComponent
            customers={customers}
            setCustomers={setCustomers}
            isAddMode={isAddMode}
            clearAddMarker={!isAddMode}
            clearAddMarkerTrigger={clearMarkerTrigger}
            hasSelection={hasSelection}
            setHasSelection={setHasSelection}
            isSelecting={isSelecting}
            setIsSelecting={setIsSelecting}
            setVisibleCustomers={setVisibleCustomers}
            setSelectedCustomer={setSelectedCustomer}
            selectedCustomerId={selectedCustomerId}
            setSelectedCustomerId={setSelectedCustomerId}
            setCustomerModalOpen={setCustomerModalOpen}
            setCoverageAreas={setCoverageAreas}
            setIsEditMode={setIsEditMode}
            mode={mode}
            setMode={setMode}
            filters={filters}
            onMapClick={(coords) => {
              setSelectedCustomer(null);
              setCustomerModalOpen(false);

              setMapFormOpen(true);

              setMapClickPosition({
                x: coords.screenX,
                y: coords.screenY,
              });

              setForm({
                code: "",
                name: "",
                email: "",
                phone: "",
                province: "",
                city: "",
                district: "",
                subdistrict: "",
                postcode: "",
                address: "",
                package: "",
                price: "",
                latitude: coords.latitude,
                longitude: coords.longitude,
              });
            }}
            setForm={setForm}
            onDelete={() => {
              console.log("DELETE CUSTOMER");
            }}
            onReadyFetchCustomers={(fn) => {
              fetchCustomersRef.current = fn;
            }}
            onReadyFetchCoverages={(fn) => {
              fetchCoveragesRef.current = fn;
            }}
            onRegisterSelectArea={(fn) => {
              selectAreaHandlerRef.current = fn;
            }}
            segments={segments}
            operators={operators}
            setVisibleCoverages={setVisibleCoverages}
          />

          {filterOpen && (
            <div className="absolute top-32 right-4 sm:right-14 z-[999] w-64 sm:w-72 bg-white shadow-xl rounded-sm p-4">

              {/* header */}
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-sm">Filters</span>

                <button onClick={() => setFilterOpen(false)} className="cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              {/* Coverage */}
              <select
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    coverageId: e.target.value || null,
                  }))
                }
                className="w-full border p-2 rounded text-sm mb-2"
              >
                <option value="">All Coverage</option>
                {coverageAreas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.area}
                  </option>
                ))}
              </select>

              {/* Package */}
              <select
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    package: e.target.value || null,
                  }))
                }
                className="w-full border p-2 rounded text-sm mb-2"
              >
                <option value="">All Package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.name}>
                    {pkg.name}
                  </option>
                ))}
              </select>

              {/* Operator */}
              <select
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    operator: e.target.value || null,
                  }))
                }
                className="w-full border p-2 rounded text-sm"
              >
                <option value="">All Operator</option>
                {operators.map((operator) => (
                  <option key={operator.id} value={operator.name}>
                    {operator.name}
                  </option>
                ))}
              </select>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
