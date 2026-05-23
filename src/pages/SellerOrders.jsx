import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerOrders.css";

const SellerOrders = () => {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  // FETCH ORDERS
  const fetchOrders = () => {

    fetch("http://localhost:5000/orders")
      .then(res => res.json())
      .then(data => {

        console.log("USER:", user);

        console.log("ORDERS:", data);

        const sellerOrders = data.filter(
          (o) =>
            o.sellerEmail === user.email &&
            o.status?.toLowerCase() !== "rejected"
        );

        setOrders(sellerOrders);

      });

  };

  useEffect(() => {

    fetchOrders();

  }, []);

  // ACCEPT ORDER
  const acceptOrder = async (id) => {

  try {

    const res = await fetch(
      `http://localhost:5000/order-status/${id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status: "accepted",
        }),
      }
    );

    const data = await res.json();

    if (data.success) {

      alert("Order Accepted ✅");

      fetchOrders();

    }

  } catch (err) {

    console.log(err);

  }

};

  // REJECT ORDER
  const rejectOrder = async (id) => {

  try {

    const res = await fetch(
      `http://localhost:5000/order-status/${id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status: "rejected",
        }),
      }
    );

    const data = await res.json();

    if (data.success) {

      alert("Order Rejected ❌");

      fetchOrders();

    }

  } catch (err) {

    console.log(err);

  }

};

  return (

    <div className="seller-orders-page">

      {/* TOP */}
      <div className="seller-top">

        <button
          onClick={() => navigate("/dashboard")}
        >
          ← Back
        </button>

        <h1>Pickup Requests</h1>

      </div>

      {/* EMPTY */}
      {
        orders.length === 0 && (

          <div className="empty-box">

            <h2>No Pickup Requests Yet</h2>

          </div>

        )
      }

      {/* ORDERS */}
      <div className="seller-orders-grid">

        {
          orders.map((o, i) => (

            <div className="seller-card" key={i}>

              {/* TOP */}
              <div className="seller-card-top">

                <div>

                  <h2>{o.scrap}</h2>

                  <p>
                    Batch #WM-{100 + i}
                  </p>

                </div>

                <span className={`status-tag ${o.status}`}>

                  {o.status}

                </span>

              </div>

              {/* PRICE */}
              <div className="seller-price">

                <small>Expected Earnings</small>

                <h1>₹ {o.finalAmount}</h1>

              </div>

              {/* GRID */}
              <div className="seller-info-grid">

                <div>
                  <small>Quantity</small>
                  <h3>{o.quantity}</h3>
                </div>

                <div>
                  <small>Buyer Offer</small>
                  <h3>₹ {o.price}</h3>
                </div>

                <div>
                  <small>Platform Fee</small>
                  <h3>₹ {o.platformFee}</h3>
                </div>

                <div>
                  <small>Final Amount</small>
                  <h3>₹ {o.finalAmount}</h3>
                </div>

              </div>

              {/* BUYER */}
              <div className="buyer-box">

                <h3>Buyer Details</h3>

                <p>
                  <b>Name:</b> {o.buyerName}
                </p>

                <p>
                  <b>Email:</b> {o.buyerEmail}
                </p>

                <p>
                  <b>Status:</b> {o.status}
                </p>

              </div>

              {/* TRACKING */}
              <div className="tracking">

                <div className="active-step">
                  ✓
                </div>

                <div className="line"></div>

                <div className={
                  o.status?.toLowerCase() === "accepted"
                    ? "active-step"
                    : "step"
                }>
                  🚚
                </div>

                <div className="line"></div>

                <div className={
                  o.status?.toLowerCase() === "completed"
                    ? "active-step"
                    : "step"
                }>
                  ₹
                </div>

              </div>

              {/* LABELS */}
              <div className="tracking-labels">

                <span>Order Placed</span>

                <span>Pickup</span>

                <span>Payment</span>

              </div>

              {/* LOCATION */}
              <div className="location-box">

                {
                  o.status?.toLowerCase() === "accepted"
                    ? "📍 Buyer is coming for pickup"
                    : "📍 Buyer waiting for pickup"
                }

              </div>

              {/* BUTTONS */}
              <div className="seller-buttons">

  {
    o.status?.toLowerCase() !== "accepted" &&
    o.status?.toLowerCase() !== "rejected" && (

      <>
        <button
          className="accept-btn"
          onClick={() => acceptOrder(o._id)}
        >
          Accept Order
        </button>

        <button
          className="reject-btn"
          onClick={() => rejectOrder(o._id)}
        >
          Reject
        </button>
      </>

    )
  }

</div>

            </div>

          ))
        }

      </div>

    </div>

  );
};

export default SellerOrders;