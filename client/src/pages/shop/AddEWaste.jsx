import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const API_BASE_URL = "http://localhost:5000/api";

function AddEWaste() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    weight: "",
    quantity: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ewaste`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: formData.category,
          description: formData.description.trim(),
          weight: Number(formData.weight),
          quantity: Number(formData.quantity),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to register e-waste.");
      }

      alert("E-Waste registered successfully!");
      navigate("/shop/e-waste");
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold text-[#17211b]">
            Register E-Waste
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Add e-waste that needs to be collected and tracked.
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900">
              E-Waste Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter the basic information about the electronic waste.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Waste Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Select category</option>
                <option value="Computers & Laptops">
                  Computers & Laptops
                </option>
                <option value="Mobile Phones">Mobile Phones</option>
                <option value="Printers">Printers</option>
                <option value="Televisions">Televisions</option>
                <option value="Cables & Accessories">
                  Cables & Accessories
                </option>
                <option value="Other Electronics">Other Electronics</option>
              </select>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Example: 5 old laptops, 2 CPUs and damaged computer parts"
                rows="4"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none resize-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Weight + Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Weight
                </label>

                <div className="relative">
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="20"
                    min="0.1"
                    step="0.1"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 pr-14 rounded-xl border border-gray-300 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    kg
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>

                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="5"
                  min="1"
                  step="1"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            {/* Information */}
            <div className="mt-8 rounded-2xl border border-green-100 bg-green-50 p-5">
              <h3 className="font-semibold text-green-800">
                What happens after registration?
              </h3>

              <div className="mt-4 space-y-3">
                <div className="flex gap-3">
                  <span className="text-green-600 font-bold">01</span>
                  <p className="text-sm text-green-700">
                    Your e-waste record will be created.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-600 font-bold">02</span>
                  <p className="text-sm text-green-700">
                    You can request a pickup for this e-waste.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-600 font-bold">03</span>
                  <p className="text-sm text-green-700">
                    The verified journey will later become part of the
                    digital e-waste passport.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Registering..." : "Register E-Waste"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddEWaste;