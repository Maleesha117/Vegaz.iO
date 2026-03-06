const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://maleesha0007_db_user:wu5v89W5rdpAK2jv@vegazio.fttgozo.mongodb.net/";

async function run() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("✅ Connected successfully via Node.js");
    await client.close();
  } catch (err) {
    console.dir(err);
  }
}
run();
