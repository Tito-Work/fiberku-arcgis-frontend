import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,

  packages = [],
  visibleCustomers = [],
  operators = [],

  totalRevenue = 0,
  utilization = 0,
  remaining = 0,
  visibleCount = 0,

  packageChartData = [],
  revenueChartData = [],
  COLORS = [],
}) {
  // Operator colors matching MapView.jsx getOperatorColor
  const getOperatorColor = (operatorName) => {
    const colorMap = {
      "IndiHome": "#3b82f6",      // Blue
      "Biznet": "#ef4444",         // Red
      "MyRepublic": "#22c55e",     // Green
      "First Media": "#f97316",   // Orange
      "CBN": "#a855f7",            // Purple
      "Oxygen": "#ec4899",         // Pink
      "IconNet": "#14b8a6",        // Teal
    };
    return colorMap[operatorName] || "#6366f1"; // Default to Indigo
  };
  return (
    <>
      {sidebarOpen && (
        <div
          className="lg:hidden absolute inset-0 bg-black/40 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          absolute lg:relative
          z-40
          h-full w-[350px] sm:w-[350px] lg:w-[650px]
          bg-gray-100 border-r
          overflow-y-auto
          transition-all duration-300
          flex-shrink-0

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="p-4 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">

          {/* MONITORING DASHBOARD */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold text-lg mb-2 text-gray-800 text-center">
              Monitoring Dashboard
            </h3>

            {/* Revenue - Full Width */}
            <div className="rounded-2xl p-2 px-4 bg-blue-500 text-white shadow-lg mb-2">
              <div className="text-sm font-medium opacity-90">
                Total Revenue
              </div>
              <div className="text-3xl font-bold mt-1">
                Rp {totalRevenue.toLocaleString("id-ID")}
              </div>
            </div>

            {/* GRID - 2x2 Layout */}
            <div className="grid grid-cols-2 gap-2 mb-2">

              {/* Active Customers */}
              <div className="rounded-xl border bg-emerald-100 border-emerald-200 p-1 px-4 transition-shadow">
                <div className="text-sm font-semibold text-emerald-700 mb-1">
                  Active Customers
                </div>
                <div className="text-2xl font-bold text-emerald-800">
                  {visibleCount}
                </div>
              </div>

              {/* Coverage Utilization */}
              <div className="rounded-xl border bg-blue-100 border-blue-200 p-1 px-4 transition-shadow">
                <div className="text-sm font-semibold text-blue-700 mb-1">
                  Coverage Utilization
                </div>
                <div className="text-2xl font-bold text-blue-800">
                  {isNaN(utilization) || !isFinite(utilization) ? 0 : utilization.toFixed(1)}%
                </div>
                <div className="mt-1">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${isNaN(utilization) || !isFinite(utilization) ? 0 : Math.min(utilization, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Package Distribution - Single Column List */}
              <div className="col-span-2 rounded-xl border bg-purple-100 border-purple-200 p-1 px-4 transition-shadow">
                <div className="text-sm font-semibold text-purple-700 mb-2">
                  Package Distribution
                </div>
                
                {packages.length > 0 ? (
                  <div className="space-y-1">
                    {packages.map((pkg) => {
                      const count = visibleCustomers.filter(
                        (c) => c.package === pkg.name
                      ).length;
                      const percentage = visibleCount > 0 ? (count / visibleCount * 100).toFixed(0) : 0;
                      
                      return (
                        <div key={pkg.id} className="flex items-center justify-between bg-white rounded-lg p-1 px-4 border border-purple-200">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-3"
                              style={{ backgroundColor: pkg.color }}
                            ></div>
                            <span className="text-sm font-medium text-gray-700">{pkg.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-purple-800">{count} <span className="text-xs text-gray-500">({percentage}%)</span></div>
                            
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm py-4">
                    No packages available
                  </div>
                )}
              </div>

              {/* Remaining Capacity */}
              <div className="col-span-2 rounded-xl border bg-orange-100 to-orange-100 border-orange-200 p-2 px-4 transition-shadow">
                <div className="text-sm font-semibold text-orange-700 mb-1">
                  Remaining Capacity
                </div>
                <div className="flex items-baseline">
                  <div className="text-2xl font-bold text-orange-800">
                    {remaining}
                  </div>
                  <div className="ml-2 text-sm text-gray-600">
                    slots available
                  </div>
                </div>
              </div>

            </div>

            {/* Coverage Legend */}
            <div className="col-span-2 rounded-xl border bg-yellow-50 border-yellow-200 p-2 px-4 mb-2">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                Coverage Legend
              </div>

              <div className="mt-2 sm:mt-1 flex items-center gap-3 flex-wrap w-full">
                <div className="w-full flex items-center justify-between bg-white rounded-lg border border-gray-300 p-1 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-3 rounded bg-green-400 border border-green-500"></div>
                    <div className="text-xs font-semibold text-gray-700">
                      Low
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    0% - 50%
                  </div>
                </div>
              </div>

              <div className="mt-1 sm:mt-1 flex items-center gap-3 flex-wrap w-full">
                <div className="w-full flex items-center justify-between bg-white rounded-lg border border-gray-300 p-1 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-3 rounded bg-yellow-400 border border-yellow-500"></div>
                    <div className="text-xs font-semibold text-gray-700">
                      Moderate
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    51% - 80%
                  </div>
                </div>
              </div>

              <div className="mt-1 sm:mt-1 flex items-center gap-3 flex-wrap w-full">
                <div className="w-full flex items-center justify-between bg-white rounded-lg border border-gray-300 p-1 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-3 rounded bg-red-400 border border-red-500"></div>
                    <div className="text-xs font-semibold text-gray-700">
                      High
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    81% - 100%
                  </div>
                </div>
              </div>
            </div>

            {/* Fiber Optic Operators Legend */}
            <div className="col-span-2 rounded-xl border bg-blue-50 border-blue-200 p-2 px-4">
              <div className="text-sm font-semibold text-gray-700 mb-3">
                Fiber Optic Operators
              </div>

              {operators.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {operators.map((op) => (
                    <div key={op.id} className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-1 px-3">
                      <div 
                        className="w-4 h-1 rounded"
                        style={{ backgroundColor: getOperatorColor(op.name) }}
                      ></div>
                      <span className="text-xs font-medium text-gray-700">{op.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm py-2">
                  No operators available
                </div>
              )}
            </div>
          </div>

          {/* CHARTS */}
          <div className="flex flex-col gap-4 xl:sticky xl:top-4 h-fit">

            {/* PIE CHART */}
            <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-gray-800">
                Package Distribution
              </h3>

              <div className="flex justify-center">
                <PieChart width={240} height={150} sm:width={280} sm:height={180}>
                  <Pie
                    data={packageChartData}
                    dataKey="value"
                    outerRadius={50}
                    innerRadius={20}
                    paddingAngle={2}
                  >
                    {packageChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} customers`, 'Count']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </div>

              <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                {packages.map((pkg) => {
                  const count = visibleCustomers.filter(
                    (c) => c.package === pkg.name
                  ).length;
                  return (
                    <div key={pkg.id} className="flex items-center justify-between text-[10px] sm:text-xs bg-gray-100 rounded p-1.5 sm:p-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                          style={{ backgroundColor: pkg.color }}
                        />
                        <span className="text-gray-700 font-medium truncate">{pkg.name}</span>
                      </div>
                      <span className="font-semibold text-gray-800">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BAR CHART */}
            <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-gray-800">
                Revenue by Package
              </h3>

              <div className="flex justify-center">
                <BarChart width={240} height={150} sm:width={280} sm:height={180} data={revenueChartData}>
                  <XAxis 
                    dataKey="package" 
                    tick={{ fontSize: 9 }} 
                    angle={-45}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis hide />
                  <Tooltip 
                    formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />

                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {revenueChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </div>

              <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                {packages.map((pkg) => {
                  const revenue = visibleCustomers
                    .filter((c) => c.package === pkg.name)
                    .reduce((a, b) => a + b.price, 0);
                  return (
                    <div key={pkg.id} className="flex items-center justify-between text-[10px] sm:text-xs bg-gray-100 rounded p-1.5 sm:p-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                          style={{ backgroundColor: pkg.color }}
                        />
                        <span className="text-gray-700 font-medium truncate">{pkg.name}</span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        Rp {revenue.toLocaleString('id-ID')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}