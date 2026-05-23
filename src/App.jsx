import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Admin from "./pages/Admin";

import Dashboard from "./pages/Dashboard";
import Seller from "./pages/Seller";
import Buyer from "./pages/Buyer";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import MyScrap from "./pages/MyScrap";
import Chat from "./Chat";
import SellerOrders from "./pages/SellerOrders";
import OrderDetails from "./pages/OrderDetails";

function App() {
  return (
    <BrowserRouter>

      <Routes>
       <Route path="/" element={<Dashboard />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/seller" element={<Seller />} />
        <Route path="/sellerOrders" element={<SellerOrders />} />
        <Route path="/order-details/:id" element={<OrderDetails />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/buyer" element={<Buyer />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/myscrap" element={<MyScrap />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      {/* TOAST NOTIFICATION */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme="colored"
      />

    </BrowserRouter>
  );
}

export default App;