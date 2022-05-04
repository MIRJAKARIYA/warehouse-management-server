const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://ARMY_WAREHOUSE:xvNCe7I5jfwGCH5r@cluster0.0ab2n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        client.connect();
        const vehicleCollection = client.db("WarVehicles").collection("vehicles");
        //api to get all data
        app.get('/allvehicles', async(req, res)=>{
            const query = {};
            const cursor = vehicleCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        //api to get one single item
        app.get('/vehicle/:vehicleId', async(req, res)=>{
            const itemId = req.params.vehicleId;
            const query = {_id:ObjectId(itemId)};
            const item = await vehicleCollection.findOne(query);
            res.send(item);
        })
    }
    finally{

    }
    
}
run().catch(console.dir);
app.get('/', (req, res)=>{
    res.send('Service is running good!!!');
});

app.listen(port, ()=>{
    console.log('Server is running at port',port)
})