const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY
});

const database = client.database("CloudPassDB");
const usersContainer = database.container("Users");
const passesContainer = database.container("BusPasses");

module.exports = { usersContainer, passesContainer };