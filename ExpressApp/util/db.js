//jshint esversion: 6
const MongoClient = require('mongodb').MongoClient;

module.exports = (function () {

  const findDocuments = function (dbName, colxn, condition, options = {}) {
    let projection = options.projection || {};
    projection = Object.assign({}, projection, { _id: 0 }); // never return _id
    options.projection = projection;

    // Get the documents collection
    return new Promise((resolve, reject) => {
      const url = `mongodb://localhost:27017/${dbName}`;
      MongoClient.connect(url, function (err, client) {
        if (err) {
          reject(err);
        } else {
          try {
            const db = client.db(dbName);
            const collection = db.collection(colxn);
            // Find some documents
            let cursor = collection.find(condition, options);

            cursor.toArray(function (err, docs) {
              if (err) {
                reject(err);
              } else {
                resolve(docs);
              }
              client.close();
            });
          } catch (error) {
            reject(error);
            client.close();
          }
        }
      });
    });
  };

  const insertDocuments = function (dbName, colxn, documents, options = {}) {
    const opts = Object.assign({}, {}, options);
    // update ONE document in the collection
    return new Promise((resolve, reject) => {
      const url = `mongodb://localhost:27017/${dbName}`;
      MongoClient.connect(url, function (err, client) {
        if (err) {
          reject(err);
        } else {          
          const db = client.db(dbName);
          const collection = db.collection(colxn);          
          collection.insertMany(documents, opts, function (err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
            client.close();
          });        
        }
      });
    });
  };

  const insertDocument = function (dbName, colxn, document, options = {}) {
    const opts = Object.assign({}, {}, options);
    // update ONE document in the collection
    return new Promise((resolve, reject) => {
      const url = `mongodb://localhost:27017/${dbName}`;
      MongoClient.connect(url, function (err, client) {
        if (err) {
          reject(err);
        } else {          
          const db = client.db(dbName);
          const collection = db.collection(colxn);          
          collection.insertOne(document, opts, function (err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
            client.close();
          });        
        }
      });
    });
  };  

  const updateDocument = function (dbName, colxn, condition, update, options = {}) {

    const opts = Object.assign({}, {upsert: false}, options);
    let updateOperation = { $set: update }; // simple default use case
    if (opts.updateType === "complex") { // this represents intentionality
      delete opts.updateType;
      // if updateType is marked complex defer to caller for a complete
      // update operator specification, rather than a simple $set operation
      updateOperation = update;
    }

    // update ONE document in the collection
    return new Promise((resolve, reject) => {
      const url = `mongodb://localhost:27017/${dbName}`;
      MongoClient.connect(url, function (err, client) {
        if (err) {
          reject(err);
        } else {
          const db = client.db(dbName);
          const collection = db.collection(colxn);
          if (opts.updateMany) {
            collection.updateMany(condition, updateOperation, opts, function (err, result) {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
              client.close();
            });
          } else {
            collection.updateOne(condition, updateOperation, opts, function (err, result) {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
              client.close();
            });
          }
        }
      });
    });
  };

  const deleteDocument = function (dbName, colxn, condition, options = {}) {

    const opts = Object.assign({}, {}, options);

    // only allow deletion by specific fields
    let errorMessage = null;
    // switch(colxn){
    // ... case logic for valid delete conditions ...
    // ... if not allowed set errorMessage to explanation ...
    // }

    // delete ONE document in the collection
    return new Promise((resolve, reject) => {
      if (!errorMessage) {
        const url = `mongodb://localhost:27017/${dbName}`;
        MongoClient.connect(url, function (err, client) {
          if (err) {
            reject(err);
          } else {
            const db = client.db(dbName);
            const collection = db.collection(colxn);
            collection.deleteOne(condition, opts, function (err, result) {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
              client.close();
            });
          }
        });
      } else {
        reject(new Error(errorMessage));
      }
    });
  };

  return {
    findDocuments,
    insertDocument,
    insertDocuments,
    updateDocument,
    deleteDocument
  };
})();