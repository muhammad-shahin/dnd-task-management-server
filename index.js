const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.port || 5000;

// middleware
app.use(
  cors({
    origin: 'https://dnd-task-management.web.app',
    credentials: true,
    methods: ['GET', 'POST', 'UPDATE', 'PUT', 'DELETE'],
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Task Data Will Add Soon');
});
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.clucrnq.mongodb.net/?retryWrites=true&w=majority`;

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

    const database = client.db('TaskManagementDB');
    const taskCollection = database.collection('taskCollection');

    // (new) generate token on authentication
    app.post('/jwt', async (req, res) => {
      try {
        const user = req.body;
        console.log('User id : ', user);
        const token = jwt.sign(user, process.env.TOKEN_SECRET, {
          expiresIn: '30d',
        });
        res.send({
          status: true,
          message: 'Token Created Successfully',
        });
      } catch (error) {
        res.send({
          status: true,
          error: error.message,
        });
      }
    });

    // add new task
    app.post('/add-task', async (req, res) => {
      try {
        const task = req.body;
        const result = await taskCollection.insertOne(task);
        res
          .status(201)
          .send({ success: true, message: 'Task Added Successfully' });
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .send({ success: false, message: 'Failed to Add the Task' });
      }
    });

    // get all task by user id
    app.get('/all-tasks', async (req, res) => {
      try {
        const result = await taskCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .send({ success: false, message: 'Failed to Get all task by id' });
      }
    });
    // get all task by user id
    app.get('/all-tasks/:userId', async (req, res) => {
      try {
        const userId = req.params.userId;
        const query = { taskOf: userId };
        const result = await taskCollection.find(query).toArray();
        res.status(200).send(result);
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .send({ success: false, message: 'Failed to Get all task by id' });
      }
    });

    // update task by id
    app.put('/update-task/:taskId', async (req, res) => {
      try {
        const taskId = req.params.taskId;
        console.log(taskId);
        const query = {
          _id: new ObjectId(taskId),
        };
        const options = { upsert: true };
        const updatedTask = req.body;
        console.log(updatedTask);
        const task = {
          $set: { ...updatedTask },
        };
        const result = await taskCollection.updateOne(query, task, options);
        res.status(201).send(result);
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .send({ success: false, message: 'Failed to update task by id' });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);

app.listen(port, () => {
  console.log('Server is Running On Port ', port);
});
