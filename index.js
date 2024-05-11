const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middleware setup
app.use(express.json());
app.use(
  cors({
    origin: [
      "wisdom-library-1acce.web.app",
      "http://localhost:5173",
      "http://localhost:5174",
      "wisdom-library-1acce.firebaseapp.com",
    ],
    credentials: true,
  })
);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.omgilvs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // database connection

    const booksCollection = client.db("wisdomBookDb").collection("allBooks");

    // api for insert a book information into allbooks collection
    app.post("/books", async (req, res) => {
      const data = req.body;
      const result = await booksCollection.insertOne(data);
      res.send(result);
    });

    //api for retrive all books infromation into allbooks collection
    app.get("/books", async (req, res) => {
      const result = await booksCollection.find().toArray();
      res.send(result);
    });

    // api for tetrive specific one book information into allbooks collectin
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.findOne(query);
      res.send(result);
    });

    // api for update specific data into allbooks colleciton
    app.patch("/book/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          bookName: data.name,
          photo: data.photo,
          authorName: data.name,
          catagory: data.catagory,
          rating: data.rating,
        },
      };
      const result = await booksCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//api for testing purpose
app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log("server is running");
});
