import { useEffect, useRef } from "react";

import esriConfig from "@arcgis/core/config";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "../../utils/permissions";

import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

import Graphic from "@arcgis/core/Graphic";

import Legend from "@arcgis/core/widgets/Legend";
import LayerList from "@arcgis/core/widgets/LayerList";
import Expand from "@arcgis/core/widgets/Expand";
import Popup from "@arcgis/core/widgets/Popup";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Point from "@arcgis/core/geometry/Point";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";

import { mapService } from "../../services/mapService";
import Swal from "sweetalert2";
import Polygon from "@arcgis/core/geometry/Polygon";

import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
// import Measurement from "@arcgis/core/widgets/Measurement";
import DistanceMeasurement2D from "@arcgis/core/widgets/DistanceMeasurement2D";
import AreaMeasurement2D from "@arcgis/core/widgets/AreaMeasurement2D";

export default function MapViewComponent({
  customers,
  onMapClick,
  setVisibleCustomers,
  isAddMode,
  clearAddMarker,
  hasSelection,
  setHasSelection,
  isSelecting,
  setIsSelecting,
  onRegisterSelectArea,
  setCustomers,
  setSelectedCustomer,
  setCustomerModalOpen,
  setForm,
  selectedCustomerId,
  setSelectedCustomerId,
  setCoverageAreas,
  onReadyFetchCustomers,
  onReadyFetchCoverages,
  setIsEditMode,
  mode,
  setMode,
  filters,
  clearAddMarkerTrigger,
  segments = [],
  operators = [],
  setVisibleCoverages,
}) {
  const { hasPermission } = usePermissions();
  const canReadCustomer = hasPermission(PERMISSIONS.READ_CUSTOMER);
  const canUpdateCustomer = hasPermission(PERMISSIONS.UPDATE_CUSTOMER);
  const canDeleteCustomer = hasPermission(PERMISSIONS.DELETE_CUSTOMER);
  
  const mapRef = useRef(null);

  const customerLayerRef = useRef(null);
  const customerDataRef = useRef([]);
  const selectedGeometryRef = useRef(null);
  const isAddModeRef = useRef(false);
  const clickLayerRef = useRef(null);
  const coverageLayerRef = useRef(null);
  const coverageDataRef = useRef([]);
  const viewRef = useRef(null);
  const allCustomersRef = useRef([]);
  const fiberLayerRef = useRef(null);
  const hoveredCustomerIdRef = useRef(null);
  const hoverCloseTimeoutRef = useRef(null);
  const isPointerOverPopupRef = useRef(false);
  const sketchViewModelRef = useRef(null);
  const selectionLayerRef = useRef(null);
  const modeRef = useRef("default");
  const segmentsRef = useRef([]);
  const operatorsRef = useRef([]);

  const packageColors = {};
  const operatorColors = {};

  // Define operator colors
  const getOperatorColor = (operatorId, operatorName) => {
    // Direct color mapping based on operator name
    const operatorColorMap = {
      "IndiHome": [59, 130, 246],      // Blue
      "Biznet": [239, 68, 68],         // Red
      "MyRepublic": [34, 197, 94],     // Green
      "First Media": [249, 115, 22],   // Orange
      "CBN": [168, 85, 247],           // Purple
      "Oxygen": [236, 72, 153],        // Pink
      "IconNet": [20, 184, 166],       // Teal
    };

    const color = operatorColorMap[operatorName] || [99, 102, 241]; // Default to Indigo
    return color;
  };

  const applyFilters = (customers) => {
    if (!filters) return customers;

    return customers.filter((c) => {
      // PACKAGE
      if (filters.package && c.package !== filters.package) {
        return false;
      }

      // OPERATOR
      if (filters.operator && c.operator !== filters.operator) {
        return false;
      }

      // COVERAGE
      if (filters.coverageId) {
        const coverage = coverageDataRef.current.find(
          (a) => String(a.id) === String(filters.coverageId)
        );

        if (!coverage) return true;

        const point = new Point({
          longitude: c.longitude,
          latitude: c.latitude,
          spatialReference: { wkid: 4326 },
        });

        if (!geometryEngine.contains(coverage.geometry, point)) {
          return false;
        }
      }

      return true;
    });
  };

  const getVisibleCustomersInView = (customers) => {
    const view = viewRef.current;
    if (!view?.extent) return customers;

    const extent = view.extent;
    return customers.filter((customer) => {
      const geographicPoint = new Point({
        longitude: customer.longitude,
        latitude: customer.latitude,
        spatialReference: { wkid: 4326 },
      });

      const point = webMercatorUtils.geographicToWebMercator(
        geographicPoint
      );

      return geometryEngine.contains(extent, point);
    });
  };

  const updateVisibleCustomersFromCurrentState = (customers) => {
    customerDataRef.current = customers;
    const filtered = applyFilters(customers);

    if (selectedGeometryRef.current) {
      const visible = filtered.filter((customerItem) => {
        const geographicPoint = new Point({
          longitude: customerItem.longitude,
          latitude: customerItem.latitude,
          spatialReference: { wkid: 4326 },
        });

        const point = webMercatorUtils.geographicToWebMercator(
          geographicPoint
        );

        return geometryEngine.contains(
          selectedGeometryRef.current,
          point
        );
      });

      setVisibleCustomers(visible);
      return;
    }

    const visible = getVisibleCustomersInView(filtered);
    setVisibleCustomers(visible);
  };

  const convertPolygonToWkt = (geometry) => {
    if (!geometry?.rings?.length) return null;

    const geographicGeometry = webMercatorUtils.webMercatorToGeographic(
      geometry
    );

    const ring = geographicGeometry.rings[0] || [];
    const coordinates = ring
      .map(([longitude, latitude]) => `${longitude} ${latitude}`)
      .join(", ");

    return `POLYGON((${coordinates}))`;
  };
  
  const promptCoverageDetails = async () => {
    const { value } = await Swal.fire({
      title: "New Coverage Area",
      html: `
        <hr class="border-t border-gray-300 my-4">

        <div class="text-left">
          <p class="text-sm text-gray-500 mb-4">
            Enter coverage area information and maximum customer capacity.
          </p>

          <div class="grid grid-cols-2 gap-3">
            
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">
                Area Name
              </label>

              <input
                id="coverage-area"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Jakarta Selatan"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">
                Max Customers
              </label>

              <input
                id="coverage-max"
                type="number"
                min="1"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 100"
              />
            </div>

          </div>
        </div>

        <hr class="border-t border-gray-300 my-4">
      `,
      width: 460,
      showCancelButton: true,
      confirmButtonText: "Save Coverage",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      focusConfirm: false,
      focusDeny: false,
      focusCancel: false,
      customClass: {
        popup: "rounded-2xl px-6 py-5",
        title: "text-xl font-bold text-gray-800",
        confirmButton:
          "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold w-[150px] cursor-pointer",
        cancelButton:
          "bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold ml-2 w-[150px] cursor-pointer",
        actions: "mt-5",
      },
      didOpen: () => {
        setTimeout(() => {
          document.activeElement?.blur();
        }, 0);
      },
      preConfirm: () => {
        const area = document.getElementById("coverage-area")?.value?.trim();

        const maxCustomer = Number(
          document.getElementById("coverage-max")?.value
        );

        if (!area) {
          Swal.showValidationMessage("Area name is required");
          return false;
        }

        if (!maxCustomer || maxCustomer <= 0) {
          Swal.showValidationMessage(
            "Max customers must be greater than 0"
          );
          return false;
        }

        return {
          area,
          maxCustomer,
        };
      },
    });

    return value;
  };

  const convertPolylineToWkt = (geometry) => {
    if (!geometry?.paths?.length) return null;

    const geographicGeometry = webMercatorUtils.webMercatorToGeographic(
      geometry
    );

    const path = geographicGeometry.paths[0] || [];
    const coordinates = path
      .map(([longitude, latitude]) => `${longitude} ${latitude}`)
      .join(", ");

    return `LINESTRING(${coordinates})`;
  };
  
  const promptFiberOpticDetails = async () => {
    const segmentOptions = (segmentsRef.current || [])
      .map((s) => `<option value="${s.id}">${s.name}</option>`)
      .join("");

    const operatorOptions = (operatorsRef.current || [])
      .map((o) => `<option value="${o.id}">${o.name}</option>`)
      .join("");

    const { value } = await Swal.fire({
      title: "New Fiber Optic Line",
      html: `
        <hr class="border-t border-gray-300 my-4">
        <div class="text-left">
          <p class="text-sm text-gray-500 mb-4">
            Select segment and operator for this fiber optic line.
          </p>

          <div class="grid grid-cols-2 gap-3">
            
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">
                Segment
              </label>

              <select
                id="fiber-segment"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Select segment</option>
                ${segmentOptions}
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">
                Operator
              </label>

              <select
                id="fiber-operator"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Select operator</option>
                ${operatorOptions}
              </select>
            </div>

          </div>
        </div>
        <hr class="border-t border-gray-300 my-4">
      `,
      width: 460,
      showCancelButton: true,
      confirmButtonText: "Save Fiber Line",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      focusConfirm: false,
      focusDeny: false,
      focusCancel: false,
      customClass: {
        popup: "rounded-2xl px-6 py-5",
        title: "text-xl font-bold text-gray-800",
        confirmButton:
          "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold w-[150px] cursor-pointer",
        cancelButton:
          "bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold ml-2 w-[150px] cursor-pointer",
        actions: "mt-5",
      },
      didOpen: () => {
        document.getElementById("fiber-segment")?.blur();
        document.getElementById("fiber-operator")?.blur();
      },
      preConfirm: () => {
        const segmentId = document.getElementById("fiber-segment")?.value;
        const operatorId = document.getElementById("fiber-operator")?.value;

        if (!segmentId) {
          Swal.showValidationMessage("Segment is required");
          return false;
        }

        if (!operatorId) {
          Swal.showValidationMessage("Operator is required");
          return false;
        }

        return { segmentId, operatorId };
      },
    });

    return value;
  };

  const createFiberOpticFromGeometry = async (geometry) => {
    const location = convertPolylineToWkt(geometry);
    if (!location) {
      Swal.fire({
        icon: "error",
        title: "Invalid fiber line",
        text: "Please draw a valid line for fiber optic.",
      });
      setMode?.("default");
      return;
    }

    const details = await promptFiberOpticDetails();
    if (!details) {
      setMode?.("default");
      return;
    }

    try {
      await mapService.createFiberOptic({
        segment_id: details.segmentId,
        operator_id: details.operatorId,
        location,
        is_active: true,
      });

      await loadFiber();
      Swal.fire({
        icon: "success",
        title: "Fiber optic created",
        text: "New fiber optic line has been saved.",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Create fiber optic failed",
        text:
          err?.response?.data?.message ||
          "Unable to save fiber optic line. Please try again.",
      });
    } finally {
      setMode?.("default");
      selectionLayerRef.current?.removeAll();
    }
  };

  const createCoverageFromGeometry = async (geometry) => {
    const location = convertPolygonToWkt(geometry);
    if (!location) {
      Swal.fire({
        icon: "error",
        title: "Invalid coverage shape",
        text: "Please draw a valid polygon for coverage.",
      });
      setMode?.("default");
      return;
    }

    const details = await promptCoverageDetails();
    if (!details) {
      setMode?.("default");
      return;
    }

    try {
      await mapService.createCoverage({
        area: details.area,
        max_customer: details.maxCustomer,
        current_customer: 0,
        location,
        is_active: true,
      });

      await loadCoverages();
      Swal.fire({
        icon: "success",
        title: "Coverage created",
        text: "New coverage area has been saved.",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Create coverage failed",
        text:
          err?.response?.data?.message ||
          "Unable to save coverage area. Please try again.",
      });
    } finally {
      setMode?.("default");
      selectionLayerRef.current?.removeAll();
    }
  };

  const loadCoverages = async () => {
    try {
      const features = await mapService.fetchCoverages();
      
      const mappedCoverage = features.map((f) => ({
        id: f.properties.id,
        name: f.properties.name,
        area: f.properties.area,

        max_customer: Number(
          f.properties.max_customer || 0
        ),

        current_customer: Number(
          f.properties.current_customer || 0
        ),

        geometry: new Polygon({
          rings: f.geometry.coordinates,
          spatialReference: {
            wkid: 4326,
          },
        }),
      }));

      setCoverageAreas(mappedCoverage);
      coverageDataRef.current = mappedCoverage;

      coverageLayerRef.current?.removeAll();

      features.forEach((f) => {
        const graphic = new Graphic({
          geometry: new Polygon({
            rings: f.geometry.coordinates,
            spatialReference: {
              wkid: 4326,
            },
          }),
          attributes: f.properties,
          symbol: {
            type: "simple-fill",
            color: getColor(f.properties.current_customer * 100 / f.properties.max_customer),
            outline: { color: "white", width: 1 },
          },
        });

        coverageLayerRef.current.add(graphic);
      });

      setCoverageAreas(mappedCoverage);
      coverageDataRef.current = mappedCoverage;
      setVisibleCoverages?.(mappedCoverage);
    } catch (err) {
      console.error("Coverage error:", err);
    }
  };

  const loadFiber = async () => {
    try {
      const features = await mapService.fetchFiber();

      if (!fiberLayerRef.current) return;

      fiberLayerRef.current.removeAll();

      features.forEach((f) => {
        const operatorId = f.properties.operator_id;
        const operatorName = f.properties.operator_name || f.properties.operator || "Unknown";
        const color = getOperatorColor(operatorId, operatorName);

        const graphic = new Graphic({
          geometry: {
            type: "polyline",
            paths: f.geometry.coordinates,
            spatialReference: { wkid: 4326 },
          },

          attributes: f.properties,

          symbol: {
            type: "simple-line",
            color: color,
            width: 3,
          },
        });

        fiberLayerRef.current.add(graphic);
      });
    } catch (err) {
      console.error("Fiber load error:", err);
    }
  };
  
  const loadCustomers = async () => {
    try {
      const features = await mapService.fetchCustomers();

      const mapped = features.map((f) => ({
        id: f.properties.id,
        name: f.properties.name,
        email: f.properties.email,
        code: f.properties.code,
        phone: f.properties.phone,
        address: f.properties.address,
        package_id: f.properties.package_id,
        package: f.properties.package,
        package_color: f.properties.package_color,
        price: Number(f.properties.price || 0),
        longitude: f.geometry.coordinates[0],
        latitude: f.geometry.coordinates[1],
      }));

      allCustomersRef.current = mapped;
      customerDataRef.current = mapped;

      setVisibleCustomers(mapped);
      setCustomers(mapped);

    } catch (err) {
      console.error("Customer load error:", err);
    }
  };

  const checkAvailability = (point) => {
    const geographicPoint = webMercatorUtils.webMercatorToGeographic(point);

    const coverage = coverageDataRef.current.find(
      (area) => {
        return geometryEngine.contains(
          area.geometry,
          geographicPoint
        );
      }
    );

    // =========================
    // OUTSIDE COVERAGE
    // =========================
    if (!coverage) {
      return {
        available: false,
        reason: "OUTSIDE_COVERAGE",
      };
    }

    // =========================
    // FULL UTILIZATION
    // =========================
    const utilization =
      (coverage.current_customer /
        coverage.max_customer) *
      100;

    if (utilization >= 100) {
      return {
        available: false,
        reason: "FULL_CAPACITY",
        coverage,
      };
    }
    
    return {
      available: true,
      coverage,
      remaining:
        coverage.max_customer - coverage.current_customer,
      utilization,
    };
  };

  const updateVisibleCoveragesInView = () => {
    const view = viewRef.current;

    if (!view?.extent) {
      setVisibleCoverages?.(coverageDataRef.current);
      return;
    }

    const visible = coverageDataRef.current.filter((coverage) => {
      const geometry = webMercatorUtils.geographicToWebMercator(
        coverage.geometry
      );

      return geometryEngine.intersects(view.extent, geometry);
    });

    setVisibleCoverages?.(visible);
  };

  useEffect(() => {
    if (!onReadyFetchCustomers) return;

    onReadyFetchCustomers(loadCustomers);
  }, [onReadyFetchCustomers]);

  useEffect(() => {
    if (!onReadyFetchCoverages) return;

    onReadyFetchCoverages(loadCoverages);
  }, [onReadyFetchCoverages]);

  useEffect(() => {
    operatorsRef.current = operators;
    segmentsRef.current = segments;

    // Reload fiber optic lines when operators are loaded to apply correct colors
    if (operators.length > 0 && fiberLayerRef.current) {
      loadFiber();
    }

    // Update operator legend
    if (window.updateOperatorLegend) {
      window.updateOperatorLegend();
    }
  }, [operators, segments]);

  useEffect(() => {
    if (!mapRef.current) return;

    esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY || "";

    const customerLayer = new GraphicsLayer({ title: "Customers" });
    const clickLayer = new GraphicsLayer({ title: "Click Marker" });
    const fiberLayer = new GraphicsLayer({ title: "Fiber Optic" });
    const coverageLayer = new GraphicsLayer({ title: "Coverage" });
    const selectionLayer = new GraphicsLayer({ title: "Selection" });

    customerLayerRef.current = customerLayer;
    clickLayerRef.current = clickLayer;
    fiberLayerRef.current = fiberLayer;
    coverageLayerRef.current = coverageLayer;
    selectionLayerRef.current = selectionLayer;

    const map = new Map({
      basemap: "streets-navigation-vector",
      layers: [
        coverageLayer,
        fiberLayerRef.current,
        customerLayer,
        selectionLayer,
        clickLayer,
      ],
    });

    const view = new MapView({
      container: mapRef.current,
      map,
      center: [106.8272, -6.1754],
      zoom: 13,
    });
    const popup = new Popup({
      view,
      autoOpenEnabled: false,
      dockEnabled: false,
      updateLocationEnabled: false,
    });
    view.popup = popup;
    viewRef.current = view;

    view.when(() => {
      const sketchViewModel = new SketchViewModel({
        view,
        layer: selectionLayer,
      });
      sketchViewModelRef.current = sketchViewModel;
      const popupWidget = view.popup;

      const clearPopupCloseTimer = () => {
        if (hoverCloseTimeoutRef.current) {
          window.clearTimeout(hoverCloseTimeoutRef.current);
          hoverCloseTimeoutRef.current = null;
        }
      };

      const schedulePopupClose = () => {
        if (hoverCloseTimeoutRef.current) return;

        hoverCloseTimeoutRef.current = window.setTimeout(() => {
          if (!isPointerOverPopupRef.current && popupWidget?.visible) {
            popupWidget.close();
            hoveredCustomerIdRef.current = null;
          }
          hoverCloseTimeoutRef.current = null;
        }, 200);
      };

      const attachPopupHoverListeners = () => {
        const popupNode = view.container?.querySelector(".esri-popup");
        if (!popupNode) return;

        popupNode.addEventListener("mouseenter", () => {
          isPointerOverPopupRef.current = true;
          clearPopupCloseTimer();
        });

        popupNode.addEventListener("mouseleave", () => {
          isPointerOverPopupRef.current = false;
          schedulePopupClose();
        });
      };

      attachPopupHoverListeners();
      setTimeout(attachPopupHoverListeners, 300);

      const updateVisibleCustomers = (geometry) => {
        selectedGeometryRef.current = geometry;
        setIsSelecting(false);
        setHasSelection(true);

        const visible =
          allCustomersRef.current.filter(
            (customerItem) => {
              const geographicPoint =
                new Point({
                  longitude:
                    customerItem.longitude,

                  latitude:
                    customerItem.latitude,

                  spatialReference: {
                    wkid: 4326,
                  },
                });

              const point =
                webMercatorUtils.geographicToWebMercator(
                  geographicPoint
                );

              return geometryEngine.contains(
                geometry,
                point
              );
            }
          );

        setVisibleCustomers(visible);
      };

      sketchViewModel.on(
        "create",
        async (event) => {
          if (event.state === "cancel") {
            if (
              modeRef.current === "add_coverage" ||
              modeRef.current === "add_fiber_optic"
            ) {
              setMode?.("default");
            }
            setIsSelecting(false);
            setHasSelection(false);
            return;
          }

          if (event.state !== "complete") return;

          const geometry = event.graphic.geometry;

          if (modeRef.current === "add_fiber_optic") {
            await createFiberOpticFromGeometry(geometry);
            return;
          }

          if (modeRef.current === "add_coverage") {
            await createCoverageFromGeometry(geometry);
            return;
          }

          setHasSelection(true);
          updateVisibleCustomers(geometry);
        }
      );
      sketchViewModel.on(
        "update",
        (event) => {
          if (
            event.state !== "complete"
          )
            return;

          const geometry = event.graphics[0].geometry;
          setHasSelection(true);

          updateVisibleCustomers(
            geometry
          );
        }
      );

      const legend = new Legend({
        view: viewRef.current,
      });

      const legendExpand = new Expand({
        view: viewRef.current,
        content: legend,
      });

      viewRef.current?.ui.add(legendExpand, "bottom-left");

      // Create custom operator legend
      const operatorLegendDiv = document.createElement("div");
      operatorLegendDiv.className = "operator-legend";
      operatorLegendDiv.style.cssText = `
        background: white;
        padding: 12px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        font-family: Arial, sans-serif;
        font-size: 12px;
      `;
      operatorLegendDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px; color: #333;">Fiber Optic Operators</div>
        <div id="operator-legend-items"></div>
      `;

      const updateOperatorLegend = () => {
        const itemsDiv = operatorLegendDiv.querySelector("#operator-legend-items");
        if (!itemsDiv) return;

        const currentOperators = operatorsRef.current;
        itemsDiv.innerHTML = currentOperators.map(op => {
          const color = getOperatorColor(op.id, op.name);
          const colorStr = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
          return `
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
              <div style="width: 20px; height: 4px; background: ${colorStr}; margin-right: 8px; border-radius: 2px;"></div>
              <span style="color: #555;">${op.name}</span>
            </div>
          `;
        }).join("");
      };

      const operatorLegendExpand = new Expand({
        view: viewRef.current,
        content: operatorLegendDiv,
        expandIcon: "layers",
        expanded: false,
      });

      viewRef.current?.ui.add(operatorLegendExpand, "bottom-left");

      // Store update function for later use
      window.updateOperatorLegend = updateOperatorLegend;

      // Initial legend update
      setTimeout(updateOperatorLegend, 1000);

      const layerList = new LayerList({
        view: viewRef.current,
      });

      const layerListExpand = new Expand({
        view: viewRef.current,
        content: layerList,
      });

      const basemapGallery = new BasemapGallery({
        view: viewRef.current,
      });

      const basemapGalleryExpand = new Expand({
        view: viewRef.current,
        content: basemapGallery,
        expandIcon: "basemap",
        expanded: false,
      });

      const distanceMeasurement = new DistanceMeasurement2D({
        view: viewRef.current,
      });

      const areaMeasurement = new AreaMeasurement2D({
        view: viewRef.current,
      });

      const distanceExpand = new Expand({
        view: viewRef.current,
        content: distanceMeasurement,
        expandIcon: "measure-line",
        expanded: false,
      });

      const areaExpand = new Expand({
        view: viewRef.current,
        content: areaMeasurement,
        expandIcon: "measure-area",
        expanded: false,
      });

      viewRef.current?.ui.add(layerListExpand, "top-right");
      viewRef.current?.ui.add(basemapGalleryExpand, "top-right");
      viewRef.current?.ui.add(distanceExpand, "top-right");
      viewRef.current?.ui.add(areaExpand, "top-right");

      view.watch("stationary", (isStationary) => {
        if (!isStationary) return;
        updateVisibleCoveragesInView();

        if (selectedGeometryRef.current) return;
        updateVisibleCustomersFromCurrentState(customerDataRef.current);
      });

      viewRef.current?.on("click", async (event) => {

        if (
          modeRef.current === "select_area" ||
          modeRef.current === "add_coverage" ||
          modeRef.current === "add_fiber_optic"
        ) {
          return;
        }

        // =========================
        // CHECK AVAILABILITY MODE
        // =========================
        if (modeRef.current === "check_availability") {
          const point = viewRef.current?.toMap(event);

          const result = checkAvailability(point);

          if (!result.available) {
            if (result.reason === "OUTSIDE_COVERAGE") {
              Swal.fire({
                icon: "error",
                title: "Service Not Available",
                text: "Outside coverage area",
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Service Not Available",
                text: "Capacity full",
              });
            }

            return;
          }

          Swal.fire({
            icon: "info",
            title: "Service Available",
            text: `Remaining: ${result.remaining}`,
          });

          return;
        }

        // =========================
        // ADD MODE
        // =========================
        if (modeRef.current === "add_customer") {

          const point = viewRef.current?.toMap(event);
          const result = checkAvailability(point);

          if (!result.available) {
            if (result.reason === "OUTSIDE_COVERAGE") {
              Swal.fire({
                icon: "error",
                title: "Coverage Error",
                text: "Customer must be inside coverage area",
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Coverage Error",
                text: "Coverage area is full",
              });
            }

            return;
          }

          clickLayer.removeAll();

          const marker = new Graphic({
            geometry: point,
            symbol: {
              type: "simple-marker",
              color: "red",
              size: 12,
              outline: {
                color: "white",
                width: 2,
              },
            },
          });

          clickLayer.add(marker);

          onMapClick?.({
            latitude: point.latitude.toFixed(6),
            longitude: point.longitude.toFixed(6),
            screenX: event.x,
            screenY: event.y,
            mapPoint: point,
          });

          return;
        }

        // =========================
        // NORMAL MODE
        // =========================
        const hit = await viewRef.current.hitTest(event);

        // Check for customer click first (priority over coverage)
        const result = hit.results.find(
          (r) => r.graphic.layer === customerLayerRef.current
        );

        if (result) {
          const customer = result.graphic.attributes;

          // CHECK PERMISSION BEFORE OPENING MODAL
          if (!canReadCustomer) {
            Swal.fire({
              icon: "error",
              title: "Access Denied",
              text: "You don't have permission to view customer details",
            });
            return;
          }

          // OPEN MODAL HERE
          setSelectedCustomerId(customer.id);
          setSelectedCustomer(customer);
          setForm({
            code: customer.code || "",
            name: customer.name || "",
            email: customer.email || "",
            phone: customer.phone || "",
            address: customer.address || "",
            package: customer.package_id || "",
            price: customer.price || "",
            latitude: customer.latitude || "",
            longitude: customer.longitude || "",
          });
          setIsEditMode(canUpdateCustomer);
          setCustomerModalOpen(true);
          return;
        }

        // Check for coverage click
        const coverageResult = hit.results.find(
          (r) => r.graphic.layer === coverageLayerRef.current
        );

        if (coverageResult) {
          const coverage = coverageResult.graphic.attributes;
          const utilization = coverage.max_customer > 0
            ? ((coverage.current_customer / coverage.max_customer) * 100).toFixed(1)
            : 0;

          Swal.fire({
            title: coverage.area || coverage.name || "Coverage Area",
            html: `
              <hr class="border-t border-gray-300 my-3">
              <div style="text-align: left;">
                <p><strong>Area:</strong> ${coverage.area || coverage.name || 'N/A'}</p>
                <p><strong>Max Customers:</strong> ${coverage.max_customer || 0}</p>
                <p><strong>Current Customers:</strong> ${coverage.current_customer || 0}</p>
                <p><strong>Utilization:</strong> ${utilization}%</p>
                <p><strong>Remaining:</strong> ${(coverage.max_customer || 0) - (coverage.current_customer || 0)}</p>
              </div>
              <hr class="border-t border-gray-300 my-3">
            `,
            confirmButtonColor: "#2563eb",
            width: "450px",
          });
          return;
        }
      });

      popupWidget.on("trigger-action", (event) => {
        if (event.action.id !== "edit-customer") return;

        const feature = popupWidget?.selectedFeature;
        if (!feature) return;

        const customer = feature.attributes;
        if (!canUpdateCustomer) {
          Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: "You don't have permission to edit customer details",
          });
          return;
        }

        setSelectedCustomerId(customer.id);
        setSelectedCustomer(customer);
        setForm({
          code: customer.code || "",
          name: customer.name || "",
          email: customer.email || "",
          phone: customer.phone || "",
          address: customer.address || "",
          package: customer.package_id || "",
          price: customer.price || "",
          latitude: customer.latitude || "",
          longitude: customer.longitude || "",
        });
        setIsEditMode(true);
        setCustomerModalOpen(true);
      });

      viewRef.current.on("pointer-move", async (event) => {
        const popup = view.popup;

        if (modeRef.current !== "default") {
          clearPopupCloseTimer();
          if (popup && typeof popup.close === "function") {
            popup.close();
          }
          hoveredCustomerIdRef.current = null;
          return;
        }

        const hit = await viewRef.current.hitTest(event, {
          include: [customerLayerRef.current],
        });
        const hoverResult = hit.results[0];

        if (!hoverResult) {
          if (popup?.visible && !isPointerOverPopupRef.current) {
            schedulePopupClose();
          }
          return;
        }

        clearPopupCloseTimer();

        const hoveredCustomer = hoverResult.graphic.attributes;
        const isSameCustomer =
          hoveredCustomerIdRef.current === hoveredCustomer.id;

        hoveredCustomerIdRef.current = hoveredCustomer.id;

        const shouldOpenPopup =
          !popup?.visible ||
          !isSameCustomer ||
          popup?.selectedFeature !== hoverResult.graphic;

        if (shouldOpenPopup && popup && typeof popup.open === "function") {
          popup.open({
            features: [hoverResult.graphic],
            location: event.mapPoint || hoverResult.graphic.geometry,
            updateLocationEnabled: false,
          });
        }
      });
    });

    return () => {
      if (viewRef) {
        viewRef.current?.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!customerLayerRef.current) return;
    
    customerDataRef.current = customers;
    customerLayerRef.current.removeAll();
    const filtered = applyFilters(customers);

    filtered.forEach((customer) => {
      const graphic = new Graphic({
        geometry: {
          type: "point",
          longitude: customer.longitude,
          latitude: customer.latitude,
        },

        attributes: customer,

        popupTemplate: {
          title: "{name}",
          content: [
            {
              type: "text",
              text: "<strong>Code:</strong> {code}<br><strong>Package:</strong> {package}<br><strong>Email:</strong> {email}<br><strong>Phone:</strong> {phone}",
            },
          ],
          actions: [
            {
              // id: "edit-customer",
              // title: "Edit",
              // className: "esri-icon-edit",
            },
          ],
        },

        symbol:
          customer.id === selectedCustomerId
            ? {
                type: "simple-marker",
                color: "#fff",
                size: 16,

                outline: {
                  color: "#000",
                  width: 3,
                },
              }
            : {
                type: "simple-marker",

                color:
                  customer.package_color || "#3b82f6",

                size: 10,

                outline: {
                  color: "white",
                  width: 1,
                },
              },
      });

      customerLayerRef.current.add(graphic);
    });
  }, [customers, selectedCustomerId]);

  useEffect(() => {
    updateVisibleCustomersFromCurrentState(customers);
  }, [customers, filters]);

  useEffect(() => {
    isAddModeRef.current = isAddMode;
  }, [isAddMode]);
  
  useEffect(() => {
    if (clickLayerRef.current) {
      clickLayerRef.current.removeAll();
    }
  }, [clearAddMarkerTrigger]);

  useEffect(() => {
    if (mode !== "add_customer") {
      clickLayerRef.current?.removeAll();
    }
  }, [mode]);

  const getColor = (value) => {
    if (value <= 50) return [0, 255, 0, 0.4]; // hijau
    if (value <= 80) return [255, 255, 0, 0.4]; // kuning
    return [255, 0, 0, 0.4]; // merah
  };
  
  useEffect(() => {
    loadCoverages();
    loadFiber();
    
    if (!viewRef.current) return;

    viewRef.current.when(() => {
      loadCustomers();
    });
  }, []);

  useEffect(() => {
    if (!onRegisterSelectArea) return;

    const handleSelectArea = () => {
      const sketch = sketchViewModelRef.current;
      const layer = selectionLayerRef.current;

      if (!sketch || !layer) return;

      if (isSelecting) {
        sketch.cancel();
        layer.removeAll();
        setIsSelecting(false);
        setHasSelection(false);
        return;
      }

      if (hasSelection) {
        layer.removeAll();
        selectedGeometryRef.current = null;
        updateVisibleCustomersFromCurrentState(customers);
        setHasSelection(false);
        return;
      }

      layer.removeAll();
      sketch.cancel();

      setIsSelecting(true);

      sketch.create("rectangle");
    };

    onRegisterSelectArea(handleSelectArea);
  }, [onRegisterSelectArea, isSelecting, hasSelection, customers]);

  useEffect(() => {
    if (!customerLayerRef.current) return;

    updateVisibleCustomersFromCurrentState(customers);
  }, [customers, filters]);

  useEffect(() => {
    modeRef.current = mode;

    const sketch = sketchViewModelRef.current;
    if (!sketch) return;

    if (mode === "add_fiber_optic") {
      selectionLayerRef.current?.removeAll();
      sketch.cancel();
      sketch.create("polyline");
      return;
    }

    if (mode === "add_coverage") {
      selectionLayerRef.current?.removeAll();
      sketch.cancel();
      sketch.create("polygon");
      return;
    }

    if (mode !== "select_area") {
      sketch.cancel();
    }
  }, [mode]);

  useEffect(() => {
    if (!customerLayerRef.current) return;

    customerLayerRef.current.removeAll();

    const filtered = applyFilters(customers);

    filtered.forEach((customer) => {
      const graphic = new Graphic({
        geometry: {
          type: "point",
          longitude: customer.longitude,
          latitude: customer.latitude,
        },
        attributes: customer,
        popupTemplate: {
          title: "{name}",
          content: [
            {
              type: "text",
              text: "<strong>Code:</strong> {code}<br><strong>Package:</strong> {package}<br><strong>Email:</strong> {email}<br><strong>Phone:</strong> {phone}",
            },
          ],
          actions: [
            
          ],
        },
        symbol: {
          type: "simple-marker",
          color: customer.package_color || "#3b82f6",
          size: 10,
          outline: { color: "white", width: 1 },
        },
      });

      customerLayerRef.current.add(graphic);
    });

  }, [filters, customers]);

  return (
    <div
      ref={mapRef}
      className={`w-full h-full ${
        mode === "check_availability"
          ? "map-crosshair-blue"
          : mode === "add_customer"
          ? "map-crosshair-green"
          : ""
      }`}
    />
  );
}