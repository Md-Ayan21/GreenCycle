import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";

import ShopDashboard from "../pages/shop/Dashboard";
import AddEWaste from "../pages/shop/AddEWaste";
import EWaste from "../pages/shop/EWaste";
import Pickups from "../pages/shop/Pickups";

import CollectorDashboard from "../pages/collector/Dashboard";

import AdminDashboard from "../pages/admin/Dashboard";
import AdminPickups from "../pages/admin/Pickups";
import AdminBatches from "../pages/admin/Batches";

import RecyclerDashboard from "../pages/recycler/Dashboard";

import DigitalPassport from "../pages/passport/DigitalPassport";

import ScrollToTop from "./ScrollToTop";

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* Shop */}
        <Route
          path="/shop/dashboard"
          element={<ShopDashboard />}
        />

        <Route
          path="/shop/e-waste/new"
          element={<AddEWaste />}
        />

        <Route
          path="/shop/e-waste"
          element={<EWaste />}
        />

        <Route
          path="/shop/pickups"
          element={<Pickups />}
        />

        {/* Collector */}
        <Route
          path="/collector/dashboard"
          element={<CollectorDashboard />}
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/pickups"
          element={<AdminPickups />}
        />

        <Route
          path="/admin/batches"
          element={<AdminBatches />}
        />

        {/* Recycler */}
        <Route
          path="/recycler/dashboard"
          element={<RecyclerDashboard />}
        />

        {/* Digital Passport */}
        <Route
          path="/passport/:batchId"
          element={<DigitalPassport />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center px-6">
              <div className="text-center">
                <h1 className="text-5xl font-bold text-gray-900">
                  404
                </h1>

                <p className="mt-3 text-gray-500">
                  Page not found.
                </p>

                <Link
                  to="/"
                  className="inline-block mt-6 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold"
                >
                  Go Home
                </Link>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;