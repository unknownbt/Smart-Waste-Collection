import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaBox,
  FaMoneyBillWave,
  FaChartLine,
  FaArrowLeft,
} from "react-icons/fa";

import "./Profile.css";

const Profile = () => {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [orders, setOrders] = useState([]);

  const [activeTab, setActiveTab] = useState("overview");

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    pincode: user?.pincode || "",
    bankName: user?.bankName || "",
    accountNumber: user?.accountNumber || "",
    ifsc: user?.ifsc || "",
    upi: user?.upi || "",
  });

  // ================= FETCH ORDERS =================

  useEffect(() => {

    fetch("http://localhost:5000/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));

  }, []);

  // ================= USER ORDERS =================

  const userOrders = orders.filter(
    (o) =>
      o.buyerEmail === user?.email ||
      o.sellerEmail === user?.email
  );

  // ================= TOTAL EARNING =================

  const totalEarnings = userOrders
    .filter((o) => o.status === "Completed")
    .reduce((sum, o) => sum + Number(o.price), 0);

  // ================= HANDLE INPUT =================

  const handleChange = (e) => {

    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= SAVE PROFILE =================

  const saveProfile = async () => {

    try {

      const res = await fetch(
        "http://localhost:5000/updateProfile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: user.email,
            ...profileData
          })
        }
      );

      const result = await res.json();

      if (result.success) {

        localStorage.setItem(
          "user",
          JSON.stringify(result.user)
        );

        alert("Profile Saved Successfully ✅");

      } else {

        alert("Failed To Save ❌");

      }

    } catch (err) {

      console.log(err);

      alert("Server Error ❌");

    }
  };

  return (

    <div className="profile-page">

      {/* ================= TOPBAR ================= */}

      <div className="topbar">

        <div className="top-left">
          <h2>♻ SmartWaste</h2>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
          Back
        </button>

      </div>

      {/* ================= LAYOUT ================= */}

      <div className="profile-layout">

        {/* ================= SIDEBAR ================= */}

        <div className="sidebar">

          <div>

            <div className="profile-header">

              <FaUserCircle className="avatar" />

              <h3>{user?.name}</h3>

              <p>{user?.email}</p>

            </div>

            <div className="menu">

  <div
    className={`menu-item ${activeTab === "overview" ? "active" : ""}`}
    onClick={() => setActiveTab("overview")}
  >
    <span>📊</span>
    <span>Overview</span>
  </div>

  <div
    className={`menu-item ${activeTab === "profile" ? "active" : ""}`}
    onClick={() => setActiveTab("profile")}
  >
    <span>👤</span>
    <span>Personal Details</span>
  </div>

  <div
    className={`menu-item ${activeTab === "orders" ? "active" : ""}`}
    onClick={() => setActiveTab("orders")}
  >
    <span>📦</span>
    <span>Orders</span>
  </div>

  <div
    className={`menu-item ${activeTab === "payments" ? "active" : ""}`}
    onClick={() => setActiveTab("payments")}
  >
    <span>💳</span>
    <span>Payments</span>
  </div>

  <div
    className={`menu-item ${activeTab === "analytics" ? "active" : ""}`}
    onClick={() => setActiveTab("analytics")}
  >
    <span>📈</span>
    <span>Analytics</span>
  </div>

</div>

          </div>

          {/* BOTTOM */}

          <div className="bottom-menu">

            <div className="menu-item">
              ⚙ Settings
            </div>

            <div className="menu-item">
              ❓ Support
            </div>

          </div>

        </div>

        {/* ================= CONTENT ================= */}

        <div className="content">

          {/* ================= OVERVIEW ================= */}

          {activeTab === "overview" && (

            <>
              <h2 className="heading">
                Dashboard Overview
              </h2>

              <div className="cards">

                <div className="dashboard-card">
                  <FaBox className="card-icon" />
                  <h1>{userOrders.length}</h1>
                  <p>Active Orders</p>
                </div>

                <div className="dashboard-card">
                  <FaMoneyBillWave className="card-icon" />
                  <h1>₹ {totalEarnings}</h1>
                  <p>Total Earnings</p>
                </div>

                <div className="dashboard-card">
                  <FaChartLine className="card-icon" />
                  <h1>
                    {(userOrders.length * 0.25).toFixed(2)} Tons
                  </h1>
                  <p>Carbon Saved 🌱</p>
                </div>

              </div>

              <div className="activity">

                <h3>Recent Activity</h3>

                {userOrders.slice(0, 5).map((o, i) => (

                  <div key={i} className="activity-item">

                    📦 {o.scrap} — ₹{o.price}

                    <span>{o.status}</span>

                  </div>

                ))}

              </div>
            </>
          )}

          {/* ================= PROFILE ================= */}

          {activeTab === "profile" && (

            <>
              <h2 className="heading">
                Personal Information
              </h2>

              <div className="form-grid">

                <input
                  className="full-input"
                  name="fullName"
                  placeholder="Full Name"
                  value={profileData.fullName}
                  onChange={handleChange}
                />

                <input
                  className="full-input"
                  name="email"
                  placeholder="Email"
                  value={profileData.email}
                  onChange={handleChange}
                />

                <input
                  name="phone"
                  placeholder="Phone Number"
                  value={profileData.phone}
                  onChange={handleChange}
                />

                <input
                  name="address"
                  placeholder="Address"
                  value={profileData.address}
                  onChange={handleChange}
                />

                <input
                  name="city"
                  placeholder="City"
                  value={profileData.city}
                  onChange={handleChange}
                />

                <input
                  name="state"
                  placeholder="State"
                  value={profileData.state}
                  onChange={handleChange}
                />

                <input
                  name="pincode"
                  placeholder="Pincode"
                  value={profileData.pincode}
                  onChange={handleChange}
                />

                <input
                  name="bankName"
                  placeholder="Bank Name"
                  value={profileData.bankName}
                  onChange={handleChange}
                />

                <input
                  className="full-input"
                  name="accountNumber"
                  placeholder="Account Number"
                  value={profileData.accountNumber}
                  onChange={handleChange}
                />

                <input
                  name="ifsc"
                  placeholder="IFSC Code"
                  value={profileData.ifsc}
                  onChange={handleChange}
                />

                <input
                  name="upi"
                  placeholder="UPI ID"
                  value={profileData.upi}
                  onChange={handleChange}
                />

              </div>

              <button
                className="save-btn"
                onClick={saveProfile}
              >
                Save Information
              </button>
            </>
          )}

          {/* ================= ORDERS ================= */}

          {activeTab === "orders" && (

            <>
              <h2 className="heading">
                My Orders
              </h2>

              {userOrders.map((o, i) => (

                <div key={i} className="order-card">

                  <h3>{o.scrap}</h3>

                  <p>Price: ₹ {o.price}</p>

                  <p>Status: {o.status}</p>

                </div>

              ))}
            </>
          )}

          {/* ================= PAYMENTS ================= */}

          {activeTab === "payments" && (

            <>
              <h2 className="heading">
                Payment Details
              </h2>

              <div className="payment-box">

                <p>
                  💰 Total Earnings:
                  <strong> ₹ {totalEarnings}</strong>
                </p>

                <p>
                  🏦 Bank:
                  <strong> {profileData.bankName || "Not Added"}</strong>
                </p>

                <p>
                  📲 UPI:
                  <strong> {profileData.upi || "Not Added"}</strong>
                </p>

              </div>
            </>
          )}

          {/* ================= ANALYTICS ================= */}

          {activeTab === "analytics" && (

            <>
              <h2 className="heading">
                Analytics
              </h2>

              <div className="chart">

                {userOrders.map((o, i) => (

                  <div key={i} className="bar">

                    <div
                      className="fill"
                      style={{
                        height: `${Number(o.price) / 2}px`,
                      }}
                    ></div>

                    <span>₹{o.price}</span>

                  </div>

                ))}

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
export default Profile;