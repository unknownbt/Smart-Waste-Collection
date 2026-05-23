// src/pages/Seller.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./Seller.css";

const Seller = () => {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [items, setItems] = useState([
    { category: "Plastic", weight: "" }
  ]);

  const [files, setFiles] = useState([]);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
  };

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { category: "Plastic", weight: "" }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const rates = {
    Plastic: 10,
    Paper: 8,
    Glass: 5,
    Metal: 20
  };

  const totalPrice = items.reduce((sum, item) => {
    const w = parseFloat(item.weight) || 0;
    return sum + w * rates[item.category];
  }, 0);

  // ✅ PLATFORM FEE
  const platformFee = Math.round(totalPrice * 0.05);

  // ✅ SELLER FINAL MONEY
  const sellerGets = totalPrice - platformFee;

  const totalWeight = items.reduce((sum, item) => {
    return sum + (parseFloat(item.weight) || 0);
  }, 0);

  const impact = totalWeight
    ? (totalWeight * 0.25).toFixed(1)
    : "0";


  // ================= PLACE ORDER =================

const placeOrder = async () => {

  const user = JSON.parse(localStorage.getItem("user"));

  const res = await fetch("http://localhost:5000/sell", {

    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({

      sellerName: user.name,

      sellerEmail: user.email,

      scrap: items.map(i => i.category).join(", "),

      quantity: items.map(i => i.weight).join(", "),

      price: totalPrice,

      platformFee,

      sellerGets,

      status: "pending",

      createdAt: new Date(),

    }),

  });

  const data = await res.json();

  if (data.success) {

    alert("Order placed successfully ✅");

    navigate("/SellerOrders");

  } else {

    alert("Something went wrong ❌");

  }
};

  return (

    <div className="seller-page">

      {/* ================= NAVBAR ================= */}

      <div className="seller-navbar">

        <div className="nav-left">

          <span
            className="back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </span>

          <div className="logo-wrap">
            <span className="logo-icon">♻</span>
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

      {/* ================= TOP TEXT ================= */}

      <div className="top-text">

        <h2 className="sub">
          Turn Your Waste into Worth
        </h2>

        <p className="sub">
          Every piece of material you list contributes to a cleaner planet.
        </p>

      </div>

      {/* ================= STEP BAR ================= */}

      <div className="step-wrapper">

        <div className="step-bar">

          <div className={`step ${step >= 1 ? "active" : ""}`}>
            1
            <br />
            Material
          </div>

          <div className={`line ${step >= 2 ? "active" : ""}`}></div>

          <div className={`step ${step >= 2 ? "active" : ""}`}>
            2
            <br />
            Price
          </div>

          <div className={`line ${step >= 3 ? "active" : ""}`}></div>

          <div className={`step ${step >= 3 ? "active" : ""}`}>
            3
            <br />
            Confirm
          </div>

        </div>

      </div>

      {/* ================= MAIN ================= */}

      <div className="seller-container">

        {/* ================= LEFT ================= */}

        <div className="form-card">

          {/* ================= STEP 1 ================= */}

          {step === 1 && (
            <>

              <h3>Material Details</h3>

              {items.map((item, index) => (

                <div key={index} className="item-box">

                  <div className="category-grid">

                    {["Plastic", "Paper", "Glass", "Metal"].map((cat) => (

                      <div
                        key={cat}
                        className={`cat ${item.category === cat ? "active" : ""}`}
                        onClick={() =>
                          handleChange(index, "category", cat)
                        }
                      >
                        {cat}
                      </div>

                    ))}

                  </div>

                  <div className="row">

                    <input
                      placeholder="Weight (kg)"
                      value={item.weight}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "weight",
                          e.target.value
                        )
                      }
                    />

                  </div>

                  {items.length > 1 && (

                    <button
                      className="remove-btn"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </button>

                  )}

                </div>

              ))}

              <button
                className="add-btn"
                onClick={addItem}
              >
                + Add More Item
              </button>

              {/* ================= UPLOAD ================= */}

              <label className="upload-box">

                <div className="upload-inner">

                  <p>📤 Upload Images</p>

                  <span>
                    PNG, JPG up to 10MB
                  </span>

                </div>

                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleFiles}
                />

              </label>

              {/* ================= PREVIEW ================= */}

              {files.length > 0 && (

                <div className="preview-grid">

                  {files.map((f, i) => (

                    <img
                      key={i}
                      src={URL.createObjectURL(f)}
                      alt=""
                    />

                  ))}

                </div>

              )}

              <div className="form-footer">

                <span></span>

                <button
                  disabled={totalWeight === 0}
                  onClick={() => setStep(2)}
                >
                  Next →
                </button>

              </div>

            </>
          )}

          {/* ================= STEP 2 ================= */}

          {step === 2 && (
            <>

              <h3>Price Summary</h3>

              {items.map((item, i) => {

                const price =
                  (parseFloat(item.weight) || 0)
                  * rates[item.category];

                return (

                  <div key={i} className="price-item">

                    <span>{item.category}</span>

                    <span>{item.weight} kg</span>

                    <span>₹ {price}</span>

                  </div>

                );
              })}

              {/* ================= PREMIUM SUMMARY ================= */}

              <div className="premium-summary">

                <div className="sum-row">
                  <span>Total Scrap Value</span>
                  <span>₹ {totalPrice}</span>
                </div>

                <div className="sum-row fee">
                  <span>Platform Fee (5%)</span>
                  <span>₹ {platformFee}</span>
                </div>

                <div className="sum-row final">
                  <span>You Receive</span>
                  <span>₹ {sellerGets}</span>
                </div>

              </div>

              <div className="form-footer">

                <button onClick={() => setStep(1)}>
                  ← Back
                </button>

                <button onClick={() => setStep(3)}>
                  Continue →
                </button>

              </div>

            </>
          )}

          {/* ================= STEP 3 ================= */}

          {step === 3 && (
            <>

              <h3>Confirm Order</h3>

              <div className="confirm-box">

                <div className="confirm-row">
                  <span>Total Amount</span>
                  <span>₹ {totalPrice}</span>
                </div>

                <div className="confirm-row">
                  <span>Platform Fee</span>
                  <span>₹ {platformFee}</span>
                </div>

                <div className="confirm-row final">
                  <span>You Receive</span>
                  <span>₹ {sellerGets}</span>
                </div>

              </div>

              <div className="form-footer">

                <button onClick={() => setStep(2)}>
                  ← Back
                </button>

                <button onClick={placeOrder}>
                  Submit Order
                </button>

              </div>

            </>
          )}

        </div>

        {/* ================= RIGHT ================= */}

        <div className="side-card">

          <div className="tips">

            <h4>Listing Tips</h4>

            <ul>
              <li>Accurate weight helps collectors</li>
              <li>Clean scrap gets better price</li>
              <li>Photos increase trust</li>
            </ul>

          </div>

          <div className="impact">

            <h4>Estimated Impact</h4>

            <h2>{impact} kg CO₂</h2>

            <p>Environmental saving</p>

          </div>

        </div>

      </div>

      {/* ================= FOOTER ================= */}

      <div className="seller-footer">

        <div>♻ SmartWaste</div>

        <div className="footer-links">

          <span>Privacy</span>

          <span>Terms</span>

          <span>Support</span>

        </div>

      </div>

    </div>
  );
};

export default Seller;