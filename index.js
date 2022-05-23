
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json());


// Databas


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.71tsv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const toolsCollection = client.db("Ronix").collection("tools");

        // get tools.
        app.get("/tools",async(req,res)=>{
            const quarry = {};
            const cursor = toolsCollection.find(quarry);
            const tools = await cursor.toArray();
            res.send(tools);
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