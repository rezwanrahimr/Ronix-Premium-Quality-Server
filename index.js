
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require('mongodb');
const res = require('express/lib/response');

app.use(cors());
app.use(express.json());


// Databas


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.71tsv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const toolsCollection = client.db("Ronix").collection("tools");
        const reviewsCollection = client.db("Ronix").collection("review");

        // get all tools items.
        app.get("/tools",async(req,res)=>{
            const quarry = {};
            const cursor = toolsCollection.find(quarry);
            const tools = await cursor.toArray();
            res.send(tools);
        })

          // add a new tools
          app.post("/tools", async (req, res) => {
            const addNewItem = req.body;
            const result = await toolsCollection.insertOne(addNewItem);
            res.send(result);
          });

        //  get a spacipic tools
        app.get("/tools/:id",async(req,res) =>{
            const id = req.params.id;
            const quarry = { _id: ObjectId(id)};
            const cursor = toolsCollection.find(quarry);
            const tools = await cursor.toArray();
            res.send(tools);
        })

        // Avilabe Quantity decrease.
        app.post("/available/:id",async(req,res) => {
            if(Number(req.body.availableQuantity < 0)){
                res.send({status: 0, message: 'Oops! Stock out'});
                return;
            }

            const id = req.params.id;
            const quarry = {_id: ObjectId(id)};
            const result = await toolsCollection.updateOne(quarry,{
                $set: { availableQuantity: req.body.availableQuantity}
            });
            if(result.modifiedCount > 0){
                res.send({ status: 1, message: "Order place successfully"});
            }
            else{
                res.send({status: 0, message: "order place Faild"})
            }
            
        });

        // increase Quantity.
        app.post("/increase/:id",async(req,res) => {
            if(Number(req.body.availableQuantity < 0)){
                res.send({status: 0, message: "Oops! Restock Faild"});
                return;
            }
            const {availableQuantity,stock} = req.body;
            const id = req.params.id;
            const quarry = {_id: ObjectId(id)};
            const result = await toolsCollection.updateOne(quarry,{
                $set: {availableQuantity: Number(availableQuantity) + Number(stock)},
            });
            if(result.modifiedCount > 0){
                res.send({status: 1, message: "restock successfully"});
            }
            else{
                res.send({status: 0,message:"restock faild"});
            }
        });

        // Insert Reviews.
        app.post("/review",(req,res) =>{
            reviewsCollection.insertOne(req.body, (err)=>{
                if(err){
                    res.send(err);
                }
                else{
                    res.send({
                        status: 1,
                        message: "successfully insert one",
                    })
                }
            })
        });

        // get all review
        app.get("/review",async(req,res)=>{
            const quarry = {};
            const cursor = reviewsCollection.find(quarry);
            const review = await cursor.toArray();
            res.send(review);
        })

      
    }
    finally{

    }
    
}
// call run function.
run().catch(console.dir);
app.get("/",(req,res) => {
    res.send("Running..");
});
app.listen(port,()=>{
    console.dir("Running..",port);
})