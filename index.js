require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


// Connect to MongoDB
mongoose.connect('mongodb://localhost:5000/houseHunter', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
});


const User = mongoose.model('User', userSchema);


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l9kydno.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const houseCollection = client.db("houseHunter").collection("house")

    app.get('/house', async(req, res) => {
      const result = await houseCollection.find().toArray()
      res.send(result)
    })

    app.post('/house', async(req, res) => {
      const allHouse = req.body;
      const result = await houseCollection.insertOne(allHouse)
      res.send(result)
    })

    app.delete('/house/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await houseCollection.deleteOne(query)
      res.send(result)
    })

    // User Registration Endpoint
    app.post('/register', async (req, res) => {
      try {
        const { name, email, password, role } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({
          name,
          email,
          password: hashedPassword,
          role,
        });

        // Save the user to the database
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    


    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('House Hunter is here')
})

app.listen(port, () => {
    console.log(`House Hunter is running on port ${port}`);
})