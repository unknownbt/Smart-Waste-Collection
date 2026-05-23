import { useState } from "react";
import "./LoginModal.css";

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

      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (result.success) {

        localStorage.setItem(
          "user",
          JSON.stringify(result.user)
        );

        localStorage.setItem(
          "role",
          result.user.role
        );

        alert("Login Success ✅");

        // 🔥 ROLE BASED REDIRECT
        if (
  result.user.role === "seller" ||
  result.user.role === "startup"
) {

  window.location.href = "/seller";

} else {

  window.location.href = "/buyer";

}

      } else {

        alert("Invalid Credentials ❌");

      }

    } catch (err) {

      console.log(err);

      alert("Server Error ❌");

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

      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {

        alert("Signup Success 🎉");

        setLogin(true);

      } else {

        alert(result.message || "Signup Failed ❌");

      }

    } catch (err) {

      console.log(err);

      alert("Server Error ❌");

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
            ? "Don’t have an account?"
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