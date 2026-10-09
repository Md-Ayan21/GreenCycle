import { useNavigate } from "react-router-dom";

function Navbar({ role = "shop" }) {
  const navigate = useNavigate();

  const roleNames = {
    shop: "Shop",
    collector: "Collector",
    admin: "Administrator",
    recycler: "Recycler",
  };

  const roleName = roleNames[role] || "User";

  const handleLogout = () => {
    localStorage.removeItem("greencycle_user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="h-16 shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between">

      {/* Left Section */}
      <div className="min-w-0">
        <p className="text-[11px] sm:text-xs text-gray-400 font-medium uppercase tracking-wide">
          Welcome back
        </p>

        <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate mt-0.5">
          {roleName}
        </h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* User Information */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-gray-900">
            Demo User
          </p>

          <p className="text-xs text-gray-500 mt-0.5">
            {roleName}
          </p>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center justify-center font-bold text-sm sm:text-base">
          {roleName.charAt(0)}
        </div>

        {/* Desktop Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="hidden sm:inline-flex items-center gap-2 justify-center px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 active:scale-[0.98]"
        >
          <span className="text-base leading-none">
            ↪
          </span>

          <span>
            Logout
          </span>
        </button>

        {/* Mobile Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="sm:hidden w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 active:scale-[0.97]"
          aria-label="Logout"
          title="Logout"
        >
          <span className="text-base leading-none">
            ↪
          </span>
        </button>

      </div>
    </header>
  );
}

export default Navbar;