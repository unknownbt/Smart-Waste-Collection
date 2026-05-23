import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./OrderDetails.css";

const OrderDetails = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  useEffect(() => {

    fetch("http://localhost:5000/orders")
      .then((res) => res.json())
      .then((data) => {

        const found = data.find(
          (o) => o._id === id
        );

        setOrder(found);

      });

  }, [id]);

  const pickedOrder = async () => {

    await fetch(
      `http://localhost:5000/order-status/${order._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "picked",
          location: "Collector reached location",
        }),
      }
    );

    window.location.reload();

  };

  const completePayment = async () => {

  const res = await fetch(
    "http://localhost:5000/create-order",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: order.finalAmount,
      }),
    }
  );

  const data = await res.json();

  const options = {

    key: "YOUR_KEY_ID",

    amount: data.amount,

    currency: data.currency,

    name: "SmartWaste",

    description: "Waste Collection Payment",

    order_id: data.id,

    handler: async function () {

      await fetch(
        `http://localhost:5000/order-status/${order._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "completed",
            location: "Payment Completed",
          }),
        }
      );

      alert("Payment Successful ✅");

      window.location.reload();

    },

    theme: {
      color: "#1f7a34",
    },

  };

  const razor = new window.Razorpay(options);

  razor.open();

};

  if (!order) {
    return <h1>Loading...</h1>;
  }

  return (

    <div className="details-page">

      {/* NAVBAR */}

      <div className="premium-navbar">

        <div className="nav-left">

          <button onClick={() => navigate(-1)}>
            ← Back
          </button>

          <h2>SmartWaste</h2>

        </div>

        <div className="nav-right">

          <span>
            Live Tracking
          </span>

        </div>

      </div>

      {/* CARD */}

      <div className="details-card">

        {/* TOP */}

        <div className="details-header">

          <div>

            <h1>{order.scrap}</h1>

            <p>
              Batch #WM-{order._id.slice(-6)}
            </p>

          </div>

          <span className={`detail-status ${order.status}`}>

            {order.status}

          </span>

        </div>

        {/* MAP */}

        <div className="map-box">

          <iframe
            title="map"
            src="https://maps.google.com/maps?q=india&t=&z=13&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="320"
            style={{ border: 0 }}
          ></iframe>

        </div>

        {/* LIVE STATUS */}

        <div className="live-status">

          📍 {order.location || "Collector on the way"}

        </div>

        {/* TRACKING */}

        <div className="detail-tracking">

          <div className={`track active`}>
            ✓
          </div>

          <div className="line"></div>

          <div className={`track ${
            order.status === "picked" ||
            order.status === "completed"
              ? "active"
              : ""
          }`}>
            🚚
          </div>

          <div className="line"></div>

          <div className={`track ${
            order.status === "completed"
              ? "active"
              : ""
          }`}>
            ₹
          </div>

        </div>

        {/* LABELS */}

        <div className="tracking-labels">

          <span>Accepted</span>

          <span>Pickup</span>

          <span>Payment</span>

        </div>

        {/* SELLER */}

        <div className="seller-box">

          <div className="seller-left">

            <img
              src="https://i.pravatar.cc/100"
              alt=""
            />

            <div>

              <h3>
                {order.sellerName || "Seller"}
              </h3>

              <p>
                Verified SmartWaste Seller
              </p>

            </div>

          </div>

          <button
            className="chat-btn"
            onClick={() => {

              const phone = "919999999999";

              window.open(
                `https://wa.me/${phone}`
              );

            }}
          >
            Message
          </button>

        </div>

        {/* PICKUP BUTTON */}

        {
          order.status === "accepted" && (

            <button
              className="pickup-btn"
              onClick={pickedOrder}
            >
              Order Picked Successfully
            </button>

          )
        }

        {/* PAYMENT */}

        {
          order.status === "picked" && (

            <div className="payment-box">

              <h2>
                Ready For Payment
              </h2>

              <p>
                Collector arrived successfully.
              </p>

              <button
                className="pay-btn"
                onClick={completePayment}
              >
                Pay ₹ {order.finalAmount}
              </button>

            </div>

          )
        }

        {/* COMPLETED */}

        {
          order.status === "completed" && (

            <div className="completed-box">

              ✅ Payment Completed Successfully

            </div>

          )
        }

      </div>

    </div>

  );
};

export default OrderDetails;