import { Plus, X, Scan, Radar, Filter, User, Info, UserPlus2, Zap } from "lucide-react";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "../../utils/permissions";

export default function MapControls({
  setMapFormOpen,
  isSelecting,
  hasSelection,
  onSelectArea,
  setMode,
  mode,
  setFilterOpen,
  filterOpen,
  clearAddMarker,
  segments,
  operators,
}) {
  const { hasPermission } = usePermissions();
  const canCreateCustomer = hasPermission(PERMISSIONS.CREATE_CUSTOMER);
  const canCreateCoverage = hasPermission(PERMISSIONS.CREATE_COVERAGE);
  const canCreateFiberOptic = hasPermission(PERMISSIONS.CREATE_FIBER_OPTIC);
  
  const isActive = (m) => mode === m;
  const isLocked = mode !== "default";
  
  return (
    <>
      <div className="group absolute top-46 right-4 z-[1]">
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="bg-white shadow-lg p-2 cursor-pointer hover:bg-gray-100"
        >
          <Filter size={15} className="text-gray-600 hover:text-black" />
        </button>

        <div className="hidden text-xs mt-1 bg-black text-white px-2 py-1 rounded">
          Filters
        </div>
      </div>

      {/* ADD COVERAGE */}
      {canCreateCoverage && (
        <div
          className={`
            absolute right-4 sm:right-5 z-[1] transition-all
            bottom-38
            ${
              isLocked && !isActive("add_coverage")
                ? "opacity-40 pointer-events-none"
                : "opacity-100"
            }
          `}
        >
          <button
            onClick={() => {
              setMode((prev) => {
                if (prev === "add_coverage") {
                  return "default";
                }

                if (prev === "add_customer") {
                  clearAddMarker?.();
                }

                return "add_coverage";
              });
            }}
            className={`
              px-3 py-2 rounded-xl text-white shadow-lg
              flex items-center transition-all cursor-pointer text-xs sm:text-sm
              ${
                mode === "add_coverage"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }
              group overflow-hidden
            `}
          >
            {mode === "add_coverage" ? (
              <>
                <X size={16} />
                <span className={`overflow-hidden whitespace-nowrap transition-[max-width] duration-200 ease-out ${mode === "add_coverage" ? "max-w-[140px] ml-1.5" : "max-w-0 group-hover:max-w-[140px] group-hover:ml-1.5"}`}>
                  Cancel Coverage
                </span>
              </>
            ) : (
              <>
                <Radar size={16} />
                <span className={`overflow-hidden whitespace-nowrap transition-[max-width] duration-200 ease-out ${mode === "add_coverage" ? "max-w-[140px] ml-1.5" : "max-w-0 group-hover:max-w-[140px] group-hover:ml-1.5"}`}>
                  Add Coverage
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ADD FIBER OPTIC */}
      {canCreateFiberOptic && (
        <div
          className={`
            absolute right-4 sm:right-5 z-[1] transition-all
            bottom-27
            ${
              isLocked && !isActive("add_fiber_optic")
                ? "opacity-40 pointer-events-none"
                : "opacity-100"
            }
          `}
        >
          <button
            onClick={() => {
              setMode((prev) => {
                if (prev === "add_fiber_optic") {
                  return "default";
                }

                if (prev === "add_customer") {
                  clearAddMarker?.();
                }

                return "add_fiber_optic";
              });
            }}
            className={`
              px-3 py-2 rounded-xl text-white shadow-lg
              flex items-center transition-all cursor-pointer text-xs sm:text-sm
              ${
                mode === "add_fiber_optic"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }
              group overflow-hidden
            `}
          >
            {mode === "add_fiber_optic" ? (
              <>
                <X size={16} />
                <span className={`overflow-hidden whitespace-nowrap transition-[max-width] duration-200 ease-out ${mode === "add_fiber_optic" ? "max-w-[140px] ml-1.5" : "max-w-0 group-hover:max-w-[140px] group-hover:ml-1.5"}`}>
                  Cancel Fiber
                </span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span className={`overflow-hidden whitespace-nowrap transition-[max-width] duration-200 ease-out ${mode === "add_fiber_optic" ? "max-w-[140px] ml-1.5" : "max-w-0 group-hover:max-w-[140px] group-hover:ml-1.5"}`}>
                  Add Fiber
                </span>
              </>
            )}
          </button>
        </div>
      )}
      
      {/* ADD CUSTOMER */}
      {canCreateCustomer && (
        <div className={`absolute right-4 sm:right-5 z-[1] transition-all
          bottom-16
          ${
          isLocked && !isActive("add_customer")
            ? "opacity-40 pointer-events-none"
            : "opacity-100"
        }`}>
          <button
            onClick={() => {
              setMode((prev) =>
                prev === "add_customer"
                  ? "default"
                  : "add_customer"
              );

              if (mode === "add_customer") {
                clearAddMarker?.();
                setMapFormOpen(false);
              }
            }}
            className={`
              px-3 py-2 rounded-xl text-white shadow-lg
              flex items-center transition-all cursor-pointer text-xs sm:text-sm
              ${
                mode === "add_customer"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-600 hover:bg-green-700"
              }
              group overflow-hidden
            `}
          >
            {mode === "add_customer" ? (
              <>
                <X size={16} />
                <span className={`overflow-hidden whitespace-nowrap transition-[max-width] duration-200 ease-out ${mode === "add_customer" ? "max-w-[140px] ml-1.5" : "max-w-0 group-hover:max-w-[140px] group-hover:ml-1.5"}`}>
                  Cancel Add
                </span>
              </>
            ) : (
              <>
                <UserPlus2 size={16} />
                <span className={`overflow-hidden whitespace-nowrap transition-[max-width] duration-200 ease-out ${mode === "add_customer" ? "max-w-[140px] ml-1.5" : "max-w-0 group-hover:max-w-[140px] group-hover:ml-1.5"}`}>
                  Add Customer
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* SELECT AREA */}
      <button
        onClick={() => {
          setMode((prev) =>
            prev === "select_area" ? "default" : "select_area"
          );
          onSelectArea();
        }}
        disabled={isLocked && !isActive("select_area")}
        className={`
          absolute right-4 sm:right-5 z-[1]
          px-2 py-2 rounded-xl text-white
          shadow-lg transition-all font-medium text-xs sm:text-sm
          bg-purple-600 hover:bg-purple-700 px-3
          bottom-5
          ${
            isLocked && !isActive("select_area")
              ? "opacity-40"
              : "opacity-100 cursor-pointer"
          }
          ${
            isSelecting
              ? "bg-yellow-500 hover:bg-yellow-600"
              : hasSelection
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-600 hover:bg-blue-700"
          }
          group overflow-hidden
        `}
      >
        <span className="flex items-center">
          <Scan size={16} />
          <span className={`overflow-hidden whitespace-nowrap transition-[max-width] duration-200 ease-out ${mode === "select_area" ? "max-w-[200px] ml-1.5" : "max-w-0 group-hover:max-w-[200px] group-hover:ml-1.5"}`}>
            {isSelecting
              ? "Select Area"
              : hasSelection
              ? "Remove Selected Area"
              : "Select Area"}
          </span>
        </span>
      </button>
    </>
  );
}