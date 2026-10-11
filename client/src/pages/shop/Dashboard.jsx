import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_BASE_URL } from "../../config/api";

function Dashboard() {
  const { token } = useAuth();

  const [ewaste, setEwaste] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Please log in to view your dashboard.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [ewasteResponse, pickupsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/ewaste`, { headers }),
        fetch(`${API_BASE_URL}/pickups`, { headers }),
      ]);

      const ewasteResult = await ewasteResponse.json();
      const pickupsResult = await pickupsResponse.json();

      if (!ewasteResponse.ok || !ewasteResult.success) {
        throw new Error(
          ewasteResult.message || "Unable to load e-waste records."
        );
      }

      if (!pickupsResponse.ok || !pickupsResult.success) {
        throw new Error(
          pickupsResult.message || "Unable to load pickup requests."
        );
      }

      const ewasteData = Array.isArray(ewasteResult.data)
        ? ewasteResult.data
        : Array.isArray(ewasteResult.ewaste)
          ? ewasteResult.ewaste
          : [];

      const pickupData = Array.isArray(pickupsResult.data)
        ? pickupsResult.data
        : Array.isArray(pickupsResult.pickups)
          ? pickupsResult.pickups
          : [];

      setEwaste(ewasteData);
      setPickups(pickupData);
    } catch (err) {
      setError(
        err.message || "Something went wrong while loading the dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalWeight = ewaste.reduce(
    (sum, item) => sum + Number(item.weight || 0),
    0
  );

  const pendingPickups = pickups.filter((pickup) =>
    ["REQUESTED", "ASSIGNED"].includes(pickup.status)
  ).length;

  const completedPickups = pickups.filter((pickup) =>
    ["PICKED UP", "RECYCLING CONFIRMED"].includes(pickup.status)
  ).length;

  const recentPickups = [...pickups]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 4);

  const getStatusStyle = (status) => {
    switch (status) {
      case "REQUESTED":
        return "bg-amber-50 text-amber-700 border border-amber-100";

      case "ASSIGNED":
        return "bg-blue-50 text-blue-700 border border-blue-100";

      case "PICKED UP":
        return "bg-purple-50 text-purple-700 border border-purple-100";

      case "RECYCLING CONFIRMED":
        return "bg-green-50 text-green-700 border border-green-100";

      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  return (
    <DashboardLayout role="shop">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />

              <p className="text-sm font-medium text-green-700">
                Shop Dashboard
              </p>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Manage your e-waste
            </h1>

            <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-xl">
              Register your electronic waste and track its journey from
              collection to responsible recycling.
            </p>
          </div>

          <Link
            to="/shop/e-waste/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold shadow-sm hover:bg-green-700 hover:shadow-md transition"
          >
            <span className="text-lg leading-none">+</span>
            Register E-Waste
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p className="font-semibold">
              Unable to load dashboard data
            </p>

            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={fetchDashboardData}
              className="mt-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {/* Total Weight */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total E-Waste
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "—" : totalWeight.toLocaleString()}

                  <span className="text-sm font-medium text-gray-500 ml-1">
                    kg
                  </span>
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-lg">
                ♻
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Total registered weight
            </p>
          </div>

          {/* Registered Items */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Registered Items
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "—" : ewaste.length}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                📦
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Items registered by your shop
            </p>
          </div>

          {/* Pending Pickups */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Pickups
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "—" : pendingPickups}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 text-lg">
                🚚
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Requests waiting for collection
            </p>
          </div>

          {/* Completed Pickups */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Completed Pickups
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "—" : completedPickups}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-lg">
                ✓
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Pickups successfully completed
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Quick Actions
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Manage your e-waste quickly.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <Link
                to="/shop/e-waste/new"
                className="group block p-4 rounded-xl bg-green-50 border border-green-100 hover:bg-green-100 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-800">
                      Register E-Waste
                    </p>

                    <p className="text-sm text-green-700 mt-1">
                      Add new electronic waste.
                    </p>
                  </div>

                  <span className="text-green-600 group-hover:translate-x-1 transition">
                    →
                  </span>
                </div>
              </Link>

              <Link
                to="/shop/e-waste"
                className="group block p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      View E-Waste
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Check your registered items.
                    </p>
                  </div>

                  <span className="text-gray-400 group-hover:translate-x-1 transition">
                    →
                  </span>
                </div>
              </Link>

              <Link
                to="/shop/pickups"
                className="group block p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Pickup Requests
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Track your collection requests.
                    </p>
                  </div>

                  <span className="text-gray-400 group-hover:translate-x-1 transition">
                    →
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Pickups */}
          <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Pickup Requests
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Latest activity from your shop.
                </p>
              </div>

              <Link
                to="/shop/pickups"
                className="shrink-0 text-sm font-semibold text-green-600 hover:text-green-700"
              >
                View all →
              </Link>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="py-12 text-center text-sm text-gray-500">
                  Loading your dashboard...
                </div>
              ) : recentPickups.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-gray-200 rounded-xl">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gray-50 flex items-center justify-center text-2xl">
                    📦
                  </div>

                  <p className="font-semibold text-gray-900 mt-4">
                    No pickup requests yet
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Register e-waste and create your first pickup request.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPickups.map((pickup) => {
                    const pickupId =
                      pickup._id || pickup.id || "Unknown ID";

                    const category =
                      pickup.category ||
                      pickup.ewaste?.category ||
                      pickup.eWaste?.category ||
                      "E-waste pickup";

                    const weight =
                      pickup.actualWeight ??
                      pickup.weight ??
                      pickup.ewaste?.weight ??
                      pickup.eWaste?.weight ??
                      0;

                    return (
                      <div
                        key={pickupId}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                            📦
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {category}
                            </p>

                            <p className="text-sm text-gray-500 mt-1 truncate">
                              {weight} kg • {pickupId}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(
                            pickup.status
                          )}`}
                        >
                          {pickup.status || "UNKNOWN"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Traceability Banner */}
        <div className="mt-6 bg-[#17211b] rounded-2xl p-6 sm:p-8 overflow-hidden relative">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-green-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              GreenCycle Traceability
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-4">
              Know where your e-waste goes.
            </h2>

            <p className="text-gray-300 mt-3 leading-relaxed max-w-2xl">
              Every batch can be tracked from your shop to the collection
              center and finally to the authorized recycler through a Digital
              E-Waste Passport.
            </p>
          </div>

          <div className="absolute -right-10 -bottom-16 w-48 h-48 rounded-full bg-green-600/10" />

          <div className="absolute right-20 -top-20 w-40 h-40 rounded-full bg-green-400/5" />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;