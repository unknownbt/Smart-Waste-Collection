import { useState } from "react";

const Forgot = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [newPass, setNewPass] = useState("");

  const sendOtp = () => {
    const code = Math.floor(1000 + Math.random() * 9000);
    setGeneratedOtp(code.toString());
    alert("OTP: " + code); // 🔥 demo only
  };

  const verifyOtp = () => {
    if (otp === generatedOtp) {
      const user = JSON.parse(localStorage.getItem("user"));
      user.password = newPass;
      localStorage.setItem("user", JSON.stringify(user));
      alert("Password updated ✅");
    } else {
      alert("Wrong OTP ❌");
    }
  };

  return (
    <div className="container">
      <h2>Forgot Password</h2>

      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
      <button onClick={sendOtp}>Send OTP</button>

      <input placeholder="Enter OTP" onChange={(e)=>setOtp(e.target.value)} />
      <input placeholder="New Password" onChange={(e)=>setNewPass(e.target.value)} />

      <button onClick={verifyOtp}>Verify & Reset</button>
    </div>
  );
};

export default Forgot;