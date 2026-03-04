const { MongoClient } = require('mongodb');
require('dotenv').config();

// TODO: Add your MongoDB connection string to a .env file
const uri = process.env.MONGODB_URI || "mongodb+srv://narendrayadav1st:[EMAIL_ADDRESS]/?appName=Cluster0";

const client = new MongoClient(uri);

let db;

const connectDB = async () => {
    if (db) {
        return db;
    }
    try {
        await client.connect();
        db = client.db(); // You can specify a database name here if not in the URI
        console.log("Connected to MongoDB");
        return db;
    } catch (error) {
        console.error("Could not connect to MongoDB", error);
        process.exit(1);
    }
};

module.exports = connectDB;
