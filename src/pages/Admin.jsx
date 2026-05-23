// STEP 4 = ADMIN DASHBOARD
// NEW FILE: src/pages/Admin.jsx
// FULL COPY PASTE

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res1 = await fetch("http://localhost:5000/items");
    const data1 = await res1.json();

    const res2 = await fetch("http://localhost:5000/orders");
    const data2 = await res2.json();

    setItems(data1);
    setOrders(data2);
  };

  const totalScrap = items.length;
  const totalOrders = orders.length;

  let totalRevenue = 0;

  orders.forEach((item) => {
    totalRevenue += Number(item.price);
  });

  return (
    <div style={{
      minHeight:"100vh",
      background:"#f5f5f5",
      padding:"30px"
    }}>

      <div style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center"
      }}>
        <h1>Admin Dashboard</h1>

        <button
          onClick={() => navigate("/dashboard")}
          style={btn}
        >
          Back
        </button>
      </div>

      <div style={grid}>

        <div style={card}>
          <h2>{totalScrap}</h2>
          <p>Total Scrap Items</p>
        </div>

        <div style={card}>
          <h2>{totalOrders}</h2>
          <p>Total Orders</p>
        </div>

        <div style={card}>
          <h2>₹{totalRevenue}</h2>
          <p>Total Revenue</p>
        </div>

      </div>

      <h2 style={{ marginTop:"30px" }}>Recent Orders</h2>

      {orders.map((item) => (
        <div
          key={item._id}
          style={orderCard}
        >
          <h3>{item.scrap}</h3>
          <p>Seller: {item.sellerName}</p>
          <p>Buyer: {item.buyerName}</p>
          <p>Price: ₹{item.price}</p>
          <p>Status: {item.status}</p>
        </div>
      ))}

    </div>
  );
};

const grid = {
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
  gap:"20px",
  marginTop:"25px"
};

const card = {
  background:"#fff",
  padding:"25px",
  borderRadius:"15px",
  textAlign:"center",
  boxShadow:"0 5px 15px rgba(0,0,0,0.1)"
};

const orderCard = {
  background:"#fff",
  padding:"18px",
  borderRadius:"12px",
  marginTop:"15px"
};

const btn = {
  padding:"10px 18px",
  border:"none",
  background:"#2e7d32",
  color:"#fff",
  borderRadius:"10px",
  cursor:"pointer"
};

export default Admin;