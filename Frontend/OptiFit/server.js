<<<<<<< HEAD
require("dotenv").config();
const connectDB = require("./src/config/db");
const app = require("./src/app");

// ✅ Use Render PORT
const PORT = process.env.PORT || 5000;

// ✅ Start server ONLY after DB connects
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected ✅");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("DB Connection Failed ❌", error);
    process.exit(1);
  }
};

startServer();

// ✅ Health check route (VERY IMPORTANT for Render)
app.get("/", (req, res) => {
  res.send("OPTIFIT API RUNNING 🚀");
});

// ✅ Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend Connected Successfully 🚀" });
});

// ✅ Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/food", require("./src/routes/foodRoutes"));
=======
require("dotenv").config({ path: __dirname + "/.env" });

const connectDB = require("./src/config/db");
const app = require("./src/app");

const PORT = 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
>>>>>>> 0303ee4b5731e0cea6cc5bdb2f10fe0fa642f089
