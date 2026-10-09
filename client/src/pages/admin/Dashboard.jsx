import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

function Dashboard() {
  const [pickups, setPickups] = useState([]);
  const [ewaste, setEwaste] = useState([]);

  useEffect(() => {
    const savedPickups =
      JSON.parse(localStorage.getItem("greencycle_pickups")) || [];

    const savedEwaste =
      JSON.parse(localStorage.getItem("greencycle_ewaste")) || [];

    setPickups(savedPickups);
    setEwaste(savedEwaste);
  }, []);

  const totalWeight = ewaste.reduce(
    (sum, item) => sum + Number(item.weight || 0),
    0
  );

  const pendingRequests = pickups.filter(
    (pickup) => pickup.status === "REQUESTED"
  ).length;

  const assignedPickups = pickups.filter(
    (pickup) => pickup.status === "ASSIGNED"
  ).length;

  const completedPickups = pickups.filter(
    (pickup) => pickup.status === "PICKED UP"
  ).length;

  const recentPickups = [...pickups].reverse().slice(0, 5);

  const getStatusStyle = (status) => {
    switch (status) {
      case "REQUESTED":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";

      case "ASSIGNED":
        return "bg-blue-50 text-blue-700 border-blue-100";

      case "PICKED UP":
        return "bg-purple-50 text-purple-700 border-purple-100";

      default:
        return "bg-green-50 text-green-700 border-green-100";
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>

              <p className="text-sm font-medium text-green-700">
                Administrator Dashboard
              </p>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Manage GreenCycle
            </h1>

            <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-2xl">
              Monitor e-waste collection, pickup requests and traceable
              recycling batches from one place.
            </p>
          </div>

          <Link
            to="/admin/pickups"
            className="w-full sm:w-fit inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition shadow-sm"
          >
            <span>🚚</span>
            Manage Pickups
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Total E-Waste */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total E-Waste
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalWeight}
                  <span className="text-base font-medium text-gray-500 ml-1">
                    kg
                  </span>
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-lg">
                ♻
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Registered e-waste weight
            </p>
          </div>

          {/* Pending */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Requests
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {pendingRequests}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 text-lg">
                ⏳
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Waiting for collector assignment
            </p>
          </div>

          {/* Assigned */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Assigned Pickups
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {assignedPickups}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                🚚
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Currently assigned to collectors
            </p>
          </div>

          {/* Completed */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Completed Pickups
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {completedPickups}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-lg">
                ✓
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              E-waste collected from shops
            </p>
          </div>
        </div>

        {/* Management + Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Management */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  ⚙
                </div>

                <h2 className="text-lg font-bold text-gray-900">
                  Management
                </h2>
              </div>

              <p className="text-sm text-gray-500 mt-3">
                Manage the e-waste lifecycle from pickup to batch creation.
              </p>
            </div>

            <div className="mt-6 space-y-3">

              {/* Pickup Management */}
              <Link
                to="/admin/pickups"
                className="group block p-4 rounded-2xl bg-green-50 border border-green-100 hover:bg-green-100 hover:border-green-200 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-green-800">
                      Pickup Management
                    </p>

                    <p className="text-sm text-green-700 mt-1">
                      Assign collectors and track pickup progress.
                    </p>
                  </div>

                  <span className="text-green-700 group-hover:translate-x-1 transition">
                    →
                  </span>
                </div>
              </Link>

              {/* Batch Management */}
              <Link
                to="/admin/batches"
                className="group block p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      E-Waste Batches
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Create and manage traceable recycling batches.
                    </p>
                  </div>

                  <span className="text-gray-500 group-hover:translate-x-1 transition">
                    →
                  </span>
                </div>
              </Link>
            </div>

            {/* Admin Workflow */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Workflow
              </p>

              <div className="mt-4 space-y-3">

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center text-xs font-bold">
                    1
                  </div>

                  <span className="text-sm text-gray-600">
                    Review pickup request
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                    2
                  </div>

                  <span className="text-sm text-gray-600">
                    Assign collector
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold">
                    3
                  </div>

                  <span className="text-sm text-gray-600">
                    Create traceable batch
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Pickup Requests
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Latest pickup activity across GreenCycle.
                </p>
              </div>

              <Link
                to="/admin/pickups"
                className="w-fit text-sm font-semibold text-green-600 hover:text-green-700"
              >
                View all →
              </Link>
            </div>

            <div className="mt-6">

              {recentPickups.length === 0 ? (
                <div className="py-14 text-center border border-dashed border-gray-200 rounded-2xl">

                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center text-3xl">
                    📦
                  </div>

                  <p className="font-semibold text-gray-900 mt-5">
                    No pickup requests
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    New pickup requests will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">

                  {recentPickups.map((pickup) => (
                    <div
                      key={pickup.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition"
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg">
                          📦
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {pickup.category}
                          </p>

                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {pickup.weight} kg • {pickup.id}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`w-fit shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusStyle(
                          pickup.status
                        )}`}
                      >
                        {pickup.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Traceability Banner */}
        <div className="mt-6 bg-[#17211b] rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative">

          <div className="relative z-10 max-w-3xl">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-green-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              Admin Control
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mt-4">
              Control the complete e-waste journey.
            </h2>

            <p className="text-gray-300 mt-3 leading-relaxed">
              Manage pickup assignments, create traceable batches and
              connect collected e-waste with authorized recyclers.
              Every important handover becomes part of the Digital
              E-Waste Passport.
            </p>

            <div className="flex flex-wrap gap-2 mt-5">
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs text-gray-200">
                Shop
              </span>

              <span className="text-gray-500">→</span>

              <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs text-gray-200">
                Collector
              </span>

              <span className="text-gray-500">→</span>

              <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs text-gray-200">
                Collection Center
              </span>

              <span className="text-gray-500">→</span>

              <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs text-gray-200">
                Recycler
              </span>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-20 w-56 h-56 rounded-full bg-green-600/10"></div>
          <div className="absolute right-24 -top-20 w-40 h-40 rounded-full bg-green-400/5"></div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Dashboard;