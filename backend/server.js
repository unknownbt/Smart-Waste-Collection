// ================= IMPORTS =================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const Razorpay = require("razorpay");

// ================= APP =================
const app = express();
const razorpay = new Razorpay({
  key_id: "rzp_test_Smg0y7kP7tjk2J",
  key_secret: "XIC4PSj9jWW3TgChD1YD1gAh",
});
app.use(cors());
app.use(express.json());

// ================= SERVER + SOCKET =================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// ================= DATABASE =================
mongoose
  .connect("mongodb://127.0.0.1:27017/wasteDB")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("Mongo Error:", err));

// ================= MODELS =================

// USER
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
  })
);

// SCRAP
const Scrap = mongoose.model(
  "Scrap",
  new mongoose.Schema(
    {
      sellerName: String,
      sellerEmail: String,

      scrap: String,
      quantity: String,

      price: Number,
      platformFee: Number,
      sellerGets: Number,

      image: String,
    },
    { collection: "scraps" }
  )
);

// ORDER
const Order = mongoose.model(
  "Order",
  new mongoose.Schema(
    {
      sellerName: String,
      sellerEmail: String,

      scrap: String,
      quantity: String,

      price: Number,
      platformFee: Number,
      finalAmount: Number,
      sellerGets: Number,

      buyerName: String,
      buyerEmail: String,

      status: {
        type: String,
        default: "Pending",
      },
      acceptedBy: String,
paymentDone: {
  type: Boolean,
  default: false,
},
    },
    { collection: "orders" }
  )
);

const Message = mongoose.model(
  "Message",
  new mongoose.Schema(
    {
      from: String,
      to: String,
      message: String,
    },
    { timestamps: true }
  )
);

// ================= TEST =================
app.get("/", (req, res) => {
  res.send("Backend Working ✅");
});

// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.json({ success: false, message: "Fill all fields" });
    }

    const checkUser = await User.findOne({ email });

    if (checkUser) {
      return res.json({ success: false, message: "User exists" });
    }

    await new User({ name, email, password, role }).save();

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.json({ success: false });
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch {
    res.json({ success: false });
  }
});

// ================= SELL SCRAP =================
app.post("/sell", async (req, res) => {
  try {

    const scrap = new Scrap({
      sellerName: req.body.sellerName,
      sellerEmail: req.body.sellerEmail,

      scrap: req.body.scrap,
      quantity: req.body.quantity,

      price: req.body.price,
      platformFee: req.body.platformFee,
      sellerGets: req.body.sellerGets,
    });

    await scrap.save();

    io.emit("newScrap", scrap);

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
});

// ================= GET SCRAPS =================
app.get("/items", async (req, res) => {
  try {
    const data = await Scrap.find().sort({ _id: -1 });
    res.json(data);
  } catch {
    res.json([]);
  }
});

/// ================= BUY ITEM =================

app.post("/buy", async (req, res) => {

  try {

    const order = new Order({

      sellerName: req.body.sellerName,

      sellerEmail: req.body.sellerEmail,

      buyerName: req.body.buyerName,

      buyerEmail: req.body.buyerEmail,

      scrap: req.body.scrap,

      quantity: req.body.quantity,

      price: req.body.price,

      platformFee: req.body.platformFee,

      sellerGets: req.body.sellerGets,

      finalAmount: req.body.finalAmount,

      status: "pending",

      acceptedBy: "",

      paymentDone: false,

      createdAt: new Date(),

    });

    await order.save();

    io.emit("orderUpdated");

    res.json({
      success: true,
    });

  } catch (err) {

    console.log(err);

    res.json({
      success: false,
    });

  }

});

// ================= GET ORDERS =================
app.get("/orders", async (req, res) => {
  try {
    const data = await Order.find().sort({ _id: -1 });
    res.json(data);
  } catch {
    res.json([]);
  }
});

// ================= UPDATE ORDER STATUS =================

app.put("/order-status/:id", async (req, res) => {

  try {

    const updatedOrder =
      await Order.findByIdAndUpdate(
        req.params.id,
        {
          status: req.body.status,
        },
        {
          new: true,
        }
      );

    if (!updatedOrder) {

      return res.json({
        success: false,
      });

    }

    io.emit(
      "orderUpdated",
      updatedOrder
    );

    res.json({
      success: true,
      order: updatedOrder,
    });

  } catch (err) {

    console.log(err);

    res.json({
      success: false,
    });

  }

});

// ================= DELETE =================
app.delete("/delete/:id", async (req, res) => {
  try {

    await Scrap.findByIdAndDelete(req.params.id);

    io.emit("itemDeleted", req.params.id);

    res.json({ success: true });

  } catch {
    res.json({ success: false });
  }
});

// ================= CHAT SYSTEM =================
let users = {};

io.on("connection", (socket) => {

  console.log("User Connected:", socket.id);

  socket.on("join", (email) => {
    users[email] = socket.id;
  });

  socket.on("sendMessage", async ({ to, message, from }) => {

    const msg = await new Message({
      from,
      to,
      message,
    }).save();

    const target = users[to];

    if (target) {
      io.to(target).emit("receiveMessage", msg);
    }

    socket.emit("receiveMessage", msg);
  });

  socket.on("disconnect", () => {

    for (let key in users) {
      if (users[key] === socket.id) {
        delete users[key];
      }
    }
  });
});

app.post("/create-order", async (req, res) => {

  try {

    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: "receipt_order",
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
    });

  }

});

// ================= START =================
server.listen(5000, () => {
  console.log("SERVER + SOCKET RUNNING 🚀");
});



// ================= ACCEPT ORDER =================

app.put("/accept-order/:id", async (req, res) => {

  try {

    const updated = await Order.findByIdAndUpdate(

      req.params.id,

      {
        status: "accepted",
      },

      { new: true }

    );

    io.emit("orderUpdated", updated);

    res.json({
      success: true,
      order: updated,
    });

  } catch (err) {

    console.log(err);

    res.json({
      success: false,
    });

  }

});


// ================= COMPLETE PAYMENT =================

app.put("/payment-done/:id", async (req, res) => {

  try {

    await Order.findByIdAndUpdate(

      req.params.id,

      {
        status: "completed",
        paymentDone: true,
      }

    );

    io.emit("orderUpdated");

    res.json({
      success: true,
    });

  } catch (err) {

    console.log(err);

    res.json({
      success: false,
    });

  }

});

// ================= REJECT ORDER =================

app.put("/reject-order/:id", async (req, res) => {

  try {

    const updated = await Order.findByIdAndUpdate(

      req.params.id,

      {
        status: "rejected",
      },

      { new: true }

    );

    io.emit("orderUpdated", updated);

    res.json({
      success: true,
      order: updated,
    });

  } catch (err) {

    console.log(err);

    res.json({
      success: false,
    });

  }

});

