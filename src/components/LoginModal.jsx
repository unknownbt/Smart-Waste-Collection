import { useState } from "react";
import "./LoginModal.css";
import { supabase } from "../supabaseClient";

const LoginModal = ({ close }) => {

  const [login, setLogin] = useState(true);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  // ================= LOGIN =================
  const handleLogin = async () => {

    if (!data.email || !data.password) {
      alert("Fill all fields ❌");
      return;
    }

    try {

      // Check user in our custom users table (custom auth, not Supabase Auth)
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", data.email)
        .eq("password", data.password)
        .single();

      if (error || !users) {
        alert("Invalid Credentials ❌");
        return;
      }

      localStorage.setItem("user", JSON.stringify(users));
      localStorage.setItem("role", users.role);

      alert("Login Success ✅");

      // 🔥 ROLE BASED REDIRECT
      if (
        users.role === "seller" ||
        users.role === "startup"
      ) {
        window.location.href = "/seller";
      } else {
        window.location.href = "/buyer";
      }

    } catch (err) {
      console.log(err);
      alert("Error ❌");
    }
  };

  // ================= SIGNUP =================
  const handleSignup = async () => {

    if (
      !data.name ||
      !data.email ||
      !data.password ||
      !data.role
    ) {
      alert("Fill all fields ❌");
      return;
    }

    try {

      // Check if user already exists
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", data.email)
        .single();

      if (existing) {
        alert("User already exists ❌");
        return;
      }

      // Insert new user
      const { error } = await supabase
        .from("users")
        .insert({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        });

      if (error) {
        alert(error.message || "Signup Failed ❌");
        return;
      }

      alert("Signup Success 🎉");
      setLogin(true);

    } catch (err) {
      console.log(err);
      alert("Error ❌");
    }
  };

  // ================= UI =================
  return (

    <div className="auth-overlay">

      <div className="auth-modal">

        <div
          className="auth-close"
          onClick={close}
        >
          ✕
        </div>

        <h2 className="auth-title">
          {login ? "Welcome" : "Create Account"}
        </h2>

        {/* SIGNUP EXTRA FIELDS */}
        {!login && (
          <>
            <input
              className="auth-input"
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
            />

            <select
              className="auth-input"
              name="role"
              onChange={handleChange}
            >
              <option value="">Select Role</option>

              <option value="buyer">
                Buyer
              </option>

              <option value="seller">
                Seller / Collector
              </option>

            </select>
          </>
        )}

        {/* EMAIL */}
        <input
          className="auth-input"
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
        />

        {/* PASSWORD */}
        <input
          className="auth-input"
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        {/* BUTTON */}
        <button
          className="auth-btn"
          onClick={login ? handleLogin : handleSignup}
        >
          {login ? "Sign In" : "Create Account"}
        </button>

        {/* TOGGLE */}
        <p className="auth-switch">

          {login
            ? "Don't have an account?"
            : "Already have an account?"}

          <span onClick={() => setLogin(!login)}>
            {login ? " Sign up" : " Login"}
          </span>

        </p>

      </div>

    </div>
  );
};

export default LoginModal;