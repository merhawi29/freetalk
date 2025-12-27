/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select the database to use.
use('freetalk');

// Insert a few documents into the sales collection.
db.users.insertOne({
    username: "anonymous_1",
    createdAt: new Date()
});
db.rooms.insertOne({
    name: "General",
    isGroup: true,
    createdAt: new Date()
});
db.messages.insertOne({
    roomId: "general",
    sender: "anonymous_1",
    text: "Hello FreeTalk 👋",
    createdAt: new Date()
});


// Run a find command to view items sold on April 4th, 2014.
const salesOnApril4th = db.users.find({
    createdAt: { $gte: new Date('2025-01-01'), $lt: new Date('2026-01-01') }
}).count();

// Print a message to the output window.
console.log(`${salesOnApril4th} users occurred in 2014.`);

// Here we run an aggregation and open a cursor to the results.
// Use '.toArray()' to exhaust the cursor to return the whole result set.
// You can use '.hasNext()/.next()' to iterate through the cursor page by page.
db.getCollection('users').aggregate([
    // Find all of the sales that occurred in 2014.
    { $match: { createdAt: { $gte: new Date('2025-01-01'), $lt: new Date('2026-01-01') } } },
    // Group the total sales for each product.
    { $group: { _id: '$item', totalSaleAmount: { $sum: { $multiply: ['$price', '$quantity'] } } } }
]);
db.messages.find({ roomId: "general" }).toArray();
