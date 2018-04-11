//jshint esversion: 6
const MongoClient = require('mongodb').MongoClient;

module.exports = (function () {

  const findDocuments = function (dbName, colxn, condition, options = {}) {
    let projection = options.projection || {};
    const sort = options.sort;
    const limit = options.limit;

    projection = Object.assign({}, projection, { _id: 0 }); // never return _id

    // Get the documents collection
    return new Promise((resolve, reject) => {
      const url = `mongodb://localhost:27017/${dbName}`;
      MongoClient.connect(url, function (err, db) {
        if (err) {
          reject(err);
        } else {
          try {
            const collection = db.collection(colxn);
            // Find some documents
            let cursor = collection.find(condition, projection);

            if (sort) {
              cursor = cursor.sort(sort);
            }

            if (limit) {
              cursor = cursor.limit(limit);
            }

            cursor.toArray(function (err, docs) {
              if (err) {
                reject(err);
              } else {
                resolve(docs);
              }
              db.close();
            });
          } catch (error) {
            reject(error);
            db.close();
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
      MongoClient.connect(url, function (err, db) {
        if (err) {
          reject(err);
        } else {          
          const collection = db.collection(colxn);          
          collection.insertMany(documents, opts, function (err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
            db.close();
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
      MongoClient.connect(url, function (err, db) {
        if (err) {
          reject(err);
        } else {          
          const collection = db.collection(colxn);          
          collection.insertOne(document, opts, function (err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
            db.close();
          });        
        }
      });
    });
  };  

  const updateDocument = function (dbName, colxn, condition, update, options = {}) {

    const opts = Object.assign({}, {}, options);
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
      MongoClient.connect(url, function (err, db) {
        if (err) {
          reject(err);
        } else {
          const collection = db.collection(colxn);
          if (opts.updateMany) {
            collection.updateMany(condition, updateOperation, opts, function (err, result) {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
              db.close();
            });
          } else {
            collection.updateOne(condition, updateOperation, opts, function (err, result) {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
              db.close();
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
        MongoClient.connect(url, function (err, db) {
          if (err) {
            reject(err);
          } else {
            const collection = db.collection(colxn);
            collection.deleteOne(condition, opts, function (err, result) {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
              db.close();
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
    updateDocuments,
    deleteDocument
  };
})();