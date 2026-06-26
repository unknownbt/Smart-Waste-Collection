// src/pages/MyScrap.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const MyScrap = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("scraps")
      .select("*")
      .eq("sellerEmail", user.email)
      .order("created_at", { ascending: false });

    if (!error) setItems(data || []);
  };

  const deleteItem = async (id) => {
    const { error } = await supabase
      .from("scraps")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Delete failed ❌");
      return;
    }

    alert("Deleted Successfully ✅");
    fetchData();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f5",
      padding: "30px"
    }}>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px"
      }}>
        <h1>My Scrap Panel</h1>

        <button
          onClick={() => navigate("/dashboard")}
          style={btn}
        >
          Back
        </button>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
        gap: "20px"
      }}>

        {items.map((item) => (
          <div
            key={item.id}
            style={card}
          >
            <img
              src={
                item.image
                  ? item.image
                  : "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9"
              }
              alt=""
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
                borderRadius: "10px"
              }}
            />

            <h2>{item.scrap}</h2>

            <p><b>Seller:</b> {item.sellerName || item.name}</p>
            <p><b>Quantity:</b> {item.quantity} kg</p>
            <p><b>Price:</b> ₹{item.price}</p>
            <p><b>Address:</b> {item.address || "No Address Provided"}</p>

            <button
              onClick={() => deleteItem(item.id)}
              style={deleteBtn}
            >
              Delete
            </button>

          </div>
        ))}

      </div>

    </div>
  );
};

const card = {
  background: "#fff",
  padding: "18px",
  borderRadius: "15px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
};

const btn = {
  padding: "10px 18px",
  border: "none",
  background: "#2e7d32",
  color: "#fff",
  borderRadius: "10px",
  cursor: "pointer"
};

const deleteBtn = {
  marginTop: "10px",
  width: "100%",
  padding: "10px",
  border: "none",
  background: "crimson",
  color: "#fff",
  borderRadius: "10px",
  cursor: "pointer"
};

export default MyScrap;