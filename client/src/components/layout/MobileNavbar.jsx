import { NavLink } from "react-router-dom";

function MobileNavbar({ role = "shop" }) {
  const menuByRole = {
    shop: [
      {
        label: "Home",
        path: "/shop/dashboard",
        icon: "⌂",
      },
      {
        label: "E-Waste",
        path: "/shop/e-waste",
        icon: "♻",
      },
      {
        label: "Pickups",
        path: "/shop/pickups",
        icon: "🚚",
      },
    ],

    collector: [
      {
        label: "Home",
        path: "/collector/dashboard",
        icon: "⌂",
      },
    ],

    admin: [
      {
        label: "Home",
        path: "/admin/dashboard",
        icon: "⌂",
      },
      {
        label: "Pickups",
        path: "/admin/pickups",
        icon: "🚚",
      },
      {
        label: "Batches",
        path: "/admin/batches",
        icon: "📦",
      },
    ],

    recycler: [
      {
        label: "Home",
        path: "/recycler/dashboard",
        icon: "⌂",
      },
    ],
  };

  const menuItems = menuByRole[role] || [];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[68px] bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div
        className="h-full grid items-center px-2"
        style={{
          gridTemplateColumns: `repeat(${menuItems.length}, minmax(0, 1fr))`,
        }}
      >
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative h-full flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-all duration-200 ${
                isActive
                  ? "text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator */}
                <span
                  className={`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-b-full transition-all ${
                    isActive
                      ? "bg-green-600"
                      : "bg-transparent"
                  }`}
                />

                {/* Icon */}
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                    isActive
                      ? "bg-green-50 scale-105"
                      : "bg-transparent"
                  }`}
                >
                  {item.icon}
                </span>

                {/* Label */}
                <span className="leading-none">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileNavbar;