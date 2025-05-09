import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import RootLayout from "./layouts/root-layout";
import "./App.css";
import LandingPage from "./pages/landing/landing";
import CustomerHome from "./pages/customer/customer-home";
import RideHome from "./pages/ride/ride-home";
import CustomerMenu from "./pages/customer/customer-menu";
import RestaurantHome from "./pages/restaurant/restaurant-home";
import StoreHome from "./pages/store/store-home";
import StaffLogin from "./pages/staff/staff-login";
import StaffHome from "./pages/staff/staff-home";
import StoreItem from "./pages/store/store-item";
import StoreOrder from "./pages/store/store-order";
import RestaurantItem from "./pages/restaurant/restaurant-item";
import RestaurantOrder from "./pages/restaurant/restaurant-order";
import RideOrder from "./pages/ride/ride-order";
import RideDetail from "./pages/ride/ride-detail";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="customer" element={<CustomerHome />} />
        <Route path="customer/:restaurant_id" element={<CustomerMenu />} />
        <Route path="ride" element={<RideHome />} />
        <Route path="ride/:ride_id" element={<RideDetail />} />
        <Route path="ride/order" element={<RideOrder />} />
        <Route path="restaurant" element={<RestaurantHome />} />
        <Route path="restaurant/:restaurant_id" element={<RestaurantItem />} />
        <Route path="restaurant/order" element={<RestaurantOrder />} />
        <Route path="store" element={<StoreHome />} />
        <Route path="store/:store_id" element={<StoreItem />} />
        <Route path="store/order" element={<StoreOrder />} />
        <Route path="staff" element={<StaffLogin />} />
        <Route path="staff/home" element={<StaffHome />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
