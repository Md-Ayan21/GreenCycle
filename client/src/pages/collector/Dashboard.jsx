
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:5000/api";

function Dashboard() {
  const { token } = useAuth();

  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState("");
  const [weightInputs, setWeightInputs] = useState({});

  const loadPickups = useCallback(async () => {
    if (!token) {
      setError("Login session missing. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/pickups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load pickups.");
      }

      setPickups(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || "Failed to load pickups.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPickups();
  }, [loadPickups]);

  const assignedPickups = pickups.filter(
    (pickup) => pickup.status === "ASSIGNED"
  );

  const pickedUpPickups = pickups.filter(
    (pickup) => pickup.status === "PICKED UP"
  );

  const getId = (pickup) => pickup._id || pickup.id;

  const getWeight = (pickup) =>
    pickup.actualWeight ?? pickup.weight ?? pickup.ewaste?.weight ?? 0;

  const getQuantity = (pickup) =>
    pickup.quantity ?? pickup.ewaste?.quantity ?? 0;

  const getDate = (date) => {
    if (!date) return "Not scheduled";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "Not scheduled";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const markPickedUp = async (pickup) => {
    const pickupId = getId(pickup);
    const enteredWeight = weightInputs[pickupId];
    const actualWeight =
      enteredWeight === undefined || enteredWeight === ""
        ? Number(getWeight(pickup))
        : Number(enteredWeight);

    if (!Number.isFinite(actualWeight) || actualWeight <= 0) {
      setError("Please enter a valid actual weight greater than zero.");
      return;
    }

    const confirmed = window.confirm(
      `Confirm collection of ${pickup.category || "e-waste"} with actual weight ${actualWeight} kg?`
    );

    if (!confirmed) return;

    setProcessingId(pickupId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/pickups/${pickupId}/pickup`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ actualWeight }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not complete pickup.");
      }

      setSuccess("Pickup marked as collected successfully.");
      await loadPickups();
    } catch (err) {
      setError(err.message || "Failed to complete pickup.");
    } finally {
      setProcessingId("");
    }
  };

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

  return (
    <DashboardLayout role="collector">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-sm font-medium text-green-700">
                Collector Dashboard
              </p>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Manage your pickups
            </h1>

            <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-xl">
              View assigned pickup requests and confirm physical collection.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPickups}
            disabled={loading}
            className="w-fit px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* Messages */}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Assigned Pickups"
            value={assignedPickups.length}
            description="Pickups waiting for collection"
            icon="🚚"
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Picked Up"
            value={pickedUpPickups.length}
            description="Successfully collected"
            icon="✓"
            iconClass="bg-green-50 text-green-600"
          />

          <StatCard
            title="Total Requests"
            value={pickups.length}
            description="Requests assigned to you"
            icon="📋"
            iconClass="bg-gray-100 text-gray-600"
          />
        </div>

        {/* Assigned Pickups */}
        <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Assigned Pickups
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Pickups that are ready for collection.
              </p>
            </div>

            {assignedPickups.length > 0 && (
              <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                {assignedPickups.length} pending
              </span>
            )}
          </div>

          {loading && pickups.length === 0 ? (
            <div className="py-14 text-center text-gray-500">
              Loading assigned pickups...
            </div>
          ) : assignedPickups.length === 0 ? (
            <div className="py-14 px-4 text-center border border-dashed border-gray-200 rounded-2xl">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                🚚
              </div>

              <p className="font-bold text-gray-900 mt-5">
                No assigned pickups
              </p>

              <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                New pickup assignments from the admin will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedPickups.map((pickup) => {
                const pickupId = getId(pickup);

                return (
                  <div
                    key={pickupId}
                    className="border border-gray-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-sm transition"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                      {/* Pickup Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg shrink-0">
                            🚚
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

                          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            ASSIGNED
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500">Request ID</p>
                            <p className="font-semibold text-gray-900 mt-1 break-all text-sm">
                              {pickupId}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500">
                              Estimated Weight
                            </p>
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
                            <p className="text-xs text-gray-500">Pickup Date</p>
                            <p className="font-semibold text-gray-900 mt-1">
                              {getDate(pickup.scheduledDate || pickup.date)}
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

                      {/* Actual Weight and Action */}
                      <div className="w-full xl:w-72 shrink-0">
                        <label
                          htmlFor={`weight-${pickupId}`}
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Actual Collected Weight (kg)
                        </label>

                        <input
                          id={`weight-${pickupId}`}
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={
                            weightInputs[pickupId] ?? String(getWeight(pickup))
                          }
                          onChange={(event) =>
                            setWeightInputs((previous) => ({
                              ...previous,
                              [pickupId]: event.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        />

                        <p className="text-xs text-gray-400 mt-2">
                          Enter the weight measured during collection.
                        </p>

                        <button
                          type="button"
                          disabled={processingId === pickupId}
                          onClick={() => markPickedUp(pickup)}
                          className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold shadow-sm hover:bg-green-700 hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>✓</span>
                          {processingId === pickupId
                            ? "Updating..."
                            : "Mark Picked Up"}
                        </button>
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
                          <div className="mx-auto w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                            ✓
                          </div>
                          <p className="text-xs font-medium text-gray-500 mt-2">
                            Assigned
                          </p>
                        </div>

                        <div className="relative z-10 text-center">
                          <div className="mx-auto w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
                            3
                          </div>
                          <p className="text-xs font-medium text-gray-500 mt-2">
                            Collected
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                Pickup requests already collected.
              </p>
            </div>

            {pickedUpPickups.length > 0 && (
              <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
                {pickedUpPickups.length} completed
              </span>
            )}
          </div>

          {pickedUpPickups.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-gray-200 rounded-2xl">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gray-50 flex items-center justify-center text-2xl">
                ✓
              </div>

              <p className="font-semibold text-gray-900 mt-4">
                No completed pickups yet
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Completed collections will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...pickedUpPickups]
                .sort(
                  (a, b) =>
                    new Date(b.pickedUpAt || b.updatedAt || 0) -
                    new Date(a.pickedUpAt || a.updatedAt || 0)
                )
                .map((pickup) => (
                  <div
                    key={getId(pickup)}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-green-200 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-lg">
                        ✓
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {pickup.category ||
                            pickup.ewaste?.category ||
                            "E-waste"}
                        </p>

                        <p className="text-sm text-gray-500 mt-1 break-all">
                          {getWeight(pickup)} kg • {getId(pickup)}
                        </p>
                      </div>
                    </div>

                    <span className="w-fit px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                      PICKED UP
                    </span>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Workflow Info */}
        <div className="mt-6 bg-[#17211b] rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-green-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Your Role
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mt-4">
              Verify the physical handover.
            </h2>

            <p className="text-gray-300 mt-3 leading-relaxed">
              Once you collect the e-waste from the shop, enter the actual
              collected weight and confirm the pickup. This records the next
              verified step in the e-waste traceability journey.
            </p>
          </div>

          <div className="absolute -right-10 -bottom-16 w-48 h-48 rounded-full bg-green-600/10" />
          <div className="absolute right-24 -top-16 w-36 h-36 rounded-full bg-green-400/5" />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
