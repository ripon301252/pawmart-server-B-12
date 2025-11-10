require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root
app.get("/", (req, res) => {
  res.send("PawMart server is running 🐾");
});

// MongoDB URI
const uri =
  "mongodb+srv://pawmart_db:poMamDZGktoiyFBp@cluster0.w0nmtjl.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("pawmart_db");

    const storesCollection = db.collection("stores");
    const ordersCollection = db.collection("orders");

    // =========================
    // Stores Routes
    // =========================

    // Get all stores
    app.get("/stores", async (req, res) => {
      try {
        const result = await storesCollection.find().toArray();
        res.json(result);
      } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
      }
    });

    // Get stores list with optional category filter (max 6 items)
    app.get("/stores-list", async (req, res) => {
      try {
        const { category } = req.query;
        const query = category ? { category } : {};
        const stores = await storesCollection.find(query).limit(6).toArray();
        res.json(stores);
      } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
      }
    });

    // Get single store by ID
    app.get("/stores/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const store = await storesCollection.findOne({ _id: new ObjectId(id) });
        if (!store) return res.status(404).send("Store not found");
        res.json(store);
      } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
      }
    });

    // Add new listing
    app.post("/stores", async (req, res) => {
      try {
        const newListing = req.body;
        const result = await storesCollection.insertOne(newListing);
        res.status(201).json({ message: "Listing added", listingId: result.insertedId });
      } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
      }
    });

    // =========================
    // Orders Routes
    // =========================

    // Get all orders or by user email
    app.get("/myOrders", async (req, res) => {
      try {
        const email = req.query.email;
        const query = email ? { email } : {};
        const orders = await ordersCollection.find(query).toArray();
        res.json(orders);
      } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
      }
    });

    // Create new order
    app.post("/orders", async (req, res) => {
      try {
        const order = req.body;
        const result = await ordersCollection.insertOne(order);
        res.status(201).json({ message: "Order placed", orderId: result.insertedId });
      } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
      }
    });

    // =========================
    // Ping MongoDB
    // =========================
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB!");
  } finally {
    // Don't close client
  }
}

// Run server
run().catch(console.dir);

// Listen
app.listen(port, () => console.log(`🚀 Server running on port: ${port}`));
