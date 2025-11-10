require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("PawMart server is running 🐾");
});

// MongoDB URI
const uri =
  "mongodb+srv://pawmart_db:poMamDZGktoiyFBp@cluster0.w0nmtjl.mongodb.net/?appName=Cluster0";

// Mongo client setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Main async function
async function run() {
  try {
    await client.connect();
    const db = client.db("pawmart_db");

    // Collections
    const storesCollection = db.collection("stores");
    const categoriesCollection = db.collection("categories");
    const petsCollection = db.collection("pets");
    const petFoodCollection = db.collection("petfood");
    const accessoriesCollection = db.collection("accessories");
    const petCareProductsCollection = db.collection("petCareProducts");
    const ordersCollection = db.collection("orders");
    const listingsCollection = db.collection("listings");

    // Category slug map
    const collections = {
      pets: petsCollection,
      petFood: petFoodCollection,
      accessories: accessoriesCollection,
      petCareProducts: petCareProductsCollection,
    };

    const categorySlugMap = {
      pets: "pets",
      "pet food": "petFood",
      accessories: "accessories",
      "pet care products": "petCareProducts",
    };

    // Get all stores
    app.get("/stores", async (req, res) => {
      const result = await storesCollection.find().toArray();
      res.send(result);
    });

    // Get all categories (insert default if empty)
    app.get("/categories", async (req, res) => {
      const count = await categoriesCollection.countDocuments();
      if (count === 0) {
        await categoriesCollection.insertMany([
          { name: "Pets", icon: "🐶", slug: "pets" },
          { name: "Pet Food", icon: "🍖", slug: "petFood" },
          { name: "Accessories", icon: "🧸", slug: "accessories" },
          { name: "Pet Care Products", icon: "💊", slug: "petCareProducts" },
        ]);
      }
      const result = await categoriesCollection.find().toArray();
      res.send(result);
    });

    // Get all items per category
    app.get("/pets", async (req, res) => {
      const result = await petsCollection.find().toArray();
      res.send(result);
    });
    app.get("/petFood", async (req, res) => {
      const result = await petFoodCollection.find().toArray();
      res.send(result);
    });
    app.get("/accessories", async (req, res) => {
      const result = await accessoriesCollection.find().toArray();
      res.send(result);
    });
    app.get("/petCareProducts", async (req, res) => {
      const result = await petCareProductsCollection.find().toArray();
      res.send(result);
    });

    // Get single item details
    app.get("/:category/:id", async (req, res) => {
      const { category, id } = req.params;

      // Normalize category
      const normalizedCategory = categorySlugMap[category.toLowerCase()];
      const collection = collections[normalizedCategory];

      if (!collection) {
        return res.status(404).send({ error: "Category not found" });
      }

      try {
        const result = await collection.findOne({ _id: new ObjectId(id) });
        if (!result) return res.status(404).send({ error: "Item not found" });
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch item" });
      }
    });

    // Add new order
    app.post("/orders", async (req, res) => {
      try {
        const order = req.body;
        const result = await ordersCollection.insertOne(order);
        res.send(result);
      } catch (error) {
        console.error("Error inserting order:", error);
        res.status(500).send({ message: "Failed to place order" });
      }
    });

    // Get all orders
    app.get("/orders", async (req, res) => {
      const result = await ordersCollection.find().toArray();
      res.send(result);
    });

    // Add new listing
    app.post("/listings", async (req, res) => {
      try {
        const listing = req.body;
        const result = await listingsCollection.insertOne(listing);
        res.send({ success: true, insertedId: result.insertedId });
      } catch (err) {
        console.error(err);
        res
          .status(500)
          .send({ success: false, message: "Failed to add listing!" });
      }
    });

    // Get listings (optional: filter by email)
    app.get("/listings", async (req, res) => {
      const email = req.query.email;
      try {
        const query = email ? { email } : {};
        const listings = await listingsCollection.find(query).toArray();
        res.send(listings);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch listings" });
      }
    });

    // Ping MongoDB
    await client.db("admin").command({ ping: 1 });
    console.log(
      "✅ Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Don't close client for server apps
  }
}

// Run server
run().catch(console.dir);

// Listen
app.listen(port, () => {
  console.log(`🚀 PawMart server listening on port: ${port}`);
});
