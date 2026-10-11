import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL as API_URL } from "../../config/api";

function Batches() {
  const { token } = useAuth();

  const [pickups, setPickups] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingId, setCreatingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [pickupResponse, batchResponse] = await Promise.all([
        fetch(`${API_URL}/pickups`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_URL}/batches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const pickupResult = await pickupResponse.json();
      const batchResult = await batchResponse.json();

      if (!pickupResponse.ok) {
        throw new Error(
          pickupResult.message || "Failed to load pickup requests."
        );
      }

      if (!batchResponse.ok) {
        throw new Error(
          batchResult.message || "Failed to load batches."
        );
      }

      setPickups(pickupResult.data || []);
      setBatches(batchResult.data || []);
    } catch (err) {
      setError(err.message || "Unable to load batch data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createBatch = async (pickup) => {
    if (!pickup?._id || creatingId) return;

    setCreatingId(pickup._id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/batches/from-pickup/${pickup._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create batch."
        );
      }

      setSuccess(
        `Batch ${result.data.batchId} created successfully.`
      );

      await loadData();
    } catch (err) {
      setError(err.message || "Unable to create batch.");
    } finally {
      setCreatingId("");
    }
  };

  const getBatchForPickup = (pickupId) =>
    batches.find((batch) => {
      const batchPickupId =
        typeof batch.pickup === "object"
          ? batch.pickup?._id
          : batch.pickup;

      return batchPickupId === pickupId;
    });

  const getStatusStyle = (status) => {
    switch (status) {
      case "AT COLLECTION CENTER":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "SENT TO RECYCLER":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "RECYCLING CONFIRMED":
        return "bg-green-50 text-green-700 border-green-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const pickedUpPickups = pickups.filter(
    (pickup) => pickup.status === "PICKED UP"
  );

  const totalBatchWeight = batches.reduce(
    (sum, batch) => sum + Number(batch.weight || 0),
    0
  );

  const batchesAtCenter = batches.filter(
    (batch) => batch.status === "AT COLLECTION CENTER"
  );

  const sentToRecycler = batches.filter(
    (batch) => batch.status === "SENT TO RECYCLER"
  );

  const recycledBatches = batches.filter(
    (batch) => batch.status === "RECYCLING CONFIRMED"
  );

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getCollectorName = (collector) => {
    if (!collector) return "Not available";

    if (typeof collector === "object") {
      return collector.name || "Not available";
    }

    return "Assigned collector";
  };

  const getRecyclerName = (recycler) => {
    if (!recycler) return "Not assigned";

    if (typeof recycler === "object") {
      return recycler.businessName || recycler.name || "Assigned recycler";
    }

    return "Assigned recycler";
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-sm font-medium text-green-700">
                Batch Management
              </p>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              E-Waste Batches
            </h1>

            <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-2xl">
              Convert collected e-waste into traceable digital batches
              and track their recycling journey.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "↻ Refresh Data"}
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm font-medium text-gray-500">
              Total Batches
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {batches.length}
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Traceable e-waste batches
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm font-medium text-gray-500">
              Batch Weight
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {totalBatchWeight.toLocaleString("en-IN")}
              <span className="text-base font-medium text-gray-500 ml-1">
                kg
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Total weight in batches
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm font-medium text-gray-500">
              At Collection Center
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {batchesAtCenter.length}
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Ready for recycler handover
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm font-medium text-gray-500">
              Recycling Confirmed
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {recycledBatches.length}
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Successfully processed
            </p>
          </div>
        </div>

        {/* Ready for Batch Creation */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Ready for Batch Creation
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Pickups completed by collectors and ready to enter the
                traceability system.
              </p>
            </div>

            <span className="w-fit px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold">
              {pickedUpPickups.length} collected
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">
              Loading pickup requests...
            </div>
          ) : pickedUpPickups.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-gray-200 rounded-2xl">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center text-3xl">
                📦
              </div>
              <p className="font-semibold text-gray-900 mt-5">
                No completed pickups
              </p>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                Batches can be created after a collector completes a pickup.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pickedUpPickups.map((pickup) => {
                const existingBatch = getBatchForPickup(pickup._id);
                const isCreating = creatingId === pickup._id;

                return (
                  <div
                    key={pickup._id}
                    className="border border-gray-200 rounded-2xl p-5 hover:border-green-200 hover:shadow-sm transition"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-lg">
                            📦
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {pickup.category}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Collected pickup
                            </p>
                          </div>

                          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                            PICKED UP
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500">
                              Request ID
                            </p>
                            <p className="font-semibold text-gray-900 mt-1 break-all text-sm">
                              {pickup._id}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500">
                              Actual Weight
                            </p>
                            <p className="font-semibold text-gray-900 mt-1">
                              {pickup.actualWeight || pickup.weight} kg
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500">
                              Collector
                            </p>
                            <p className="font-semibold text-gray-900 mt-1">
                              {getCollectorName(pickup.collector)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full xl:w-auto shrink-0">
                        {existingBatch ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs font-semibold">
                              ✓ Batch Created
                            </div>

                            <Link
                              to={`/passport/${existingBatch.batchId}`}
                              className="w-full xl:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                            >
                              View Digital Passport →
                            </Link>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => createBatch(pickup)}
                            disabled={Boolean(creatingId)}
                            className="w-full xl:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                          >
                            {isCreating
                              ? "Creating Batch..."
                              : "+ Create Batch"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-100">
                      <div className="grid grid-cols-3 gap-2 relative">
                        <div className="absolute top-4 left-[16%] right-[16%] h-0.5 bg-gray-200" />

                        <div className="relative z-10 text-center">
                          <div className="mx-auto w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                            ✓
                          </div>
                          <p className="text-xs font-medium text-gray-500 mt-2">
                            Collected
                          </p>
                        </div>

                        <div className="relative z-10 text-center">
                          <div
                            className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              existingBatch
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {existingBatch ? "✓" : "2"}
                          </div>
                          <p className="text-xs font-medium text-gray-500 mt-2">
                            Batch Created
                          </p>
                        </div>

                        <div className="relative z-10 text-center">
                          <div
                            className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              existingBatch
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {existingBatch ? "✓" : "3"}
                          </div>
                          <p className="text-xs font-medium text-gray-500 mt-2">
                            Digital Passport
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Created Batches */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Created Batches
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Track every batch created from collected e-waste.
              </p>
            </div>

            <span className="w-fit px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-semibold">
              {batches.length} total
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">
              Loading batches...
            </div>
          ) : batches.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-gray-200 rounded-2xl">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center text-3xl">
                🏷️
              </div>
              <p className="font-semibold text-gray-900 mt-5">
                No batches created yet
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Completed pickups will appear above for batch creation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...batches].map((batch) => (
                <div
                  key={batch._id}
                  className="border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-lg">
                          🏷️
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {batch.batchId}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Digital E-Waste Batch
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusStyle(
                            batch.status
                          )}`}
                        >
                          {batch.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500">Category</p>
                          <p className="font-semibold text-gray-900 mt-1">
                            {batch.category}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500">Weight</p>
                          <p className="font-semibold text-gray-900 mt-1">
                            {batch.weight} kg
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500">Collector</p>
                          <p className="font-semibold text-gray-900 mt-1">
                            {getCollectorName(batch.collector)}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500">Recycler</p>
                          <p className="font-semibold text-gray-900 mt-1">
                            {getRecyclerName(batch.recycler)}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 mt-4">
                        Created: {formatDate(batch.createdAt)}
                      </p>
                    </div>

                    <Link
                      to={`/passport/${batch.batchId}`}
                      className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition"
                    >
                      View Passport →
                    </Link>
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2 relative">
                      <div className="absolute top-4 left-[16%] right-[16%] h-0.5 bg-gray-200" />

                      {[
                        {
                          title: "Collection Center",
                          complete: [
                            "AT COLLECTION CENTER",
                            "SENT TO RECYCLER",
                            "RECYCLING CONFIRMED",
                          ].includes(batch.status),
                        },
                        {
                          title: "Recycler",
                          complete: [
                            "SENT TO RECYCLER",
                            "RECYCLING CONFIRMED",
                          ].includes(batch.status),
                        },
                        {
                          title: "Recycled",
                          complete:
                            batch.status === "RECYCLING CONFIRMED",
                        },
                      ].map((step, index) => (
                        <div
                          key={step.title}
                          className="relative z-10 text-center"
                        >
                          <div
                            className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              step.complete
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {step.complete ? "✓" : index + 1}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {step.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-[#17211b] rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-green-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Digital E-Waste Passport
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mt-4">
              Every batch gets a unique identity.
            </h2>

            <p className="text-gray-300 mt-3 leading-relaxed">
              Each batch receives a unique ID in the database and can be
              tracked through its recycling journey using the Digital
              E-Waste Passport.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-5">
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs text-gray-200">
                Unique Batch ID
              </span>
              <span className="text-gray-500">→</span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs text-gray-200">
                QR Passport
              </span>
              <span className="text-gray-500">→</span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs text-gray-200">
                Full Journey
              </span>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-20 w-56 h-56 rounded-full bg-green-600/10" />
          <div className="absolute right-24 -top-20 w-40 h-40 rounded-full bg-green-400/5" />
        </div>

        {/* Additional batch statuses */}
        <div className="mt-6 text-sm text-gray-500">
          {sentToRecycler.length} batch(es) sent to recycler.
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Batches;