const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const port =3001;
const uri = 'mongodb+srv://paztabachnik:TPaBf3lNPHopwKTy@cluster0.rdahwvr.mongodb.net/?retryWrites=true&w=majority';


app.use(cors());

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

async function getAllDishes() {
    const mongoClient = new MongoClient(uri);
    try {
        await mongoClient.connect();
        const collection = mongoClient.db('restaurant_menu').collection('dishes');
        const result = await collection.find({}).toArray();
        return result;
    } catch (e) {
        console.error(e);
    } finally {
        await mongoClient.close();
    }
}

app.get('/api',  (req, res) => {
    try {
        getAllDishes().then(list =>{
            console.log("hell",list)
            res.json(list);
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
