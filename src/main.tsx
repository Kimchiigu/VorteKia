import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import RootLayout from "./layouts/root-layout";
import "./App.css";
import LandingPage from "./pages/landing";
import CustomerHome from "./pages/customer/customer-home";
import RideHome from "./pages/ride/ride-page";
import CustomerMenu from "./pages/customer/customer-menu";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="customer" element={<CustomerHome />} />
        <Route path="customer/:restaurant_id" element={<CustomerMenu />} />
        <Route path="ride" element={<RideHome />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
