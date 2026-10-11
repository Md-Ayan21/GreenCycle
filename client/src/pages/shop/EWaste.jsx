
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_BASE_URL } from "../../config/api";

function EWaste() {
  const { token } = useAuth();

  const [ewaste, setEwaste] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEWaste = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Please log in to view your e-waste records.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/ewaste`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load e-waste records.");
      }

      const records = Array.isArray(result.data) ? result.data : [];
      setEwaste(records);
    } catch (err) {
      setError(err.message || "Unable to load e-waste records.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadEWaste();
  }, [loadEWaste]);

  const totalWeight = ewaste.reduce(
    (sum, item) => sum + Number(item.weight || 0),
    0
  );

  const pickupRequestedCount = ewaste.filter(
    (item) => item.status !== "REGISTERED"
  ).length;

  const getStatusStyle = (status) => {
    switch (status) {
      case "REGISTERED":
        return "bg-gray-100 text-gray-600 border border-gray-200";
      case "REQUESTED":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "ASSIGNED":
        return "bg-blue-50 text-blue-700 border border-blue-100";
      case "PICKED UP":
        return "bg-purple-50 text-purple-700 border border-purple-100";
      case "Recycled":
      case "RECYCLING CONFIRMED":
        return "bg-green-50 text-green-700 border border-green-100";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  return (
    <DashboardLayout role="shop">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-sm font-medium text-green-700">
                E-Waste Management
              </p>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              My E-Waste
            </h1>

            <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-xl">
              View and track all electronic waste registered by your shop.
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

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={loadEWaste}
              className="mt-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "—" : ewaste.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                📦
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Registered e-waste records
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Weight</p>
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
              Combined registered weight
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pickup In Progress
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "—" : pickupRequestedCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 text-lg">
                🚚
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Items no longer awaiting registration
            </p>
          </div>
        </div>

        {/* E-Waste List */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Registered E-Waste
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Your registered electronic waste records.
              </p>
            </div>

            {!loading && ewaste.length > 0 && (
              <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                {ewaste.length} record{ewaste.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-14 text-center text-sm text-gray-500">
              Loading e-waste records...
            </div>
          ) : ewaste.length === 0 ? (
            <div className="py-14 px-4 text-center border border-dashed border-gray-200 rounded-2xl">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                ♻️
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-5">
                No e-waste registered
              </h3>
              <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
                Start by registering your electronic waste so it can enter the
                GreenCycle collection and recycling journey.
              </p>
              <Link
                to="/shop/e-waste/new"
                className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                <span>+</span>
                Register E-Waste
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {ewaste.map((item) => {
                const databaseId = item._id;
                const itemId = item.id || databaseId;
                const status = item.status || "REGISTERED";
                const canRequestPickup =
                  status === "REGISTERED" && Boolean(databaseId);

                return (
                  <div
                    key={databaseId || itemId}
                    className="border border-gray-200 rounded-2xl p-5 hover:border-green-200 hover:shadow-sm transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-lg shrink-0">
                            ♻
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {item.category}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              E-Waste Record
                            </p>
                          </div>

                          <span
                            className={`ml-1 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(status)}`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500">Weight</p>
                            <p className="font-semibold text-gray-900 mt-1">
                              {item.weight} kg
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500">Quantity</p>
                            <p className="font-semibold text-gray-900 mt-1">
                              {item.quantity}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-3 min-w-0">
                            <p className="text-xs text-gray-500">Item ID</p>
                            <p className="font-semibold text-gray-900 mt-1 break-all">
                              {itemId}
                            </p>
                          </div>
                        </div>

                        {item.description && (
                          <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500">
                              Description
                            </p>
                            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="w-full lg:w-auto lg:min-w-[150px]">
                        {canRequestPickup ? (
                          <Link
                            to={`/shop/pickups?ewaste=${encodeURIComponent(databaseId)}`}
                            className="group w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold shadow-sm hover:bg-green-700 hover:shadow-md transition"
                          >
                            Request Pickup
                            <span className="group-hover:translate-x-1 transition">
                              →
                            </span>
                          </Link>
                        ) : (
                          <Link
                            to="/shop/pickups"
                            className="group w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition"
                          >
                            View Pickup
                            <span>→</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Traceability Banner */}
        <div className="mt-6 bg-[#17211b] rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-green-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              E-Waste Traceability
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mt-4">
              Every registered item starts a traceable journey.
            </h2>
            <p className="text-gray-300 mt-3 leading-relaxed">
              Once a pickup is requested, the e-waste moves through collection,
              batching and authorized recycling. The final journey can be
              verified through the Digital E-Waste Passport.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-16 w-48 h-48 rounded-full bg-green-600/10" />
          <div className="absolute right-24 -top-16 w-36 h-36 rounded-full bg-green-400/5" />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default EWaste;
