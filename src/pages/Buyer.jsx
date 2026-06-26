// src/pages/Buyer.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import "./Buyer.css";

const Buyer = () => {

  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  const [filtered, setFiltered] = useState([]);

  // ================= FILTER STATES =================

  const [filters, setFilters] = useState({
    Plastic: false,
    Metal: false,
    Paper: false,
    Glass: false,
  });

  const [price, setPrice] = useState(1000);

  const user = JSON.parse(localStorage.getItem("user"));

  // ================= LOAD ITEMS =================

  const loadItems = async () => {
    const { data, error } = await supabase
      .from("scraps")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setItems(data || []);
    setFiltered(data || []);
  };

  // ================= FIRST LOAD =================

  useEffect(() => {
    loadItems();
  }, []);

  // ================= SUPABASE REALTIME =================

  useEffect(() => {
    const channel = supabase
      .channel("scraps-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scraps" },
        () => {
          loadItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ================= FILTER LOGIC =================

  useEffect(() => {

    let data = [...items];

    const active = Object.keys(filters).filter(
      (f) => filters[f]
    );

    if (active.length > 0) {

      data = data.filter((item) =>
        active.some((f) => item.scrap?.includes(f))
      );

    }

    data = data.filter(
      (item) => Number(item.price) <= price
    );

    setFiltered(data);

  }, [filters, price, items]);

  // ================= BUY FUNCTION =================

  const buyItem = async (item) => {

    console.log(item);

    // Spread coordinates slightly near Delhi for demo mapping
    const destLat = 28.6139 + (Math.random() - 0.5) * 0.04;
    const destLng = 77.2090 + (Math.random() - 0.5) * 0.04;

    const { error } = await supabase
      .from("orders")
      .insert({
        sellerName: item.sellerName,
        sellerEmail: item.sellerEmail,
        buyerName: user.name,
        buyerEmail: user.email,
        scrap: item.scrap,
        quantity: item.quantity,
        price: item.price,
        platformFee: item.platformFee || 0,
        sellerGets: item.sellerGets || item.price,
        finalAmount:
          Number(item.price) +
          Number(item.platformFee || 0),
        status: "Pending",
        acceptedBy: "",
        paymentDone: false,
        locationCoords: { lat: destLat, lng: destLng },
        collectorCoords: {
          lat: destLat + (Math.random() > 0.5 ? 0.015 : -0.015),
          lng: destLng + (Math.random() > 0.5 ? 0.015 : -0.015),
        },
      });

    if (error) {
      console.log(error);
      alert("Something went wrong ❌");
      return;
    }

    alert("Order Placed Successfully ✅");
    loadItems();
    navigate("/orders");
  };

  return (

    <div className="buyer-page">

      {/* ================= NAVBAR ================= */}

      <div className="buyer-navbar">

        <div className="nav-left">

          <span
            className="back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </span>

          <div className="logo-wrap">

            <span className="logo-icon">
              ♻
            </span>

            <h2 className="logo-text">
              SmartWaste
            </h2>

          </div>

        </div>

        <div className="nav-right">

          <span
            onClick={() => navigate("/chat")}
            style={{ cursor: "pointer" }}
          >
            💬 Chat
          </span>

          <FaUserCircle
            size={26}
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/profile")}
          />

        </div>

      </div>

      {/* ================= MAIN ================= */}

      <div className="buyer-main">

        {/* ================= FILTER ================= */}

        <div className="filter-box">

          <h3>Filters</h3>

          {["Plastic", "Metal", "Paper", "Glass"].map((type) => (

            <label key={type}>

              <input
                type="checkbox"
                checked={filters[type]}
                onChange={() =>
                  setFilters({
                    ...filters,
                    [type]: !filters[type],
                  })
                }
              />

              {type}

            </label>

          ))}

          <h4>Price Range</h4>

          <input
            type="range"
            min="0"
            max="10000"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
          />

          <p>₹ 0 - ₹ {price}</p>

          <button
            className="reset"
            onClick={() => {

              setFilters({
                Plastic: false,
                Metal: false,
                Paper: false,
                Glass: false,
              });

              setPrice(1000);

            }}
          >
            Reset Filters
          </button>

        </div>

        {/* ================= ITEMS ================= */}

        <div className="items-box">

          {filtered.length === 0 ? (

            <h2>No items found</h2>

          ) : (

            <div className="grid">

              {filtered.map((item) => (

                <div
                  key={item.id}
                  className="card"
                >

                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/200"
                    }
                    alt=""
                  />

                  <div className="card-content">

                    <h3>{item.scrap}</h3>

                    <p>
                      Qty:
                      <strong>
                        {" "}
                        {item.quantity}
                      </strong>
                    </p>

                    <p className="price">
                      ₹ {item.price}
                    </p>

                    {/* ================= FEE ================= */}

                    <p className="fee">
                      Platform Fee:
                      ₹ {item.platformFee || 0}
                    </p>

                    {/* ================= FINAL ================= */}

                    <h4 className="final-price">

                      Final Price:
                      ₹ {
                        Number(item.price) +
                        Number(item.platformFee || 0)
                      }

                    </h4>

                    {/* ================= SELLER EARNING ================= */}

                    <p className="seller-get">

                      Seller Receives:
                      ₹ {
                        item.sellerGets ||
                        item.price
                      }

                    </p>

                    {/* ================= BUTTONS ================= */}

                    <div className="btns">

                      <button
                        className="buy-btn"
                        onClick={() => buyItem(item)}
                      >
                        Buy Now
                      </button>

                      <button
                        className="chat-btn"
                        onClick={() =>
                          navigate("/chat", {
                            state: item,
                          })
                        }
                      >
                        Chat Seller 💬
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default Buyer;