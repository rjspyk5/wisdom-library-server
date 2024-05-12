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
    const borrowedBooksCollection = client
      .db("wisdomBookDb")
      .collection("borrowedBooks");
    const catagoryCollection = client
      .db("wisdomBookDb")
      .collection("categories");

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

    // api for retrive specific one book information into allbooks collectin
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
          authorName: data.author,
          catagory: data.catagory,
          rating: data.rating,
        },
      };
      const result = await booksCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //api for retrive specific category data from booksCollection
    app.get("/category/:category", async (req, res) => {
      const categoryName = req.params.category;
      const query = { catagory: categoryName };
      const result = await booksCollection.find(query).toArray();
      res.send(result);
    });

    // api for retrve catgories name from categoriesCollection
    app.get("/categories", async (req, res) => {
      const result = await catagoryCollection.find().toArray();
      res.send(result);
    });

    // api for retrive a user borrowCollection
    app.get("/borrow", async (req, res) => {
      const userEmail = req.query?.email;
      const query = { email: userEmail };
      const result = await borrowedBooksCollection.find(query).toArray();
      res.send(result);
    });

    //api for make borrowCollection insert and the same specific book quantity decrement
    app.post("/borrow/:id", async (req, res) => {
      const bookId = req.params.id;
      const email = req.body.email;
      // checking that in borrow collection this bookid with this useremail already have or not
      const query = { bookId: bookId, email: email };
      const isDuplicate = await borrowedBooksCollection.findOne(query);
      if (isDuplicate) {
        return res.send("duplicate request");
      }
      // insert borrow details

      const result = await borrowedBooksCollection.insertOne(req.body);
      const query2 = { _id: new ObjectId(bookId) };
      const result2 = await booksCollection.updateOne(query2, {
        $inc: { qunatity: -1 },
      });
      res.send(result2);
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
