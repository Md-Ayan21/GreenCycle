
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const roles = [
  {
    id: "shop",
    label: "Shop",
    description: "Register and track e-waste",
    icon: "🏪",
  },
  {
    id: "collector",
    label: "Collector",
    description: "Manage assigned pickups",
    icon: "🚚",
  },
  {
    id: "admin",
    label: "Admin",
    description: "Manage the entire lifecycle",
    icon: "⚙",
  },
  {
    id: "recycler",
    label: "Recycler",
    description: "Process and confirm recycling",
    icon: "♻",
  },
];

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState("shop");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dashboardRoutes = {
    shop: "/shop/dashboard",
    collector: "/collector/dashboard",
    admin: "/admin/dashboard",
    recycler: "/recycler/dashboard",
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await login(email.trim(), password);

      if (user.role !== selectedRole) {
        setError(
          `This account belongs to the ${user.role} role. Please select the correct role.`
        );
        return;
      }

      navigate(dashboardRoutes[user.role] || "/");
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-green-700 transition-colors"
          >
            <span className="text-lg">←</span>
            Back to home
          </button>
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-center">
          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center text-xl font-bold shadow-sm">
                G
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#17211b]">
                  GreenCycle
                </h1>
                <p className="text-xs text-gray-500">
                  B2B E-Waste Traceability
                </p>
              </div>
            </div>

            <div className="max-w-md">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-green-600">
                Know where your e-waste goes.
              </p>
              <h2 className="mt-4 text-4xl xl:text-5xl font-bold tracking-tight text-[#17211b] leading-[1.08]">
                One platform.
                <br />
                <span className="text-green-600">
                  Complete traceability.
                </span>
              </h2>
              <p className="mt-6 text-base text-gray-500 leading-7">
                Track e-waste from the moment it leaves a shop until it
                reaches an authorized recycler.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Verified pickup handovers",
                  "Batch-level tracking",
                  "Digital E-Waste Passport",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full max-w-xl mx-auto">
            <div className="lg:hidden text-center mb-7">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center text-xl font-bold shadow-sm">
                G
              </div>
              <h1 className="mt-4 text-2xl font-bold text-[#17211b]">
                Welcome to GreenCycle
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Sign in to continue
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-8 shadow-sm">
              <div className="hidden lg:block mb-7">
                <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                  Secure access
                </p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  Sign in to GreenCycle
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Choose your role and access your workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Continue as
                    </label>
                    <span className="text-xs text-gray-400">Select one</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {roles.map((role) => {
                      const isSelected = selectedRole === role.id;

                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRole(role.id)}
                          className={`relative text-left p-4 rounded-2xl border transition-all duration-200 ${
                            isSelected
                              ? "border-green-600 bg-green-50 ring-2 ring-green-600/10 shadow-sm"
                              : "border-gray-200 bg-white hover:border-green-200 hover:bg-gray-50"
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          )}

                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg ${
                                isSelected ? "bg-white" : "bg-gray-50"
                              }`}
                            >
                              {role.icon}
                            </div>

                            <div className="min-w-0 pr-4">
                              <p
                                className={`font-semibold text-sm ${
                                  isSelected ? "text-green-800" : "text-gray-900"
                                }`}
                              >
                                {role.label}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 leading-5">
                                {role.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-7 py-3.5 rounded-xl bg-green-600 text-white font-semibold text-sm shadow-sm hover:bg-green-700 hover:shadow-md transition-all duration-200 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-green-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Signing in..."
                    : `Sign In as ${
                        roles.find((role) => role.id === selectedRole)?.label
                      }`}
                </button>
              </form>

              <div className="mt-6 rounded-2xl bg-[#f7faf8] border border-green-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-sm">
                    ℹ
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Backend authentication
                    </p>
                    <p className="mt-1 text-xs text-gray-500 leading-5">
                      Sign in with an account registered in GreenCycle.
                      Your assigned role determines which dashboard you enter.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center mt-6 text-xs sm:text-sm text-gray-400">
              GreenCycle · B2B E-Waste Traceability
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
