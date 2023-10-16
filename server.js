const express = require('express');
const cors = require('cors');
const {MongoClient} = require('mongodb');
const jwt = require('jsonwebtoken');


const app = express();
const port = 3002;
const uri = 'mongodb+srv://paztabachnik:TPaBf3lNPHopwKTy@cluster0.rdahwvr.mongodb.net/?retryWrites=true&w=majority';
const mongoClient = new MongoClient(uri);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({port}));


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


async function getAllDishes() {
    const mongoClient = new MongoClient(uri);
    try {
        const collection = mongoClient.db('restaurant_menu').collection('dishes');
        const result = await collection.find({}).toArray();
        return result;
    } catch (e) {
        console.error(e);
    } finally {
        await mongoClient.close();
    }
}

// מסלול לקבלת רשימת המנות
app.get('/api', async (req, res) => {
    try {
        const list = await getAllDishes();
        console.log(list)
        res.json(list);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


app.post('/login', async (req, res) => {
    const {name, password} = req.body;
    const mongoClient = new MongoClient(uri);

    try {
        const collection = mongoClient.db('restaurant_menu').collection('user');
        const user = await collection.findOne({name: name, password: password});

        if (user) {
            const token = jwt.sign({username: user.name}, 'your-secret-key');
            res.json({user, token});
        } else {
            res.json("not exist");
        }
    } catch (e) {
        console.log(e)
        res.json(e);
        console.log(e)
    } finally {
        await mongoClient.close();
    }
});

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({error: 'Unauthorized'});

    jwt.verify(token, 'your-secret-key', (err, user) => {
        if (err) return res.status(403).json({error: 'Forbidden'});

        req.user = user;
        next();
    });
}

app.get('/protected', verifyToken, (req, res) => {
    res.json({message: 'This is a protected route', user: req.user});
});
// מסלול להרשמה
app.post("/signup", async (req, res) => {
    const {name, password} = req.body;
    const mongoClient = new MongoClient(uri);

    try {
        const collection = mongoClient.db('restaurant_menu').collection('user');
        const user = await collection.findOne({name: name});
        if (user) {
            res.json("exist");
        } else {
            await collection.insertOne({name: name, password: password, dishes: " ", total: "",guests:""});
            res.json("not exist");
        }
    } catch (e) {
        res.json("fail");
    } finally {
        await mongoClient.close();
    }
});

// מסלול לעדכון מנות מבוצעות
app.post("/addDishesToDB", async (req, res) => {
    const {userName, select, total} = req.body;
    const mongoClient = new MongoClient(uri);

    try {
        const collection = mongoClient.db('restaurant_menu').collection('user');
        await collection.updateOne({name: userName}, {$set: {dishes: select, total: total}});
    } catch (e) {
        res.json("fail");
    } finally {
        await mongoClient.close();
    }
});
app.post("/saveDishes", async (req, res) => {
    const { userName } = req.body;
    const mongoClient = new MongoClient(uri);

    try {
        const collection = mongoClient.db('restaurant_menu').collection('user');
        const user = await collection.findOne({ name: userName });
        if (user) {
            console.log("User found:", user);
            res.json({ user });
        } else {
            console.log("User not found in the database.");
            res.json("not exist");
        }
    } catch (e) {
        console.error("Error while querying the database:", e);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        await mongoClient.close();
    }
});
app.post("/addGuests", async (req, res) => {
    const {userName,guests} = req.body;
    const mongoClient = new MongoClient(uri);

    try {
        const collection = mongoClient.db('restaurant_menu').collection('user');
        await collection.updateOne({name: userName}, {$set: {guests:guests}});
    } catch (e) {
        res.json("fail");
    } finally {
        await mongoClient.close();
    }
});