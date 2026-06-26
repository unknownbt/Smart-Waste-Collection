import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./SellerOrders.css";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const SellerOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [distanceLeft, setDistanceLeft] = useState(null);
  const [eta, setEta] = useState(null);

  const trackingOrderRef = useRef(null);
  const trackingMapRef = useRef(null);
  const trackingDestMarkerRef = useRef(null);
  const trackingColMarkerRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // FETCH ORDERS
  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("sellerEmail", user.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    // Filter out rejected
    const sellerOrders = (data || []).filter(
      (o) => o.status?.toLowerCase() !== "rejected"
    );

    setOrders(sellerOrders);

    // If tracking modal is open, update the tracking order info
    if (trackingOrderRef.current) {
      const current = (data || []).find(
        (o) => o.id === trackingOrderRef.current.id
      );
      if (current) {
        setTrackingOrder(current);
        trackingOrderRef.current = current;
      }
    }
  };

  useEffect(() => {
    fetchOrders();

    // ================= SUPABASE REALTIME =================
    const channel = supabase
      .channel("orders-seller-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          fetchOrders();

          // Handle location updates via realtime
          if (payload.new && trackingOrderRef.current) {
            const updated = payload.new;
            if (updated.id === trackingOrderRef.current.id) {
              const colLat = updated.collectorCoords?.lat;
              const colLng = updated.collectorCoords?.lng;
              if (colLat && colLng && trackingColMarkerRef.current) {
                trackingColMarkerRef.current.setLatLng([colLat, colLng]);
                const destLat = updated.locationCoords?.lat || 28.6139;
                const destLng = updated.locationCoords?.lng || 77.2090;
                const dist = calculateDistance(colLat, colLng, destLat, destLng);
                setDistanceLeft(dist);
                setEta(Math.max(1, Math.round((dist / 25) * 60)));
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Leaflet Modal Map Init
  useEffect(() => {
    if (!trackingOrder || !window.L) return;

    const destLat = trackingOrder.locationCoords?.lat || 28.6139;
    const destLng = trackingOrder.locationCoords?.lng || 77.2090;
    const colLat = trackingOrder.collectorCoords?.lat || destLat;
    const colLng = trackingOrder.collectorCoords?.lng || destLng;

    const dist = calculateDistance(colLat, colLng, destLat, destLng);
    setDistanceLeft(dist);
    setEta(Math.max(1, Math.round((dist / 25) * 60)));

    trackingMapRef.current = null;
    trackingDestMarkerRef.current = null;
    trackingColMarkerRef.current = null;

    const timer = setTimeout(() => {
      const mapEl = document.getElementById("tracking-leaflet-map");
      if (!mapEl) return;

      trackingMapRef.current = window.L.map("tracking-leaflet-map").setView([destLat, destLng], 13);

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(trackingMapRef.current);

      const sellerIconHtml = `
        <div style="font-size: 32px; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.35));">
          🏠
        </div>
      `;
      const sellerIcon = window.L.divIcon({
        html: sellerIconHtml,
        className: "custom-seller-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const collectorIconHtml = `
        <div style="font-size: 32px; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.35)); transform: scaleX(-1); line-height: 1;">
          🚚
        </div>
      `;
      const collectorIcon = window.L.divIcon({
        html: collectorIconHtml,
        className: "custom-collector-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      trackingDestMarkerRef.current = window.L.marker([destLat, destLng], { icon: sellerIcon })
        .addTo(trackingMapRef.current)
        .bindPopup("<b>My Pickup Location</b>");

      trackingColMarkerRef.current = window.L.marker([colLat, colLng], { icon: collectorIcon })
        .addTo(trackingMapRef.current)
        .bindPopup("<b>Live Collector Truck</b>");

      const bounds = window.L.latLngBounds([
        [destLat, destLng],
        [colLat, colLng],
      ]);
      trackingMapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }, 150);

    return () => clearTimeout(timer);
  }, [trackingOrder]);

  const openTracking = (order) => {
    setTrackingOrder(order);
    trackingOrderRef.current = order;
  };

  const closeTracking = () => {
    setTrackingOrder(null);
    trackingOrderRef.current = null;
  };

  // ACCEPT ORDER
  const acceptOrder = async (id) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "accepted" })
        .eq("id", id);

      if (error) {
        console.log(error);
        return;
      }

      alert("Order Accepted ✅");
      fetchOrders();
    } catch (err) {
      console.log(err);
    }
  };

  // REJECT ORDER
  const rejectOrder = async (id) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) {
        console.log(error);
        return;
      }

      alert("Order Rejected ❌");
      fetchOrders();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="seller-orders-page">
      {/* TOP */}
      <div className="seller-top">
        <button onClick={() => navigate("/dashboard")}>← Back</button>
        <h1>Pickup Requests</h1>
      </div>

      {/* EMPTY */}
      {orders.length === 0 && (
        <div className="empty-box">
          <h2>No Pickup Requests Yet</h2>
        </div>
      )}

      {/* ORDERS */}
      <div className="seller-orders-grid">
        {orders.map((o, i) => (
          <div className="seller-card" key={o.id}>
            {/* TOP */}
            <div className="seller-card-top">
              <div>
                <h2>{o.scrap}</h2>
                <p>Batch #WM-{100 + i}</p>
              </div>
              <span className={`status-tag ${o.status}`}>{o.status}</span>
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
              <div className="active-step">✓</div>
              <div className="line"></div>
              <div
                className={
                  o.status?.toLowerCase() === "accepted" ||
                    o.status?.toLowerCase() === "picked" ||
                    o.status?.toLowerCase() === "completed"
                    ? "active-step"
                    : "step"
                }
              >
                🚚
              </div>
              <div className="line"></div>
              <div
                className={
                  o.status?.toLowerCase() === "completed"
                    ? "active-step"
                    : "step"
                }
              >
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
              {o.status?.toLowerCase() === "accepted"
                ? "📍 Buyer is coming for pickup"
                : o.status?.toLowerCase() === "picked"
                  ? "📍 Collector arrived"
                  : o.status?.toLowerCase() === "completed"
                    ? "📍 Order Completed Successfully"
                    : "📍 Buyer waiting for pickup"}
            </div>

            {/* BUTTONS */}
            <div className="seller-buttons">
              {o.status?.toLowerCase() !== "accepted" &&
                o.status?.toLowerCase() !== "rejected" &&
                o.status?.toLowerCase() !== "picked" &&
                o.status?.toLowerCase() !== "completed" && (
                  <>
                    <button className="accept-btn" onClick={() => acceptOrder(o.id)}>
                      Accept Order
                    </button>
                    <button className="reject-btn" onClick={() => rejectOrder(o.id)}>
                      Reject
                    </button>
                  </>
                )}

              {(o.status?.toLowerCase() === "accepted" ||
                o.status?.toLowerCase() === "picked") && (
                  <button className="track-live-btn" onClick={() => openTracking(o)}>
                    Track Collector Live 🚚
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* LIVE TRACKING MODAL */}
      {trackingOrder && (
        <div className="tracking-modal-overlay">
          <div className="tracking-modal">
            <div className="tracking-modal-header">
              <h2>Live Track Collector 🚚</h2>
              <button className="close-modal-btn" onClick={closeTracking}>
                ✕
              </button>
            </div>

            <div className="tracking-stats-bar">
              <div className="stat">
                <span className="label">Distance Left</span>
                <span className="val">
                  {distanceLeft !== null ? `${distanceLeft.toFixed(2)} km` : "Calculating..."}
                </span>
              </div>
              <div className="stat">
                <span className="label">ETA (Collector Vehicle)</span>
                <span className="val">
                  {eta !== null ? `${eta} mins` : "Calculating..."}
                </span>
              </div>
              <div className="stat">
                <span className="label">Order Status</span>
                <span className="val status-text">{trackingOrder.status}</span>
              </div>
            </div>

            <div
              id="tracking-leaflet-map"
              style={{
                width: "100%",
                height: "380px",
                borderRadius: "12px",
                zIndex: 1,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;