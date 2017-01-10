require('dotenv').config();

var MongoClient = require('mongodb').MongoClient
, assert = require('assert');

var database = {

  // Indigo Dashboards Connection URI
  indigoDashboardsURI: {
    URI: process.env.MONGODB_DASHBOARDS_URI,
    name: 'indigodashboards'
  },

  // Establish connection to Mongo Database
  mongoDBConnect: function(url) {
    return new Promise(function(resolve,reject) {
      MongoClient.connect(url.URI, function(err, db) {
        if(assert.equal(null, err) === undefined) {
          resolve({
            message: "Connected successfully to " + db.databaseName + " mLabs MongoDB server",
            db: db
          })
        } else {
          reject("Failed to connect to " + db.databaseName + " mLabs MongoDB server");
        }
      });
    })
  },

  // Disconnect from Database
  mongoDBDisconnect: function(db) {
    db.close();
    console.log('disconnected from ' + db.databaseName);
  },

  // Get all school dashboard collections
  getDashboardCollections: function(db) {
    return new Promise(function(resolve, reject) {
      var returnCollections;
      db.collections(function(err, collections) {
        if (err) {
          reject(err)
        } else {
          resolve(collections);
        }
      })
    })
  },

  // Get all versions in school dashboard collection
  getDashboardVersions: function(db, collection) {
    return new Promise(function(resolve, reject) {
      db.collection(collection, function(err, collection) {
        collection.find().toArray(function(err, documents) {
          if (err) {
            reject(err)
          } else {
            var metaDataReturn = {};
            for (var i = 0; i < documents.length; i++) {
              metaDataReturn[documents[i].metaData.version] = documents[i].metaData;
            }
            resolve(metaDataReturn);
          }
        })
      })
    })
  },

  // Add new dashboard object to school collection (already connected to DB)
  addDashboard: function(db, data, schoolCode, dashboardVersionName) {
    return new Promise(function(resolve, reject) {
      // console.log('adding dashboard...');

      // Access collection. If collection does not exist, create it and access it.
      function enterCollection() {
        return new Promise(function(resolve, reject) {

          var dashboardCollection;

          db.collection(schoolCode, {strict: true}, function(err, collection) {
            if (err) {
              if (err.message === 'Collection ' + schoolCode + ' does not exist. Currently in strict mode.') {
                // console.log(schoolCode + ' collection does not exist. Create ' + schoolCode + ' collection');
                db.createCollection(schoolCode, function(err, collection) {
                  dashboardCollection = collection;
                  // console.log('recently created collection', dashboardCollection);
                  if (dashboardCollection) resolve(dashboardCollection);
                })
              } else {
                // console.log('unidentified error - no collection created. check logs');
                reject();
              }
            }
            else {
              dashboardCollection = collection;
              // console.log(schoolCode + ' collection exists', dashboardCollection);
              if (dashboardCollection) resolve(dashboardCollection);
            }
          });
        })
      }

      // Add Dashboard Data Object to School Collection
      function insertDashboardData(collection) {
        return new Promise(function(resolve, reject) {
          var version;
          collection.find().toArray(function(err, documents) {

            if (dashboardVersionName) {
              data.metaData.version = dashboardVersionName;
            } else {
              if (!documents.length) {
                version = 1;
              } else {
                version = documents.length + 1;
              }
              data.metaData.version = "version " + version;
            }

            collection.insertOne(data, function(err, result) {
              if (assert.equal(err, null) === undefined) {
                resolve({
                  message: "added dashboard to " + schoolCode +  " collection",
                  result: result
                })
              } else {
                reject("Failed to add dashboard to collection");
              }
            });

          })
        })
      }

      enterCollection()
      .then(function(collection) {
        insertDashboardData(collection)
        .then(function(result) {
          // console.log('result', result);
          // console.log('result dataId', result.result.insertedId);
          if (result) resolve(result.result.insertedId);
        })
      })
    })
  },

  // Get document by Id
  getDocumentById: function(db, schoolCode, id) {
    return new Promise(function(resolve, reject) {
      // console.log('getting document...');
      db.collection(schoolCode, {strict: true}, function(err, collection) {
        if (err) {
        } else {
          collection.findOne({_id: id}, function(err, doc) {
            if (err) {
              reject(err)
            } else if (doc) {
              resolve(doc)
            }
          })
        }
      })
    })
  },

  // Get dashboard data with school code and collectionIdentifier
  getDashboardData: function(db, schoolCode, dataId, idOption) {
    // console.log('179', schoolCode, dataId, idOption);
    return new Promise(function(resolve, reject) {
      db.collection(schoolCode, function(err, collection) {
        collection.find().toArray(function(err, docs) {
          // console.log('docs', docs);
          var id;
          if (idOption === "version") {
            for (var i = 0; i < docs.length; i++) {
              if(docs[i].metaData.version === dataId) {
                id = docs[i]._id;
                // console.log('id =', id);
              }
            }
          } else if (idOption === "id") {
            for (var i = 0; i < docs.length; i++) {
              // console.log(docs[i]._id.toString(), dataId);
              if(docs[i]._id.toString() === dataId) {
                // console.log('MATCH');
                id = docs[i]._id;
              }
            }
          }
          // console.log('ID', id, toString.call(id), id.length);
          // console.log('docs', docs);
          collection.findOne({_id: id}, function(err, doc) {
            if (err) {
              reject(err);
            } else {
              // console.log('doc', doc);
              resolve(doc);
            }
          })
        })
      })
    })
  }

}

module.exports = database;
