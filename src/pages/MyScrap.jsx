// src/pages/MyScrap.jsx
// FULL COPY PASTE

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyScrap = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch("http://localhost:5000/items");
    const data = await res.json();
    setItems(data);
  };

  const deleteItem = async (id) => {
    await fetch(`http://localhost:5000/delete/${id}`, {
      method: "DELETE"
    });

    alert("Deleted Successfully ✅");
    fetchData();
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:"#f5f5f5",
      padding:"30px"
    }}>

      <div style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        marginBottom:"25px"
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
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",
        gap:"20px"
      }}>

        {items.map((item) => (
          <div
            key={item._id}
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
                width:"100%",
                height:"180px",
                objectFit:"cover",
                borderRadius:"10px"
              }}
            />

            <h2>{item.scrap}</h2>

            <p><b>Seller:</b> {item.name}</p>
            <p><b>Quantity:</b> {item.quantity} kg</p>
            <p><b>Price:</b> ₹{item.price}</p>
            <p><b>Address:</b> {item.address}</p>

            <button
              onClick={() => deleteItem(item._id)}
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
  background:"#fff",
  padding:"18px",
  borderRadius:"15px",
  boxShadow:"0 5px 15px rgba(0,0,0,0.1)"
};

const btn = {
  padding:"10px 18px",
  border:"none",
  background:"#2e7d32",
  color:"#fff",
  borderRadius:"10px",
  cursor:"pointer"
};

const deleteBtn = {
  marginTop:"10px",
  width:"100%",
  padding:"10px",
  border:"none",
  background:"crimson",
  color:"#fff",
  borderRadius:"10px",
  cursor:"pointer"
};

export default MyScrap;