const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 9000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.40t0y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const jobsCollection = client.db("solosphere-db").collection("jobs");
    const bidsCollection = client.db("solosphere-db").collection("bids");

    // save add jobs data in db
    app.post("/add-jobs", async (req, res) => {
      const jobData = req.body;
      const result = await jobsCollection.insertOne(jobData);
      res.send(result);
    });

    // GET data in db
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });

    // Get all jobs by Specific USER
    app.get("/jobs/:email", async (req, res) => {
      const email = req.params.email;
      const query = { "buyer.email": email };
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });

    // delete posted job in db
    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    });

    // GET a single data from ID in DB
    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });
    // Update Job
    app.put("/update-job/:id", async (req, res) => {
      const id = req.params.id;
      const jobData = req.body;
      const updated = {
        $set: jobData,
      };
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const result = await jobsCollection.updateOne(filter, updated, options);
      res.send(result);
    });

    // save add bids data in db
    app.post("/add-bid", async (req, res) => {
      const bidData = req.body;
      // if a user placed a bid already in this job
      const query = { email: bidData.email, jobId: bidData.jobId };
      const alreadyExits = await bidsCollection.findOne(query);
      console.log("already bid this jobs", alreadyExits);
      if (alreadyExits) {
        return res
          .status(400)
          .send("You have already placed a bid in this job!");
      }
      // save data in Bids Collection in DB
      const result = await bidsCollection.insertOne(bidData);
      // Increase bid Count in jobs collection
      const filter = { _id: new ObjectId(bidData.jobId) };
      const update = {
        $inc: { bid_count: 1 },
      };
      const updateBidCount = await jobsCollection.updateOne(filter, update);
      res.send(result);
    });

    // Get a bids for Specific user and Bid requests for specific buyer
    app.get("/bids/:email", async (req, res) => {
      const isBuyer = req.query.buyer;
      const email = req.params.email;
      let query = {};
      if (isBuyer) {
        query.buyer = email;
      } else {
        query.email = email;
      }
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });

    // Patch in change Bid Status
    app.patch("/bid-status-update/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updated = {
        $set: { status },
      };
      const result = await bidsCollection.updateOne(filter, updated);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello from SoloSphere Server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
