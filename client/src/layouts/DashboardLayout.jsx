import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import MobileNavbar from "../components/layout/MobileNavbar";

function DashboardLayout({
  children,
  role = "shop",
}) {
  return (
    <div className="h-screen w-full overflow-hidden bg-[#f7faf8] flex">

      {/* Desktop Sidebar */}
      <Sidebar role={role} />

      {/* Main Application Area */}
      <div className="flex-1 min-w-0 h-screen flex flex-col">

        {/* Top Navbar */}
        <Navbar role={role} />

        {/* Scrollable Content Only */}
        <main
          className="
            flex-1
            min-h-0
            overflow-y-auto
            overflow-x-hidden
            overscroll-contain
            scroll-smooth
            pb-[68px]
            md:pb-0
          "
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavbar role={role} />

    </div>
  );
}

export default DashboardLayout;