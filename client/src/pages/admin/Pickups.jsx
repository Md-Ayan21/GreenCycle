
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:5000/api";

function Pickups() {
  const { token } = useAuth();

  const [pickups, setPickups] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getStatusStyle = (status) => {
    switch (status) {
      case "REQUESTED":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "ASSIGNED":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "PICKED UP":
        return "bg-purple-50 text-purple-700 border-purple-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const loadData = useCallback(async () => {
    if (!token) {
      setError("Authentication token missing. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [pickupResponse, collectorResponse] = await Promise.all([
        fetch(`${API_URL}/pickups`, { headers }),
        fetch(`${API_URL}/users/collectors`, { headers }),
      ]);

      const pickupResult = await pickupResponse.json();
      const collectorResult = await collectorResponse.json();

      if (!pickupResponse.ok) {
        throw new Error(
          pickupResult.message || "Could not load pickup requests."
        );
      }

      if (!collectorResponse.ok) {
        throw new Error(
          collectorResult.message || "Could not load collectors."
        );
      }

      setPickups(Array.isArray(pickupResult.data) ? pickupResult.data : []);
      setCollectors(
        Array.isArray(collectorResult.data) ? collectorResult.data : []
      );
    } catch (err) {
      setError(err.message || "Something went wrong while loading data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const assignCollector = async (pickupId, collectorId) => {
    if (!collectorId) return;

    setAssigningId(pickupId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/pickups/${pickupId}/assign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ collectorId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to assign collector.");
      }

      setSuccess("Collector assigned successfully.");
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to assign collector.");
    } finally {
      setAssigningId("");
    }
  };

  const pendingRequests = pickups.filter(
    (pickup) => pickup.status === "REQUESTED"
  );

  const assignedPickups = pickups.filter(
    (pickup) => pickup.status === "ASSIGNED"
  );

  const completedPickups = pickups.filter(
    (pickup) => pickup.status === "PICKED UP"
  );

  const formatDate = (date) => {
    if (!date) return "Not scheduled";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "Not scheduled";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getWeight = (pickup) =>
    pickup.actualWeight ?? pickup.weight ?? pickup.ewaste?.weight ?? 0;

  const getQuantity = (pickup) =>
    pickup.quantity ?? pickup.ewaste?.quantity ?? 0;

  const getCollectorName = (pickup) =>
    typeof pickup.collector === "object"
      ? pickup.collector?.name || "Not assigned"
      : pickup.collector || "Not assigned";

  const getRequestId = (pickup) =>
    pickup._id || pickup.id || "Unavailable";

  const StatCard = ({ title, value, description, icon, iconClass }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${iconClass}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4">{description}</p>
    </div>
  );

  const EmptyState = ({ icon, title, description }) => (
    <div className="py-10 text-center border border-dashed border-gray-200 rounded-2xl">
      <div className="w-12 h-12 mx-auto rounded-xl bg-gray-50 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <p className="font-semibold text-gray-900 mt-4">{title}</p>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );

  return (
    <DashboardLayout role="admin">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-sm font-medium text-green-700">
                Collection Management
              </p>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Pickup Management
            </h1>

            <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-2xl">
              Review pickup requests, assign collectors and monitor the
              physical handover of e-waste.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="w-fit px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "↻ Refresh Requests"}
          </button>
        </div>

        {/* API messages */}
        {error && (
          <div
            role="alert"
            className="mb-5 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 p-4 rounded-xl border border-green-200 bg-green-50 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Requests"
            value={pickups.length}
            description="All pickup requests"
            icon="📋"
            iconClass="bg-gray-100 text-gray-600"
          />

          <StatCard
            title="Pending Assignment"
            value={pendingRequests.length}
            description="Waiting for a collector"
            icon="⏳"
            iconClass="bg-yellow-50 text-yellow-600"
          />

          <StatCard
            title="Assigned"
            value={assignedPickups.length}
            description="Collector assigned"
            icon="🚚"
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Picked Up"
            value={completedPickups.length}
            description="Physical handover completed"
            icon="✓"
            iconClass="bg-green-50 text-green-600"
          />
        </div>

        {loading && pickups.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
            Loading pickup requests from the database...
          </div>
        ) : (
          <>
            {/* Pending Assignment */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Pending Assignment
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Pickup requests waiting for a collector.
                  </p>
                </div>

                {pendingRequests.length > 0 && (
                  <span className="w-fit px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-100 text-yellow-700 text-xs font-semibold">
                    {pendingRequests.length} pending
                  </span>
                )}
              </div>

              {pendingRequests.length === 0 ? (
                <EmptyState
                  icon="✓"
                  title="No pending requests"
                  description="New shop pickup requests will appear here."
                />
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((pickup) => (
                    <div
                      key={getRequestId(pickup)}
                      className="border border-gray-200 rounded-2xl p-5 hover:border-yellow-200 hover:shadow-sm transition"
                    >
                      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 text-lg shrink-0">
                              📦
                            </div>

                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {pickup.category ||
                                  pickup.ewaste?.category ||
                                  "E-waste"}
                              </h3>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Pickup Request
                              </p>
                            </div>

                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusStyle(
                                pickup.status
                              )}`}
                            >
                              {pickup.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-500">
                                Request ID
                              </p>
                              <p className="font-semibold text-gray-900 mt-1 break-all text-sm">
                                {getRequestId(pickup)}
                              </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-500">Weight</p>
                              <p className="font-semibold text-gray-900 mt-1">
                                {getWeight(pickup)} kg
                              </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-500">Quantity</p>
                              <p className="font-semibold text-gray-900 mt-1">
                                {getQuantity(pickup)}
                              </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-500">
                                Pickup Date
                              </p>
                              <p className="font-semibold text-gray-900 mt-1">
                                {formatDate(pickup.scheduledDate || pickup.date)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500">
                              Shop
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {pickup.shop?.businessName ||
                                pickup.shop?.name ||
                                "Shop"}
                            </p>
                          </div>

                          <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500">
                              Pickup Address
                            </p>
                            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                              {pickup.address || "Address not provided"}
                            </p>
                          </div>

                          {pickup.notes && (
                            <div className="mt-4">
                              <p className="text-xs font-medium text-gray-500">
                                Notes
                              </p>
                              <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                                {pickup.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Assign collector */}
                        <div className="w-full xl:w-72 shrink-0">
                          <label
                            htmlFor={`collector-${getRequestId(pickup)}`}
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Assign Collector
                          </label>

                          <div className="relative">
                            <select
                              id={`collector-${getRequestId(pickup)}`}
                              defaultValue=""
                              disabled={
                                assigningId === getRequestId(pickup) ||
                                collectors.length === 0
                              }
                              onChange={(event) => {
                                const collectorId = event.target.value;
                                if (collectorId) {
                                  assignCollector(
                                    getRequestId(pickup),
                                    collectorId
                                  );
                                }
                              }}
                              className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-gray-300 bg-white text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="">
                                {collectors.length === 0
                                  ? "No active collectors"
                                  : "Select collector"}
                              </option>

                              {collectors.map((collector) => (
                                <option
                                  key={collector._id}
                                  value={collector._id}
                                >
                                  {collector.name} ({collector.email})
                                </option>
                              ))}
                            </select>

                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                              ▼
                            </span>
                          </div>

                          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                            {assigningId === getRequestId(pickup)
                              ? "Assigning collector..."
                              : "Selecting a collector immediately assigns this pickup."}
                          </p>

                          {collectors.length === 0 && (
                            <p className="text-xs text-amber-700 mt-2">
                              Create or activate a collector account first.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-6 pt-5 border-t border-gray-100">
                        <div className="grid grid-cols-3 gap-2 relative">
                          <div className="absolute top-4 left-[16%] right-[16%] h-0.5 bg-gray-200" />

                          <div className="relative z-10 text-center">
                            <div className="mx-auto w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                              ✓
                            </div>
                            <p className="text-xs font-medium text-gray-500 mt-2">
                              Requested
                            </p>
                          </div>

                          <div className="relative z-10 text-center">
                            <div className="mx-auto w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold">
                              2
                            </div>
                            <p className="text-xs font-medium text-gray-500 mt-2">
                              Assignment
                            </p>
                          </div>

                          <div className="relative z-10 text-center">
                            <div className="mx-auto w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
                              3
                            </div>
                            <p className="text-xs font-medium text-gray-500 mt-2">
                              Picked Up
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Assigned Pickups */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Assigned Pickups
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Requests currently assigned to collectors.
                  </p>
                </div>

                {assignedPickups.length > 0 && (
                  <span className="w-fit px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
                    {assignedPickups.length} assigned
                  </span>
                )}
              </div>

              {assignedPickups.length === 0 ? (
                <EmptyState
                  icon="🚚"
                  title="No assigned pickups"
                  description="Assigned requests will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {assignedPickups.map((pickup) => (
                    <div
                      key={getRequestId(pickup)}
                      className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 p-4 rounded-2xl bg-blue-50 border border-blue-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-blue-600 text-lg">
                          🚚
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {pickup.category ||
                                pickup.ewaste?.category ||
                                "E-waste"}
                            </p>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(
                                pickup.status
                              )}`}
                            >
                              {pickup.status}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 mt-1 break-all">
                            {getWeight(pickup)} kg • {getRequestId(pickup)}
                          </p>

                          <p className="text-sm text-gray-700 mt-1">
                            Collector:{" "}
                            <span className="font-semibold text-gray-900">
                              {getCollectorName(pickup)}
                            </span>
                          </p>

                          <p className="text-sm text-gray-700 mt-1">
                            Shop:{" "}
                            {pickup.shop?.businessName ||
                              pickup.shop?.name ||
                              "Shop"}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500 lg:text-right shrink-0">
                        <p>Pickup Date</p>
                        <p className="font-semibold text-gray-900 mt-1">
                          {formatDate(pickup.scheduledDate || pickup.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Completed Pickups */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Completed Pickups
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    E-waste that has been collected from shops.
                  </p>
                </div>

                {completedPickups.length > 0 && (
                  <span className="w-fit px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-semibold">
                    {completedPickups.length} completed
                  </span>
                )}
              </div>

              {completedPickups.length === 0 ? (
                <EmptyState
                  icon="✓"
                  title="No completed pickups yet"
                  description="Collected e-waste will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {completedPickups.map((pickup) => (
                    <div
                      key={getRequestId(pickup)}
                      className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 p-4 rounded-2xl bg-green-50 border border-green-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-green-100 flex items-center justify-center text-green-600 text-lg">
                          ✓
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {pickup.category ||
                                pickup.ewaste?.category ||
                                "E-waste"}
                            </p>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(
                                pickup.status
                              )}`}
                            >
                              PICKED UP
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 mt-1 break-all">
                            {getWeight(pickup)} kg • {getRequestId(pickup)}
                          </p>

                          <p className="text-sm text-gray-700 mt-1">
                            Collector:{" "}
                            <span className="font-semibold text-gray-900">
                              {getCollectorName(pickup)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500 lg:text-right shrink-0">
                        <p>Collection Status</p>
                        <p className="font-semibold text-green-700 mt-1">
                          Handover completed
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Workflow Banner */}
        <div className="mt-6 bg-[#17211b] rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-green-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Admin Workflow
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mt-4">
              Every pickup needs a verified handover.
            </h2>

            <p className="text-gray-300 mt-3 leading-relaxed">
              Review the shop request, assign a collector and monitor the
              pickup until the physical e-waste handover is completed.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-5">
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs text-gray-200">
                Requested
              </span>
              <span className="text-gray-500">→</span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs text-gray-200">
                Assigned
              </span>
              <span className="text-gray-500">→</span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs text-gray-200">
                Picked Up
              </span>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-20 w-56 h-56 rounded-full bg-green-600/10" />
          <div className="absolute right-24 -top-20 w-40 h-40 rounded-full bg-green-400/5" />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Pickups;
