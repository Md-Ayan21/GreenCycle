import { NavLink } from "react-router-dom";

function Sidebar({ role = "shop" }) {
  const menuByRole = {
    shop: [
      {
        label: "Dashboard",
        path: "/shop/dashboard",
        icon: "⌂",
      },
      {
        label: "My E-Waste",
        path: "/shop/e-waste",
        icon: "♻",
      },
      {
        label: "Pickup Requests",
        path: "/shop/pickups",
        icon: "🚚",
      },
    ],

    collector: [
      {
        label: "Dashboard",
        path: "/collector/dashboard",
        icon: "⌂",
      },
    ],

    admin: [
      {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: "⌂",
      },
      {
        label: "Pickup Management",
        path: "/admin/pickups",
        icon: "🚚",
      },
      {
        label: "E-Waste Batches",
        path: "/admin/batches",
        icon: "📦",
      },
    ],

    recycler: [
      {
        label: "Dashboard",
        path: "/recycler/dashboard",
        icon: "⌂",
      },
    ],
  };

  const menuItems = menuByRole[role] || [];

  const roleNames = {
    shop: "Shop",
    collector: "Collector",
    admin: "Administrator",
    recycler: "Recycler",
  };

  const roleName = roleNames[role] || "User";

  return (
    <aside className="hidden md:flex w-64 h-screen shrink-0 bg-[#17211b] text-white flex-col">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          
          <div className="w-11 h-11 rounded-2xl bg-green-600 flex items-center justify-center font-bold text-lg shadow-sm">
            G
          </div>

          <div className="min-w-0">
            <h1 className="font-bold text-lg tracking-tight">
              GreenCycle
            </h1>

            <p className="text-[11px] text-gray-400 mt-0.5 truncate">
              E-Waste Traceability
            </p>
          </div>

        </div>
      </div>

      {/* Current Role */}
      <div className="px-4 pt-5">
        <div className="px-3 py-3 rounded-xl bg-white/5 border border-white/5">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
            Workspace
          </p>

          <p className="text-sm font-semibold text-gray-200 mt-1">
            {roleName}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">

        <p className="px-3 mb-3 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
          Menu
        </p>

        <div className="space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-lg transition ${
                      isActive
                        ? "bg-white/15"
                        : "bg-white/5 group-hover:bg-white/10"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="truncate">
                    {item.label}
                  </span>

                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Brand Message */}
      <div className="px-4 pb-5 shrink-0">
        <div className="rounded-2xl bg-green-600/10 border border-green-500/10 p-4">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-lg">
              ♻
            </span>

            <p className="text-xs font-semibold text-green-300">
              Trace every batch
            </p>
          </div>

          <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
            Know where your e-waste goes from collection to recycling.
          </p>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;