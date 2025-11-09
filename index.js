require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleWare
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("pawmart server is running");
});

const uri =
  "mongodb+srv://pawmart_db:poMamDZGktoiyFBp@cluster0.w0nmtjl.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("pawmart_db");
    const storesCollection = db.collection("stores");
    const categoriesCollection = db.collection("categories");
    const petsCollection = db.collection("pets");
    const petFoodCollection = db.collection("petfood");
    const accessoriesCollection = db.collection("accessories");
    const petCareProductsCollection =db.collection("petCareProducts");

    app.get("/stores", async (req, res) => {
      const cursor = storesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/recent-stores", async (req, res) => {
      const cursor = storesCollection.find().sort({ date: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/categories", async (req, res) => {
      const count = await categoriesCollection.countDocuments();
      if (count === 0) {
        // collection খালি হলে auto insert
        await categoriesCollection.insertMany([
          { name: "Pets", icon: "🐶", slug: "pets" },
          { name: "Pet Food", icon: "🍖", slug: "pet-food" },
          { name: "Accessories", icon: "🧸", slug: "accessories" },
          { name: "Pet Care Products", icon: "💊", slug: "pet-care-products" },
        ]);
      }

      const cursor = categoriesCollection.find(); // খালি filter মানে সব নেবে
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/pets', async(req, res)=>{
      const cursor = petsCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/petFood', async(req, res)=>{
      const cursor = petFoodCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    app.get('/accessories', async(req, res)=>{
      const cursor = accessoriesCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    app.get('/petProduct', async(req, res)=>{
      const cursor = petCareProductsCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    // ping
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Pawmart server listening on port: ${port}`);
});
