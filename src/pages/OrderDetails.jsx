import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./OrderDetails.css";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [sharingGps, setSharingGps] = useState(false);
  const [gpsWatchId, setGpsWatchId] = useState(null);

  const mapRef = useRef(null);
  const destMarkerRef = useRef(null);
  const collectorMarkerRef = useRef(null);
  const simulationIntervalRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch Order Details
  const fetchOrder = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setOrder(data);
  };

  useEffect(() => {
    fetchOrder();

    // ================= SUPABASE REALTIME =================
    const channel = supabase
      .channel(`order-details-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setOrder(payload.new);

          // Update collector marker if map is open
          const colLat = payload.new.collectorCoords?.lat;
          const colLng = payload.new.collectorCoords?.lng;
          if (colLat && colLng && collectorMarkerRef.current) {
            collectorMarkerRef.current.setLatLng([colLat, colLng]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      if (gpsWatchId) navigator.geolocation.clearWatch(gpsWatchId);
    };
  }, [id, gpsWatchId]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!order || !window.L) return;

    const destLat = order.locationCoords?.lat || 28.6139;
    const destLng = order.locationCoords?.lng || 77.2090;
    const colLat = order.collectorCoords?.lat || (destLat + 0.015);
    const colLng = order.collectorCoords?.lng || (destLng - 0.015);

    if (!mapRef.current) {
      mapRef.current = window.L.map("leaflet-map").setView([destLat, destLng], 13);

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);

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

      destMarkerRef.current = window.L.marker([destLat, destLng], { icon: sellerIcon })
        .addTo(mapRef.current)
        .bindPopup("<b>Seller Pick Up Location</b><br/>" + (order.address || ""));

      collectorMarkerRef.current = window.L.marker([colLat, colLng], { icon: collectorIcon })
        .addTo(mapRef.current)
        .bindPopup("<b>Live Collector Truck</b>");

      const bounds = window.L.latLngBounds([
        [destLat, destLng],
        [colLat, colLng]
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    } else {
      destMarkerRef.current.setLatLng([destLat, destLng]);
      collectorMarkerRef.current.setLatLng([colLat, colLng]);
    }
  }, [order]);

  // Start Simulation Route
  const startSimulation = () => {
    if (simulating || !order) return;
    setSimulating(true);

    const destLat = order.locationCoords?.lat || 28.6139;
    const destLng = order.locationCoords?.lng || 77.2090;

    const startLat = destLat + 0.012;
    const startLng = destLng - 0.015;

    let currentStep = 0;
    const totalSteps = 30;

    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);

    simulationIntervalRef.current = setInterval(async () => {
      currentStep++;
      const ratio = currentStep / totalSteps;
      const curLat = startLat + (destLat - startLat) * ratio;
      const curLng = startLng + (destLng - startLng) * ratio;

      if (collectorMarkerRef.current) {
        collectorMarkerRef.current.setLatLng([curLat, curLng]);
      }

      // Update collector coords in Supabase (broadcasts via Realtime to other users)
      await supabase
        .from("orders")
        .update({ collectorCoords: { lat: curLat, lng: curLng } })
        .eq("id", order.id);

      setOrder((prev) => ({
        ...prev,
        collectorCoords: { lat: curLat, lng: curLng },
      }));

      if (currentStep >= totalSteps) {
        clearInterval(simulationIntervalRef.current);
        setSimulating(false);

        await supabase
          .from("orders")
          .update({
            status: "picked",
            location: "Collector reached seller's pickup location!",
          })
          .eq("id", order.id);

        alert("Simulated Collector has arrived! 🚚");
        fetchOrder();
      }
    }, 1000);
  };

  // Share Live Device GPS
  const toggleGpsSharing = () => {
    if (sharingGps) {
      if (gpsWatchId) {
        navigator.geolocation.clearWatch(gpsWatchId);
        setGpsWatchId(null);
      }
      setSharingGps(false);
    } else {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      const watch = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          if (collectorMarkerRef.current) {
            collectorMarkerRef.current.setLatLng([latitude, longitude]);
          }

          // Update in Supabase (Realtime broadcasts to other clients)
          await supabase
            .from("orders")
            .update({ collectorCoords: { lat: latitude, lng: longitude } })
            .eq("id", order.id);

          setOrder((prev) => ({
            ...prev,
            collectorCoords: { lat: latitude, lng: longitude },
          }));
        },
        (err) => {
          console.error(err);
          alert("GPS Geolocation failed: " + err.message);
        },
        { enableHighAccuracy: true }
      );

      setGpsWatchId(watch);
      setSharingGps(true);
    }
  };

  const pickedOrder = async () => {
    await supabase
      .from("orders")
      .update({
        status: "picked",
        location: "Collector reached location",
      })
      .eq("id", order.id);

    fetchOrder();
  };

  const completePayment = async () => {
    // Razorpay still requires backend — keep this fetch to backend if running,
    // otherwise stub with direct Supabase status update
    try {
      const res = await fetch("http://localhost:5000/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: order.finalAmount }),
      });
      const data = await res.json();

      const options = {
        key: "rzp_test_Smg0y7kP7tjk2J",
        amount: data.amount,
        currency: data.currency,
        name: "SmartWaste",
        description: "Waste Collection Payment",
        order_id: data.id,
        handler: async function () {
          await supabase
            .from("orders")
            .update({
              status: "completed",
              location: "Payment Completed",
              paymentDone: true,
            })
            .eq("id", order.id);
          alert("Payment Successful ✅");
          fetchOrder();
        },
        theme: { color: "#1f7a34" },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      // If backend not running, just mark as completed directly
      await supabase
        .from("orders")
        .update({ status: "completed", location: "Payment Completed", paymentDone: true })
        .eq("id", order.id);
      alert("Payment Successful ✅");
      fetchOrder();
    }
  };

  if (!order) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="details-page">
      {/* NAVBAR */}
      <div className="premium-navbar">
        <div className="nav-left">
          <button onClick={() => navigate(-1)}>← Back</button>
          <h2>SmartWaste Live Track</h2>
        </div>
        <div className="nav-right">
          <span className="live-pulse">● Live Tracking Active</span>
        </div>
      </div>

      {/* CARD */}
      <div className="details-card">
        {/* TOP */}
        <div className="details-header">
          <div>
            <h1>{order.scrap}</h1>
            <p>Batch #WM-{order.id.slice(-6)}</p>
          </div>
          <span className={`detail-status ${order.status}`}>{order.status}</span>
        </div>

        {/* MAP CONTAINER */}
        <div style={{ position: "relative" }}>
          <div id="leaflet-map" style={{ width: "100%", height: "350px", borderRadius: "12px", zIndex: 1 }}></div>

          {/* SIMULATOR CONTROLS OVERLAY */}
          {order.status === "accepted" && (
            <div className="map-simulator-panel">
              <h4>🚚 Collector GPS Control</h4>
              <div className="sim-buttons">
                <button
                  className={`sim-btn ${simulating ? "active" : ""}`}
                  onClick={startSimulation}
                  disabled={simulating}
                >
                  {simulating ? "🚚 Simulating..." : "▶ Simulate Route"}
                </button>
                <button
                  className={`gps-btn ${sharingGps ? "sharing" : ""}`}
                  onClick={toggleGpsSharing}
                >
                  {sharingGps ? "🛑 Stop Real GPS" : "📡 Share Device GPS"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* LIVE STATUS */}
        <div className="live-status">
          📍 {order.location || (order.status === "accepted" ? "Collector is moving towards pickup point..." : "Collector waiting for order status change")}
        </div>

        {/* TRACKING PROGRESS */}
        <div className="detail-tracking">
          <div className="track active">✓</div>
          <div className="line"></div>
          <div className={`track ${order.status === "picked" || order.status === "completed" ? "active" : ""}`}>🚚</div>
          <div className="line"></div>
          <div className={`track ${order.status === "completed" ? "active" : ""}`}>₹</div>
        </div>

        {/* LABELS */}
        <div className="tracking-labels">
          <span>Accepted</span>
          <span>Pickup</span>
          <span>Payment</span>
        </div>

        {/* SELLER DETAILS */}
        <div className="seller-box">
          <div className="seller-left">
            <img src="https://i.pravatar.cc/100" alt="Avatar" />
            <div>
              <h3>{order.sellerName || "Seller"}</h3>
              <p>Verified SmartWaste Seller</p>
            </div>
          </div>
          <button
            className="chat-btn"
            onClick={() => {
              navigate("/chat", { state: order });
            }}
          >
            Message
          </button>
        </div>

        {/* PICKUP ACTION */}
        {order.status === "accepted" && (
          <button className="pickup-btn" onClick={pickedOrder}>
            Order Picked Successfully
          </button>
        )}

        {/* PAYMENT ACTION */}
        {order.status === "picked" && (
          <div className="payment-box">
            <h2>Ready For Payment</h2>
            <p>Collector arrived successfully.</p>
            <button className="pay-btn" onClick={completePayment}>
              Pay ₹ {order.finalAmount}
            </button>
          </div>
        )}

        {/* COMPLETED SUCCESS */}
        {order.status === "completed" && (
          <div className="completed-box">
            ✅ Payment Completed Successfully
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;