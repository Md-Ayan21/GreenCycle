
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "http://localhost:5000/api";

function Dashboard() {
  const { token } = useAuth();

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBatches = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/batches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Failed to load batches");
      }

      const data = Array.isArray(result.data) ? result.data : [];
      setBatches(data);
    } catch (err) {
      setError(err.message || "Could not load batches from the server.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const collectionCenterBatches = useMemo(
    () => batches.filter((batch) => batch.status === "AT COLLECTION CENTER"),
    [batches]
  );

  const sentBatches = useMemo(
    () => batches.filter((batch) => batch.status === "SENT TO RECYCLER"),
    [batches]
  );

  const recycledBatches = useMemo(
    () => batches.filter((batch) => batch.status === "RECYCLING CONFIRMED"),
    [batches]
  );

  const totalWeight = useMemo(
    () => batches.reduce((sum, batch) => sum + Number(batch.weight || 0), 0),
    [batches]
  );

  const processingWeight = useMemo(
    () => sentBatches.reduce((sum, batch) => sum + Number(batch.weight || 0), 0),
    [sentBatches]
  );

  const recycledWeight = useMemo(
    () => recycledBatches.reduce((sum, batch) => sum + Number(batch.weight || 0), 0),
    [recycledBatches]
  );

  const updateBatchStatus = async (batch, action) => {
    const id = batch._id;
    if (!id || !token) return;

    setActionId(id);
    setError("");
    setSuccess("");

    const endpoint =
      action === "accept"
        ? `${API_BASE}/recycler/${id}/accept`
        : `${API_BASE}/recycler/${id}/confirm`;

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Batch update failed");
      }

      setSuccess(
        result.message ||
          (action === "accept"
            ? "Batch accepted successfully."
            : "Recycling confirmed successfully.")
      );

      await loadBatches();
    } catch (err) {
      setError(err.message || "Could not update this batch.");
    } finally {
      setActionId("");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "AT COLLECTION CENTER":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "SENT TO RECYCLER":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "RECYCLING CONFIRMED":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getBatchLabel = (batch) => batch.batchId || batch._id;

  const getCollectorName = (batch) =>
    typeof batch.collector === "object"
      ? batch.collector?.name || "Not available"
      : batch.collector || "Not available";

  return (
    <DashboardLayout role="recycler">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-600" />
                <p className="text-sm font-semibold text-green-700">
                  Recycler Dashboard
                </p>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Manage recycling batches
              </h1>

              <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-2xl">
                Accept incoming e-waste, process materials and confirm
                responsible recycling.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-500">Authorized recycler</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                GreenCycle Authorized Recycler
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[
            {
              title: "Total Batches",
              value: batches.length,
              note: "Batches visible to this account",
              icon: "📦",
              style: "bg-gray-100",
            },
            {
              title: "Total Weight",
              value: totalWeight,
              note: "Material received",
              icon: "⚖️",
              style: "bg-blue-50",
              kg: true,
            },
            {
              title: "Awaiting Acceptance",
              value: collectionCenterBatches.length,
              note: "Requires action",
              icon: "⏳",
              style: "bg-amber-50",
            },
            {
              title: "Recycled",
              value: recycledBatches.length,
              note: `${recycledWeight} kg processed`,
              icon: "♻️",
              style: "bg-green-50",
            },
          ].map((stat) => (
            <div
              key={stat.title}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                    {stat.kg && (
                      <span className="text-base font-medium text-gray-500 ml-1">
                        kg
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">{stat.note}</p>
                </div>
                <div
                  className={`w-11 h-11 rounded-xl ${stat.style} flex items-center justify-center text-xl`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-500">
            Loading batches from database...
          </div>
        ) : (
          <>
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
              <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">
                        Batches Awaiting Acceptance
                      </h2>
                      {collectionCenterBatches.length > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                          {collectionCenterBatches.length}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      E-waste batches currently at the collection center.
                    </p>
                  </div>
                  <div className="text-xs font-medium text-gray-500">
                    Step 1 of 2
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {collectionCenterBatches.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-gray-200 rounded-xl">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
                      📦
                    </div>
                    <p className="font-semibold text-gray-900 mt-4">
                      No batches awaiting acceptance
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      New batches will appear here when they are ready.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {collectionCenterBatches.map((batch) => (
                      <div
                        key={batch._id}
                        className="border border-gray-200 rounded-2xl p-5 hover:border-green-200 hover:shadow-sm transition"
                      >
                        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-gray-900">
                                {getBatchLabel(batch)}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusStyle(batch.status)}`}
                              >
                                {batch.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-gray-400">Category</p>
                                <p className="text-sm font-semibold text-gray-800 mt-1">
                                  {batch.category}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Weight</p>
                                <p className="text-sm font-semibold text-gray-800 mt-1">
                                  {batch.weight} kg
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Quantity</p>
                                <p className="text-sm font-semibold text-gray-800 mt-1">
                                  {batch.quantity}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Collector</p>
                                <p className="text-sm font-semibold text-gray-800 mt-1 truncate">
                                  {getCollectorName(batch)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row xl:flex-col gap-2 shrink-0">
                            <Link
                              to={`/passport/${getBatchLabel(batch)}`}
                              className="px-5 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold text-center hover:bg-gray-50 transition"
                            >
                              View Passport
                            </Link>
                            <button
                              disabled={actionId === batch._id}
                              onClick={() => updateBatchStatus(batch, "accept")}
                              className="px-5 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition shadow-sm disabled:opacity-60"
                            >
                              {actionId === batch._id ? "Accepting..." : "Accept Batch"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
              <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Processing</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Accepted batches ready for recycling confirmation.
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    {processingWeight} kg in process
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {sentBatches.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-gray-200 rounded-xl">
                    <div className="text-3xl mb-3">♻️</div>
                    <p className="font-semibold text-gray-900">
                      No batches currently in processing
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Accepted batches will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sentBatches.map((batch) => (
                      <div
                        key={batch._id}
                        className="p-4 sm:p-5 rounded-xl bg-blue-50/50 border border-blue-100"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-gray-900">
                                {getBatchLabel(batch)}
                              </p>
                              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                IN PROCESS
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              {batch.category} • {batch.weight} kg •{" "}
                              {batch.quantity} units
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <Link
                              to={`/passport/${getBatchLabel(batch)}`}
                              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold text-center hover:bg-gray-50 transition"
                            >
                              View Passport
                            </Link>
                            <button
                              disabled={actionId === batch._id}
                              onClick={() => updateBatchStatus(batch, "confirm")}
                              className="px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition disabled:opacity-60"
                            >
                              {actionId === batch._id
                                ? "Confirming..."
                                : "Confirm Recycling"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      Recycling Completed
                    </h2>
                    {recycledBatches.length > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                        {recycledBatches.length}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Batches whose recycling has been confirmed.
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {recycledBatches.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-gray-200 rounded-xl">
                    <div className="text-3xl mb-3">✓</div>
                    <p className="font-semibold text-gray-900">
                      No recycling confirmations yet
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Completed batches will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recycledBatches.map((batch) => (
                      <div
                        key={batch._id}
                        className="p-4 sm:p-5 rounded-xl bg-green-50 border border-green-100"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-gray-900">
                                {getBatchLabel(batch)}
                              </p>
                              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 text-xs font-semibold">
                                RECYCLING CONFIRMED
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-gray-500">
                              <span>{batch.category}</span>
                              <span>{batch.weight} kg</span>
                              {batch.recycledAt && (
                                <span>
                                  Completed{" "}
                                  {new Date(batch.recycledAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <Link
                            to={`/passport/${getBatchLabel(batch)}`}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold text-center hover:bg-gray-50 transition"
                          >
                            View Passport
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        <div className="mt-6 bg-[#17211b] rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-green-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
              Recycler Responsibility
            </p>
            <h2 className="text-xl sm:text-2xl font-bold mt-2">
              Confirm the final destination of e-waste.
            </h2>
            <p className="text-sm sm:text-base text-gray-300 mt-3 max-w-3xl leading-relaxed">
              Accept incoming batches, process the material and confirm
              recycling. This final confirmation completes the Digital
              E-Waste Passport journey.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6 text-xs sm:text-sm">
              <span className="px-3 py-2 rounded-lg bg-white/10">1. Accept</span>
              <span className="text-gray-500">→</span>
              <span className="px-3 py-2 rounded-lg bg-white/10">2. Process</span>
              <span className="text-gray-500">→</span>
              <span className="px-3 py-2 rounded-lg bg-green-600">
                3. Confirm Recycled
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
