import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_BASE_URL } from "../../config/api";

function Pickups() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useAuth();

  const [ewaste, setEwaste] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [selectedEWaste, setSelectedEWaste] = useState(null);

  const [form, setForm] = useState({
    address: "",
    date: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Please log in to view your pickup requests.");
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

      const wasteRecords = Array.isArray(ewasteResult.data)
        ? ewasteResult.data
        : [];

      const pickupRecords = Array.isArray(pickupsResult.data)
        ? pickupsResult.data
        : [];

      setEwaste(wasteRecords);
      setPickups(pickupRecords);

      // Check the URL only when a user opens a specific e-waste record.
      const ewasteId = searchParams.get("ewaste");

      if (ewasteId) {
        const item = wasteRecords.find(
          (waste) => waste._id === ewasteId
        );

        if (item && item.status === "REGISTERED") {
          setSelectedEWaste(item);
          setError("");
        } else {
          setSelectedEWaste(null);

          // Do not show a stale error after successful submission.
          setError(
            item
              ? "This e-waste already has a pickup request or is being processed."
              : "E-waste record not found."
          );

          // Remove the stale e-waste ID from the URL.
          setSearchParams({}, { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || "Unable to load pickup data.");
    } finally {
      setLoading(false);
    }
  }, [token, searchParams, setSearchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeForm = () => {
    setSelectedEWaste(null);
    setForm({ address: "", date: "", notes: "" });
    setError("");
    setSuccess("");
    setSearchParams({}, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    if (!selectedEWaste) {
      setError("Please select an e-waste record first.");
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/pickups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ewasteId: selectedEWaste._id,
          address: form.address.trim(),
          scheduledDate: form.date || null,
          notes: form.notes.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to create pickup request."
        );
      }

      // Clear the selected e-waste and stale URL before refreshing.
      setSelectedEWaste(null);
      setSearchParams({}, { replace: true });

      setForm({
        address: "",
        date: "",
        notes: "",
      });

      setError("");
      setSuccess("Pickup request created successfully!");

      // Refresh the list without reading the old URL parameter.
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
          ewasteResult.message || "Pickup created, but e-waste list could not refresh."
        );
      }

      if (!pickupsResponse.ok || !pickupsResult.success) {
        throw new Error(
          pickupsResult.message || "Pickup created, but request list could not refresh."
        );
      }

      setEwaste(
        Array.isArray(ewasteResult.data) ? ewasteResult.data : []
      );

      setPickups(
        Array.isArray(pickupsResult.data) ? pickupsResult.data : []
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "REQUESTED":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "ASSIGNED":
        return "bg-blue-50 text-blue-700 border border-blue-100";
      case "PICKED UP":
        return "bg-purple-50 text-purple-700 border border-purple-100";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const getStage = (status) => {
    switch (status) {
      case "REQUESTED":
        return "Waiting for Assignment";
      case "ASSIGNED":
        return "Collector Assigned";
      case "PICKED UP":
        return "E-Waste Collected";
      default:
        return status || "Processing";
    }
  };

  const getPickupCategory = (pickup) =>
    pickup.category || pickup.ewaste?.category || "E-Waste";

  const getPickupWeight = (pickup) =>
    pickup.actualWeight ?? pickup.weight ?? pickup.ewaste?.weight ?? 0;

  const getPickupQuantity = (pickup) =>
    pickup.quantity ?? pickup.ewaste?.quantity ?? 0;

  const getPickupId = (pickup) => pickup._id || pickup.id;

  const formatDate = (date) => {
    if (!date) return "Not scheduled";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const pendingCount = pickups.filter(
    (pickup) => pickup.status === "REQUESTED"
  ).length;

  const completedCount = pickups.filter(
    (pickup) => pickup.status === "PICKED UP"
  ).length;

  return (
    <DashboardLayout role="shop">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-sm font-medium text-green-700">
                Collection Management
              </p>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Pickup Requests
            </h1>

            <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-xl">
              Create and track e-waste collection requests from your shop.
            </p>
          </div>

          <Link
            to="/shop/e-waste"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            View My E-Waste →
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={loadData}
              className="mt-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {success && !error && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              title: "Total Requests",
              value: pickups.length,
              description: "All collection requests",
              icon: "📋",
            },
            {
              title: "Pending",
              value: pendingCount,
              description: "Waiting for collector assignment",
              icon: "⏳",
            },
            {
              title: "Completed",
              value: completedCount,
              description: "E-waste successfully collected",
              icon: "✓",
            },
          ].map((stat) => (
            <div
              key={stat.title}
              className="bg-white border border-gray-200 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {loading ? "—" : stat.value}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-lg">
                  {stat.icon}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {selectedEWaste && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-8">
            <div className="flex justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-green-700 font-semibold">
                  New Pickup Request
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                  Schedule e-waste collection
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Provide the pickup details for your registered e-waste.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="text-sm font-semibold text-gray-500 hover:text-red-600"
              >
                Cancel
              </button>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 sm:p-5 mb-6">
              <p className="text-xs font-medium text-green-700 uppercase">
                Selected E-Waste
              </p>
              <p className="font-bold text-green-900 mt-1">
                {selectedEWaste.category}
              </p>
              <p className="text-sm text-green-700 mt-1">
                {selectedEWaste.weight} kg • {selectedEWaste.quantity} units
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pickup Address
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows="3"
                  disabled={submitting}
                  placeholder="Enter the complete pickup address"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white outline-none focus:border-green-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Pickup Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  min={new Date().toLocaleDateString("en-CA")}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="3"
                  disabled={submitting}
                  placeholder="Any instructions for the collector..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white outline-none focus:border-green-500 resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
                >
                  {submitting ? "Creating Request..." : "Create Pickup Request →"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Your Pickup Requests
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Track the current status of every collection request.
              </p>
            </div>

            {pickups.length > 0 && (
              <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                {pickups.length} request{pickups.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-14 text-center text-sm text-gray-500">
              Loading pickup requests...
            </div>
          ) : pickups.length === 0 ? (
            <div className="py-14 px-4 text-center border border-dashed border-gray-200 rounded-2xl">
              <div className="text-3xl">🚚</div>
              <h3 className="text-lg font-bold text-gray-900 mt-5">
                No pickup requests yet
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Register e-waste first and create a pickup request when it is
                ready for collection.
              </p>
              <Link
                to="/shop/e-waste"
                className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
              >
                View My E-Waste →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {pickups.map((pickup) => {
                const pickupId = getPickupId(pickup);
                const status = pickup.status;

                const collectorName =
                  pickup.collector?.name ||
                  (typeof pickup.collector === "string"
                    ? pickup.collector
                    : "");

                const stageProgress =
                  status === "PICKED UP"
                    ? "w-full bg-green-500"
                    : status === "ASSIGNED"
                      ? "w-2/3 bg-blue-500"
                      : "w-1/3 bg-amber-500";

                return (
                  <div
                    key={pickupId}
                    className="border border-gray-200 rounded-2xl p-5 hover:border-green-200 transition"
                  >
                    <div className="flex flex-col xl:flex-row xl:justify-between gap-6">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                            🚚
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {getPickupCategory(pickup)}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Pickup Request
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(status)}`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                          {[
                            ["Request ID", pickupId],
                            ["Weight", `${getPickupWeight(pickup)} kg`],
                            ["Quantity", getPickupQuantity(pickup)],
                            ["Pickup Date", formatDate(pickup.scheduledDate)],
                          ].map(([label, value]) => (
                            <div key={label} className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-500">{label}</p>
                              <p className="font-semibold text-gray-900 mt-1 break-all">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4">
                          <p className="text-xs font-medium text-gray-500">
                            Pickup Address
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {pickup.address}
                          </p>
                        </div>

                        {pickup.notes && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-500">
                              Notes
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {pickup.notes}
                            </p>
                          </div>
                        )}

                        {collectorName && (
                          <div className="mt-4">
                            <p className="text-xs text-gray-500">
                              Assigned Collector
                            </p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              {collectorName}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="xl:w-52 shrink-0">
                        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                            Current Stage
                          </p>
                          <p className="text-sm font-bold text-gray-900 mt-2">
                            {getStage(status)}
                          </p>
                          <div className="mt-3 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${stageProgress}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-100">
                      <div className="grid grid-cols-3 gap-2 relative">
                        {[
                          {
                            label: "Requested",
                            done: ["REQUESTED", "ASSIGNED", "PICKED UP"].includes(status),
                          },
                          {
                            label: "Assigned",
                            done: ["ASSIGNED", "PICKED UP"].includes(status),
                          },
                          {
                            label: "Collected",
                            done: status === "PICKED UP",
                          },
                        ].map((step, index) => (
                          <div key={step.label} className="relative z-10 text-center">
                            <div
                              className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                step.done
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-200 text-gray-500"
                              }`}
                            >
                              {step.done ? "✓" : index + 1}
                            </div>
                            <p className="text-xs font-medium text-gray-500 mt-2">
                              {step.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 bg-[#17211b] rounded-2xl p-6 sm:p-8 text-white">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-green-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Pickup Journey
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mt-4">
              Track your e-waste from request to collection.
            </h2>
            <p className="text-gray-300 mt-3 leading-relaxed">
              Your request starts as Requested, moves to Assigned when a
              collector is selected, and becomes Picked Up after the physical
              handover is completed.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Pickups;