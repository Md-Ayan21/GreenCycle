
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { API_BASE_URL as API_BASE } from "../../config/api";

function DigitalPassport() {
  const { batchId } = useParams();

  const [passport, setPassport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPassport = useCallback(async () => {
    if (!batchId) {
      setError("Batch ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_BASE}/passport/${encodeURIComponent(batchId)}`
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Digital passport not found");
      }

      setPassport(result.data?.passport || null);
      setHistory(result.data?.history || []);
    } catch (err) {
      setError(err.message || "Could not load the digital passport.");
      setPassport(null);
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    setLoading(true);
    loadPassport();

    const interval = setInterval(loadPassport, 10000);

    return () => clearInterval(interval);
  }, [loadPassport]);

  const statusInfo = useMemo(() => {
    const status = passport?.status;

    if (status === "RECYCLING CONFIRMED") {
      return {
        label: "Recycling Confirmed",
        badge: "bg-green-50 text-green-700 border-green-200",
        dot: "bg-green-600",
      };
    }

    if (status === "SENT TO RECYCLER") {
      return {
        label: "At Recycler",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-600",
      };
    }

    if (status === "AT COLLECTION CENTER") {
      return {
        label: "At Collection Center",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
      };
    }

    return {
      label: status || "Unknown",
      badge: "bg-gray-100 text-gray-600 border-gray-200",
      dot: "bg-gray-400",
    };
  }, [passport?.status]);

  if (loading && !passport) {
    return (
      <DashboardLayout role="admin">
        <div className="p-8 text-center text-gray-500">
          Loading digital passport from database...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !passport) {
    return (
      <DashboardLayout role="admin">
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 text-center max-w-md shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-3xl">
              🔍
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-5">
              Passport Not Found
            </h1>
            <p className="text-gray-500 mt-2 leading-relaxed">
              {error || "We could not find a digital passport for this batch."}
            </p>
            <button
              onClick={loadPassport}
              className="mt-5 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
            >
              Try Again
            </button>
            <Link
              to="/admin/batches"
              className="block mt-4 text-sm text-green-700 font-semibold"
            >
              Back to Batches
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isAtCollectionCenter = [
    "AT COLLECTION CENTER",
    "SENT TO RECYCLER",
    "RECYCLING CONFIRMED",
  ].includes(passport.status);

  const isSentToRecycler = [
    "SENT TO RECYCLER",
    "RECYCLING CONFIRMED",
  ].includes(passport.status);

  const isRecyclingConfirmed =
    passport.status === "RECYCLING CONFIRMED";

  // Local URL works on this computer only.
  // After deployment, this automatically uses the deployed domain.
  const qrValue = `${window.location.origin}/passport/${encodeURIComponent(
    passport.batchId
  )}`;

  const shopName =
    typeof passport.shop === "object"
      ? passport.shop?.name || passport.source || "Registered shop"
      : passport.source || "Registered shop";

  const collectorName =
    typeof passport.collector === "object"
      ? passport.collector?.name || "Not available"
      : passport.collector || "Not available";

  const recyclerName =
    typeof passport.recycler === "object"
      ? passport.recycler?.name || "Authorized recycler"
      : passport.recycler || "Not assigned";

  const timeline = [
    {
      title: "E-Waste Registered",
      description: "E-waste was registered by the source shop.",
      completed: true,
      icon: "♻",
    },
    {
      title: "Pickup Requested",
      description: "A collection request was created for the e-waste.",
      completed: true,
      icon: "↗",
    },
    {
      title: "Pickup Completed",
      description: "The collector completed the physical handover.",
      completed: true,
      icon: "✓",
    },
    {
      title: "At Collection Center",
      description: "The e-waste was converted into a traceable batch.",
      completed: isAtCollectionCenter,
      icon: "📦",
    },
    {
      title: "Sent to Recycler",
      description: "The batch was accepted by the authorized recycler.",
      completed: isSentToRecycler,
      icon: "🚚",
    },
    {
      title: "Recycling Confirmed",
      description: "The recycler confirmed the final recycling process.",
      completed: isRecyclingConfirmed,
      icon: "✓",
    },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-7">
          <Link
            to="/admin/batches"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 mb-5 transition"
          >
            <span>←</span> Back to Batches
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-600" />
                <p className="text-sm text-green-700 font-semibold uppercase tracking-wider">
                  Digital E-Waste Passport
                </p>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                {passport.batchId}
              </h1>
              <p className="text-gray-500 mt-2 max-w-2xl">
                A traceable digital record of this e-waste batch from
                collection to final recycling.
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-2 w-fit px-4 py-2.5 rounded-full border text-sm font-bold ${statusInfo.badge}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-[#17211b] text-white rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center shadow-sm">
            <div className="text-center">
              <p className="text-green-400 text-xs font-bold uppercase tracking-[0.18em]">
                Scan to Verify
              </p>
              <h2 className="text-xl font-bold mt-2">Digital Passport</h2>
            </div>

            <div className="bg-white rounded-2xl p-4 mt-6 shadow-lg">
              <QRCodeSVG
                value={qrValue}
                size={190}
                bgColor="#ffffff"
                fgColor="#17211b"
                level="H"
              />
            </div>

            <p className="text-gray-300 text-sm text-center mt-5 max-w-xs leading-relaxed">
              Scan this QR code to open the digital passport for this batch.
            </p>
            <div className="mt-4 px-4 py-2 rounded-xl bg-white/10 border border-white/10">
              <p className="text-white font-bold text-sm">{passport.batchId}</p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-xl ${
                  isRecyclingConfirmed
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {isRecyclingConfirmed ? "✓" : "●"}
              </div>

              <div>
                <p className="text-sm text-gray-500">Verification Status</p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                  {isRecyclingConfirmed
                    ? "Recycling Verified"
                    : "Digital Record Active"}
                </h2>
                <p className="text-sm text-gray-500 mt-2 max-w-xl leading-relaxed">
                  {isRecyclingConfirmed
                    ? "This batch has completed the GreenCycle recycling journey."
                    : "This batch has an active digital record and can be tracked through its recycling journey."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-6 mt-8 pt-6 border-t border-gray-100">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                  Category
                </p>
                <p className="font-semibold text-gray-900 mt-1.5">
                  {passport.category}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                  Weight
                </p>
                <p className="font-semibold text-gray-900 mt-1.5">
                  {passport.weight} kg
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                  Quantity
                </p>
                <p className="font-semibold text-gray-900 mt-1.5">
                  {passport.quantity}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                  Source
                </p>
                <p className="font-semibold text-gray-900 mt-1.5">{shopName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                  Collector
                </p>
                <p className="font-semibold text-gray-900 mt-1.5">
                  {collectorName}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                  Recycler
                </p>
                <p className="font-semibold text-gray-900 mt-1.5">
                  {recyclerName}
                </p>
              </div>
            </div>

            {passport.certificateUrl && (
              <a
                href={passport.certificateUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex mt-6 text-sm font-semibold text-green-700 hover:text-green-800"
              >
                View recycling certificate ↗
              </a>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-600" />
              <p className="text-sm text-green-600 font-semibold uppercase tracking-wider">
                Traceability
              </p>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              Complete E-Waste Journey
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Follow this batch from registration to final recycling.
            </p>
          </div>

          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute left-[8%] right-[8%] top-6 h-1 bg-gray-200 rounded-full" />
              <div
                className="absolute left-[8%] top-6 h-1 bg-green-600 rounded-full transition-all duration-500"
                style={{
                  width: isRecyclingConfirmed
                    ? "84%"
                    : isSentToRecycler
                      ? "67%"
                      : isAtCollectionCenter
                        ? "50%"
                        : "32%",
                }}
              />
              <div className="relative grid grid-cols-6 gap-3">
                {timeline.map((event, index) => (
                  <div
                    key={event.title}
                    className="flex flex-col items-center text-center"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm text-sm font-bold ${
                        event.completed
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {event.completed ? "✓" : index + 1}
                    </div>
                    <h3
                      className={`text-sm font-bold mt-4 ${
                        event.completed ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {event.title}
                    </h3>
                    <p
                      className={`text-xs mt-1 leading-relaxed max-w-[150px] ${
                        event.completed ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {event.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:hidden relative">
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {timeline.map((event, index) => (
                <div key={event.title} className="relative flex gap-4">
                  <div
                    className={`relative z-10 w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-4 border-white shadow-sm text-xs font-bold ${
                      event.completed
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {event.completed ? "✓" : index + 1}
                  </div>
                  <div className="pt-1">
                    <h3
                      className={`font-bold ${
                        event.completed ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {event.title}
                    </h3>
                    <p
                      className={`text-sm mt-1 leading-relaxed ${
                        event.completed ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Recorded Event History
            </h3>

            {history.length === 0 ? (
              <p className="text-sm text-gray-500">
                No detailed event history is available for this batch yet.
              </p>
            ) : (
              <div className="space-y-4">
                {history.map((event, index) => (
                  <div
                    key={`${event.status}-${event.occurredAt || index}-${index}`}
                    className="flex gap-3 border-l-2 border-green-200 pl-4 py-1"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">
                        {event.message || event.status}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {event.status}
                        {event.actorRole ? ` • ${event.actorRole}` : ""}
                        {event.occurredAt
                          ? ` • ${new Date(event.occurredAt).toLocaleString()}`
                          : ""}
                      </p>
                      {event.weight != null && (
                        <p className="text-xs text-gray-500 mt-1">
                          Recorded weight: {event.weight} kg
                        </p>
                      )}
                      {event.proofUrl && (
                        <a
                          href={event.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-green-700 font-semibold mt-1 inline-block"
                        >
                          View proof ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">
              🏪
            </div>
            <p className="text-sm text-gray-500 mt-4">Source Shop</p>
            <p className="font-bold text-gray-900 mt-1">{shopName}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
              📦
            </div>
            <p className="text-sm text-gray-500 mt-4">Collection Center</p>
            <p className="font-bold text-gray-900 mt-1">
              GreenCycle Collection Center
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg">
              ♻️
            </div>
            <p className="text-sm text-gray-500 mt-4">Recycler</p>
            <p className="font-bold text-gray-900 mt-1">{recyclerName}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-lg">
              ✓
            </div>
            <p className="text-sm text-gray-500 mt-4">Current Status</p>
            <p className="font-bold text-green-700 mt-1">{passport.status}</p>
          </div>
        </div>

        <div className="mt-8 bg-green-50 border border-green-100 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
            ✓
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              GreenCycle Digital E-Waste Passport
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Batch ID: {passport.batchId} • This record updates as the
              recycling journey progresses.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DigitalPassport;
