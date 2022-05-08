const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0ab2n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    client.connect();
    const vehicleCollection = client.db("WarVehicles").collection("vehicles");

    //function to verify jwt token
    function VerifyJsonWebToken(req, res, next) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized acces" });
      }
      
      jwt.verify(authHeader, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).send({ message: "Forbidden Access" });
        }
        req.decoded = decoded;
        next();
      });
    }

    //login with JSON WEB TOKEN

    app.post("/loginWithWebToken", async (req, res) => {
      const user = req.body;
      const accessJwtToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessJwtToken });
    });

    //api to get all data
    app.get("/allvehicles", async (req, res) => {
      const query = {};
      const cursor = vehicleCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    //api to get one single item
    app.get("/vehicle/:vehicleId", async (req, res) => {
      const itemId = req.params.vehicleId;
      const query = { _id: ObjectId(itemId) };
      const item = await vehicleCollection.findOne(query);
      res.send(item);
    });
    //api to handle restock
    app.put("/restockvehicle/:id", async (req, res) => {
      const id = req.params.id;
      const updatedVehicle = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: updatedVehicle.name,
          user: updatedVehicle.user,
          category: updatedVehicle.category,
          description: updatedVehicle.description,
          image: updatedVehicle.image,
          price: updatedVehicle.price,
          quantity: updatedVehicle.quantity,
          sold: updatedVehicle.sold,
          supplierName: updatedVehicle.supplierName,
        },
      };
      const result = await vehicleCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    //api to handle deliver
    app.put("/delivervehicle/:id", async (req, res) => {
      const id = req.params.id;
      const updatedVehicle = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: updatedVehicle.name,
          category: updatedVehicle.category,
          description: updatedVehicle.description,
          image: updatedVehicle.image,
          price: updatedVehicle.price,
          quantity: updatedVehicle.quantity,
          sold: updatedVehicle.sold,
          supplierName: updatedVehicle.supplierName,
        },
      };
      const result = await vehicleCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    //api to handle add item
    app.post("/addVehicle", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await vehicleCollection.insertOne(data);
      res.send(result);
    });

    //api to get product using query
    app.get("/getVehicles", async (req, res) => {
      const query = req.query;
      const cursor = vehicleCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //api to get myitems with verifying jwt

    app.get("/getUserItems", VerifyJsonWebToken, async (req, res) => {
      const decodedEmail = req.decoded.email;
      console.log(decodedEmail);
      const email = req.query.user;
      const filter = req.query;
      if (decodedEmail === email) {
        const cursor = vehicleCollection.find(filter);
        const result = await cursor.toArray();
        res.send(result);
      }
      else{
        res.status(403).send({message: 'Forbidden Access'});
      }
    });

    //api to delete vehicle
    app.delete("/vehicleDlete/:vehicleId", async (req, res) => {
      const id = req.params.vehicleId;
      const query = { _id: ObjectId(id) };
      const result = await vehicleCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Service is running good!!!");
});

app.listen(port, () => {
  console.log("Server is running at port", port);
});
