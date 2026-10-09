import { useNavigate } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Register",
    description:
      "A shop registers its old or discarded electronic equipment.",
    icon: "♻",
  },
  {
    number: "02",
    title: "Verify",
    description:
      "A collector picks it up and verifies the actual weight.",
    icon: "✓",
  },
  {
    number: "03",
    title: "Create Batch",
    description:
      "The e-waste is grouped into a traceable batch with a unique ID.",
    icon: "📦",
  },
  {
    number: "04",
    title: "Recycle",
    description:
      "The authorized recycler confirms the final recycling.",
    icon: "↗",
  },
];

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#17211b]">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              G
            </div>

            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight">
                GreenCycle
              </span>

              <p className="hidden sm:block text-[10px] text-gray-400 -mt-0.5">
                E-Waste Traceability
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="px-3 sm:px-4 py-2 text-sm font-semibold text-gray-600 hover:text-green-700 transition"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 shadow-sm hover:shadow-md transition-all"
            >
              Get Started
            </button>
          </div>

        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">

          <div className="max-w-4xl">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-green-100 border border-green-200 text-green-700 text-xs sm:text-sm font-semibold mb-7">
              <span className="w-2 h-2 rounded-full bg-green-600" />
              B2B E-Waste Traceability
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Know where your
              <span className="text-green-600"> e-waste </span>
              goes.
            </h1>

            <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
              Track every e-waste batch from electronics shops to verified
              recycling with a digital trail you can trust.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-6 py-3.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 shadow-sm hover:shadow-md transition-all"
              >
                Register Your Shop
                <span className="ml-2">→</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-6 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Become a Recycler
              </button>

            </div>

            {/* Trust points */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                Batch-level tracking
              </span>

              <span className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                Verified handovers
              </span>

              <span className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                Digital passport
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="bg-[#17211b] text-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">

          <div className="max-w-2xl mb-12">
            <p className="text-green-400 text-sm font-semibold uppercase tracking-wider">
              How It Works
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold mt-3">
              One batch. One traceable journey.
            </h2>

            <p className="mt-4 text-gray-300 leading-relaxed">
              Every important handover becomes part of the digital record.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">

            {steps.map((step) => (
              <div
                key={step.number}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-green-500/30 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-green-400 text-sm font-bold">
                    {step.number}
                  </span>

                  <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-base">
                    {step.icon}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* Digital Passport */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Text */}
          <div>
            <p className="text-green-600 text-sm font-semibold uppercase tracking-wider">
              Digital E-Waste Passport
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold leading-tight mt-3">
              Every batch gets a digital identity.
            </h2>

            <p className="mt-5 text-gray-600 leading-relaxed max-w-xl">
              A unique batch ID and QR code connect the complete journey
              of the e-waste — from its source to final recycling.
            </p>

            <div className="mt-7 space-y-3">

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold">
                  1
                </span>
                Unique batch identification
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold">
                  2
                </span>
                Verified handover history
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold">
                  3
                </span>
                Final recycling confirmation
              </div>

            </div>
          </div>

          {/* Passport Card */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-5 sm:p-7">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Batch ID
                </p>

                <h3 className="text-2xl font-bold mt-1">
                  EW-2026-00001
                </h3>
              </div>

              <div className="w-16 h-16 rounded-xl bg-[#17211b] text-white flex items-center justify-center text-xs font-bold">
                QR
              </div>

            </div>

            <div className="mt-7 space-y-1">

              {[
                "Registered by ABC Electronics",
                "Pickup verified — 18.7 KG",
                "Batch created",
                "Received by authorized recycler",
                "Recycling confirmed",
              ].map((item, index) => (
                <div
                  key={item}
                  className="relative flex items-start gap-4 py-3"
                >

                  {/* Connecting line */}
                  {index < 4 && (
                    <span className="absolute left-3.5 top-10 w-px h-7 bg-green-100" />
                  )}

                  <div className="relative z-10 w-7 h-7 shrink-0 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {item}
                    </p>

                    {index < 4 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Verified event
                      </p>
                    )}
                  </div>

                </div>
              ))}

            </div>

            <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Digital Passport
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                Verified journey
              </span>
            </div>

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="bg-green-700 text-white">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-green-100 text-xs font-semibold mb-5">
            ♻ Responsible e-waste management
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold">
            Make every e-waste handover accountable.
          </h2>

          <p className="mt-5 text-green-100 text-base sm:text-lg max-w-2xl mx-auto">
            Register, verify, track and prove where e-waste goes.
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-8 px-6 py-3.5 rounded-xl bg-white text-green-700 font-semibold hover:bg-green-50 shadow-sm transition-all"
          >
            Start with GreenCycle
            <span className="ml-2">→</span>
          </button>

        </div>

      </section>

      {/* Footer */}
      <footer className="bg-[#17211b] text-gray-400">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">

          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-green-600 text-white flex items-center justify-center font-bold text-xs">
              G
            </span>

            <span>
              © 2026 GreenCycle
            </span>
          </div>

          <p>
            B2B E-Waste Traceability
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Landing;