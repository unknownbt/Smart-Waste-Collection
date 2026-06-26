import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Orders.css";

const Orders = () => {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("buyerEmail", user.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setOrders(data || []);
  };

  useEffect(() => {
    fetchOrders();

    // ================= SUPABASE REALTIME =================
    const channel = supabase
      .channel("orders-buyer-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (

    <div className="orders-page">

      {/* NAVBAR */}

      <div className="orders-navbar">

        <button onClick={() => navigate("/dashboard")}>
          ← Back
        </button>

        <h2>My Orders</h2>

      </div>

      {/* ORDERS */}

      <div className="orders-container">

        {orders.length === 0 ? (

          <div className="empty-orders">

            <h1>No Orders Yet</h1>
            <p>Your placed orders will appear here.</p>

          </div>

        ) : (

          orders.map((o, i) => (

            <div className="order-card" key={o.id}>

              {/* TOP */}

              <div className="order-top">

                <div>

                  <h3>{o.scrap}</h3>

                  <p className="order-id">
                    Batch #WM-2024-{100 + i}
                  </p>

                </div>

                <span className={`status ${o.status?.toLowerCase()}`}>

                  {
                    o.status?.toLowerCase() === "rejected"
                      ? "Order Rejected by Seller"
                      : o.status
                  }

                </span>

              </div>

              {/* PRICE */}

              <div className="price-box">

                <span>Estimated Value</span>

                <h1>
                  ₹ {o.finalAmount || o.price}
                </h1>

              </div>

              {/* DETAILS */}

              <div className="order-details">

                <div className="detail-card">

                  <span>Quantity</span>
                  <h4>{o.quantity}</h4>

                </div>

                <div className="detail-card">

                  <span>Price</span>
                  <h4>₹ {o.price}</h4>

                </div>

                <div className="detail-card">

                  <span>Platform Fee</span>
                  <h4>₹ {o.platformFee || 0}</h4>

                </div>

                <div className="detail-card">

                  <span>Final Amount</span>
                  <h4>₹ {o.finalAmount || o.price}</h4>

                </div>

              </div>

              {/* TRACKING */}

              <div className="tracking-section">

                <div className="tracking-line">

                  {/* ORDER PLACED */}

                  <div className="track active">

                    <div className="circle">✓</div>

                    <h5>Order Placed</h5>

                  </div>

                  {/* SELLER ACCEPTED */}

                  <div className={`track ${o.status?.toLowerCase() === "accepted" ||
                    o.status?.toLowerCase() === "picked" ||
                    o.status?.toLowerCase() === "completed"
                    ? "active"
                    : ""
                    }`}>

                    <div className="circle">✓</div>

                    <h5>Seller Accepted</h5>

                  </div>

                  {/* COLLECTOR COMING */}

                  <div className={`track ${o.status?.toLowerCase() === "picked" ||
                    o.status?.toLowerCase() === "completed"
                    ? "active"
                    : ""
                    }`}>

                    <div className="circle">🚚</div>

                    <h5>Collector Coming</h5>

                  </div>

                  {/* COMPLETED */}

                  <div className={`track ${o.status?.toLowerCase() === "completed"
                    ? "active"
                    : ""
                    }`}>

                    <div className="circle">₹</div>

                    <h5>Completed</h5>

                  </div>

                </div>

              </div>

              {/* LOCATION */}

              <div className="location-box">

                📍 Current Location :

                <span>

                  {
                    o.status?.toLowerCase() === "rejected"
                      ? "Order Rejected"
                      : o.location || "Collector on the way"
                  }

                </span>

              </div>

              {/* COLLECTOR */}

              {
                o.status?.toLowerCase() !== "rejected" && (

                  <div className="collector-box">

                    <div className="collector-left">

                      <img
                        src="https://i.pravatar.cc/100"
                        alt=""
                      />

                      <div>

                        <h4>Collector</h4>

                        <p>
                          {o.collectorName || "SmartWaste Partner"}
                        </p>

                      </div>

                    </div>

                    <button className="message-btn">
                      Message
                    </button>

                  </div>

                )
              }

              {/* ACTION BUTTONS */}

              <div className="order-buttons">

                <button
                  className="secondary-btn"
                  onClick={() => navigate(`/order-details/${o.id}`)}
                >
                  View Details
                </button>

                {o.status?.toLowerCase() === "picked" && (

                  <button className="primary-btn">
                    Pay Now
                  </button>

                )}

              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
};

export default Orders;