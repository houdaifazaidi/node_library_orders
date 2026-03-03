// Import express
const express = require("express");
const app = express();
const { ObjectId } = require("mongodb");
const axios = require("axios");


const cors = require("cors");
app.use(cors());
// Import Order model
require("./Order");

// Import mongoose
const mongoose = require("mongoose");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// app.use(function(req, res, next){
//     res.header("Access-Control-Allow-Origin", "*")
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
//     next()
// })

// Connect to MongoDB
const uri = "mongodb+srv://houdaifazaidi04_db_user:xmWwoqrHcc1SakEo@cluster0.pufzrga.mongodb.net/?appName=Cluster0";

mongoose.connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection failed", err));

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to orders service");
});

// Get Order model
const Order = mongoose.model("Order");

// Add new order
app.post("/order", (req, res) => {

  const newOrder = {
    CustomerID: new ObjectId(req.body.CustomerID),
    BookID: new ObjectId(req.body.BookID),
    initialDate: req.body.initialDate,
    deliveryDate: req.body.deliveryDate
  };

  const order = new Order(newOrder);

  order.save()
    .then(() => {
      console.log("Order created");
      res.json({ message: "New order added" });
    })
    .catch(err => {
      res.status(500).json({ error: "Error creating order" });
    });

});

// Get all orders
app.get("/orders", (req, res) => {

  Order.find()
    .then(orders => {
      res.json({ orders: orders });
    })
    .catch(err => {
      res.status(500).json({ error: "Error fetching orders" });
    });

});

// Get order details by id
app.get("/order/:id", (req, res) => {

  Order.findById(req.params.id)
    .then(order => {

      axios.get("https://node-library-customers.vercel.app/customers/" + order.CustomerID)
        .then((response) => {

          let orderObject = {
            customerName: response.data.customer.name,
            bookTitle: ""
          };

          axios.get("https://node-library-books.vercel.app/books/" + order.BookID)
            .then((response) => {

              orderObject.bookTitle = response.data.book.title;

              res.json({ order: orderObject });

            })
            .catch(err => {
              res.status(500).json({ error: "Error fetching book" });
            });

        })
        .catch(err => {
          res.status(500).json({ error: "Error fetching customer" });
        });

    })
    .catch(err => {
      res.status(500).json({ error: "Invalid ID" });
    });

});

// Start server
// app.listen(4444, () => {
//   console.log("Server running on port 4444");
// });


module.exports = app