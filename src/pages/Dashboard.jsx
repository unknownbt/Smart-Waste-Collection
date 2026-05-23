import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "../components/LoginModal";

import {
  FaRecycle,
  FaTruck,
  FaShoppingCart,
  FaStore,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUserCircle
} from "react-icons/fa";

import "./Dashboard.css";

const Dashboard = () => {

  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const serviceRef = useRef(null);
  const contactRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const scrollTo = (ref) => {
    ref.current.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (

    <div className="main-home">

      {/* HERO */}
      <section className="hero-new" ref={homeRef}>

        {/* NAVBAR */}
        <div className="navbar">

          {/* LEFT */}
          <div className="nav-left">

            <h2 className="logo">
              ♻ <span>SmartWaste</span>
            </h2>

          </div>

          {/* CENTER */}
          <div className="menu">

            <span onClick={() => scrollTo(homeRef)}>
              Services
            </span>

            <span onClick={() => scrollTo(aboutRef)}>
              How It Works
            </span>

            <span onClick={() => scrollTo(serviceRef)}>
              Pricing
            </span>

            <span onClick={() => scrollTo(contactRef)}>
              Contact
            </span>

          </div>

          {/* RIGHT */}
          <div className="profile-area">

            <button
              className="profile-btn"
              onClick={() => {

                if (!user) {

                  setShowLogin(true);

                } else {

                  setShowProfile(!showProfile);

                }

              }}
            >
              <FaUserCircle size={26} />
            </button>

            {/* PROFILE BOX */}
            {showProfile && user && (

              <div className="profile-box">

                <h3>{user?.name}</h3>

                <p>{user?.email}</p>

                <button
                  onClick={() => navigate("/profile")}
                >
                  My Profile
                </button>

                {/* 🔥 ROLE BASED */}
                {
                  user.role === "seller" ||
                  user.role === "startup"
                  ?
                  <>
                    <button
                      onClick={() => navigate("/seller")}
                    >
                      Seller Dashboard
                    </button>

                    <button
                      onClick={() => navigate("/SellerOrders")}
                    >
                      Pickup Orders
                    </button>
                  </>
                  :
                  <>
                    <button
                      onClick={() => navigate("/buyer")}
                    >
                      Buyer Dashboard
                    </button>

                    <button
                      onClick={() => navigate("/orders")}
                    >
                      My Orders
                    </button>
                  </>
                }

                <button
                  onClick={() => {

                    localStorage.clear();

                    window.location.reload();

                  }}
                >
                  Logout
                </button>

              </div>

            )}

          </div>

        </div>

        {/* HERO CONTENT */}
        <div className="hero-clean">

          <span className="badge">
            ♻ Sustainable waste management
          </span>

          <h1>
            Smart waste collection
            <br />

            <span>
              for a cleaner tomorrow
            </span>
          </h1>

          <p>
            Schedule pickups, track collections,
            and contribute to a sustainable future.
          </p>

        </div>

      </section>

      {/* STATS */}
      <section className="stats">

        <div className="stat-box">
          <h2>10K+</h2>
          <p>Completed Pickups</p>
        </div>

        <div className="stat-box">
          <h2>5K+</h2>
          <p>Happy Users</p>
        </div>

        <div className="stat-box">
          <h2>200+</h2>
          <p>Verified Buyers</p>
        </div>

        <div className="stat-box">
          <h2>50 Tons</h2>
          <p>Waste Recycled</p>
        </div>

      </section>

      {/* ABOUT */}
      <section className="about" ref={aboutRef}>

        <div className="about-left">

          <small>About Us</small>

          <h2>Why Use Smart Waste?</h2>

          <p>
            Smart Waste helps people sell waste materials
            at best rates and allows buyers to purchase
            recyclable products easily.
          </p>

          <ul>
            <li>✔ Earn money from waste</li>
            <li>✔ Buy materials at low prices</li>
            <li>✔ Eco friendly system</li>
            <li>✔ Fast doorstep pickup</li>
            <li>✔ Trusted buyers & sellers</li>
          </ul>

          <button>
            Join Us
          </button>

        </div>

        <div className="about-right">

          <img
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952"
            alt=""
          />

        </div>

      </section>

      {/* SERVICES */}
      <section className="services" ref={serviceRef}>

        <small>Our Services</small>

        <h2>What We Provide</h2>

        <div className="service-grid">

          <div className="card">
            <FaTruck />
            <h3>Pickup Service</h3>
            <p>Quick pickup from homes & offices.</p>
          </div>

          <div className="card">
            <FaRecycle />
            <h3>Recycling</h3>
            <p>Reuse waste into useful products.</p>
          </div>

          <div className="card">
            <FaStore />
            <h3>Seller Market</h3>
            <p>Sell paper, plastic, iron etc.</p>
          </div>

          <div className="card">
            <FaShoppingCart />
            <h3>Buyer Market</h3>
            <p>Buy recyclable materials easily.</p>
          </div>

        </div>

      </section>

      {/* CONTACT */}
      <section className="contact" ref={contactRef}>

        <small>Contact Us</small>

        <h2>Get In Touch</h2>

      </section>

      {/* FOOTER */}
      <footer className="footer">

        <h3>♻ Smart Waste</h3>

        <p>
          Recycle Today For Better Tomorrow
        </p>

      </footer>

      {/* LOGIN MODAL */}
      {
        showLogin &&
        <LoginModal close={() => setShowLogin(false)} />
      }

    </div>
  );
};

export default Dashboard;