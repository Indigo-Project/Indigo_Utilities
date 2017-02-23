require('dotenv').config();

var MongoClient = require('mongodb').MongoClient
, assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var database = {

  // Indigo Dashboards Connection URI
  indigoDashboardsURI: {
    URI: process.env.MONGODB_DASHBOARDS_URI,
    name: 'indigodashboards'
  },

  indigoUsersCollKey: {
    // Internal Users
    'indigoAdmin': '_internal-users',
    'indigoTeam': '_internal-users',
    'indigoSample': '_internal-users',
    // Indigo School (Sample) Users
    'indigoSchoolAdmin': 'indigo-school-users',
    'indigoSchoolCounselor': 'indigo-school-users',
    'indigoSchoolTeacher': 'indigo-school-users',

    // SCHOOL USERS

    // ASU Prep
    // GALS
  },

  dashCollExceptions: ["system.indexes", "objectlabs-system", "objectlabs-system.admin.collections", "_internal-users", "asu-prep-users","gals-users","indigo-school-users"],

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
  getDataOrDashboardRefMetaData: function(db, collection, collType) {
    return new Promise(function(resolve, reject) {
      db.collection(collection, function(err, collection) {
        collection.find().toArray(function(err, documents) {
          if (err) {
            reject(err)
          } else {
            var metaDataReturn = {};
            for (var i = 0; i < documents.length; i++) {
              if (collType === 'dash') {
                metaDataReturn[documents[i].metaData.dashboardTitle] = documents[i].metaData;
                metaDataReturn[documents[i].metaData.dashboardTitle].id = documents[i]._id;
                // metaDataReturn[documents[i].id] = documents[i]._id;
              } else if (collType === 'data') {
                metaDataReturn[documents[i].metaData.dataObjectTitle] = documents[i].metaData;
                metaDataReturn[documents[i].metaData.dataObjectTitle].id = documents[i]._id;
              }
            }
            console.log('metaDataReturn', metaDataReturn);
            resolve(metaDataReturn);
          }
        })
      })
    })
  },

  // Add new dashboard object to school collection (already connected to DB)
  addDashboardDataObj: function(db, data, dataColl, dashboardVersionName) {
    return new Promise(function(resolve, reject) {

      // console.log('adding dashboard...');
      console.log(dataColl);

      // Access collection. If collection does not exist, create it and access it.
      function enterCollection() {
        return new Promise(function(resolve, reject) {

          var dashboardCollection;

          db.collection(dataColl, {strict: true}, function(err, collection) {
            if (err) {
              if (err.message === 'Collection ' + dataColl + ' does not exist. Currently in strict mode.') {
                // console.log(dataColl + ' collection does not exist. Create ' + dataColl + ' collection');
                db.createCollection(dataColl, function(err, collection) {
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
              // console.log(dataColl + ' collection exists', dashboardCollection);
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
              data.metaData.dataObjectTitle = dashboardVersionName;
            }

            collection.insertOne(data, function(err, result) {
              if (assert.equal(err, null) === undefined) {
                resolve({
                  message: "added dashboard to " + dataColl +  " collection",
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
          console.log('result', result);
          // console.log('result dataId', result.result.insertedId);
          if (result) resolve(result.result.insertedId);
        })
      })
    })
  },

  addDashboardRefAndDashDataAssignment: function(db, dashboardRefObj) {
    return new Promise(function(resolve, reject) {
      var dashCollection = dashboardRefObj.metaData.schoolInfo.code + '-dash';
      var dataCollection = dashboardRefObj.metaData.schoolInfo.code + '-data'
      var currentDataObjDashboardAssignment = [dashboardRefObj.metaData.dashboardTitle, ""];
      var allDataObjDashboardAssignments;

      // Enter dashboard collection and insert dashboard reference object
      db.collection(dashCollection, function(err, collection) {

        if (err) {
          console.log('COLLECTION ERR', err);
        } else {

          collection.insertOne(dashboardRefObj, function(err, result) {

            if (assert.equal(err, null) === undefined) {

              // set new dashboardAssignment array to be added to Data Obj
              currentDataObjDashboardAssignment[1] = ObjectId(result.insertedId).toString();

              // enter data collection and update dashboardAssignments array
              db.collection(dataCollection, function(err, collection) {

                if (err) {
                  console.log('COLLECTION ERR', err);
                } else {

                  var dataObjId = dashboardRefObj.metaData.dataReference[1];
                  console.log('dataObjId', dataObjId);

                  collection.findOneAndUpdate({"_id": ObjectId(dataObjId)}, {$push: {'metaData.dashboardAssignments': currentDataObjDashboardAssignment}}, function(err, result) {

                    if (assert.equal(err, null) === undefined) {
                      console.log(result);

                        if (assert.equal(err, null) === undefined) {
                          resolve({
                            message: "inserted dashboardReference " + dashCollection +  " and updated dashboardAssignments for Data Object",
                            result: result
                          })
                        } else {
                          reject("Failed to update dashboardAssignments Object");
                        }
                    } else {
                      reject("Failed to find dashboard data collection");
                    }
                  })
                }
              })
            } else {
              reject("Failed to add dashboard reference to -dash collection");
            }
          })
        }
      })
    })
  },

  // Update notes for dashboard manager version
  updateDashboardManagerNotes: function(db, collection, version, notes) {
    console.log('notes data', collection, version, notes);

    db.collection(collection, function(err, collection) {
      if (err) {
        // console.log('COLLECTION ERR', err);
      } else {

        console.log('COLLECTION FOUND');

        collection.indexes(function(err, indexes) {
          console.log(err, indexes);
        })

        collection.indexExists('_id_', function(err, result) {
          console.log(err, result);
        })

        collection.findOneAndUpdate( {'metaData.version': version}, {$set: {'metaData.managerNotes': notes}}, function(err, result) {
          // test.equal(null, err);
          // test.equal(1, result.lastErrorObject.n);
          // test.equal(1, result.value.b);
          // test.equal(1, result.value.d);
          if (err) {
            console.log('findOneAndUpdate ERR', err);
          } else {
            console.log('findOneAndUpdate SUCCESS', result);
          }
        })
      }
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
  getDashboardDataFromDashRef: function(db, schoolCode, dashRefId) {

    return new Promise(function(resolve, reject) {

      var dataObjId;

      db.collection(schoolCode + '-dash', function(err, collection) {
        collection.findOne({"_id": ObjectId(dashRefId) }, function(err, doc) {
          if (err) {
            reject(err);
          } else {
            dataObjId = doc.metaData.dataReference[1];
            db.collection(schoolCode + '-data', function(err, collection) {
              if (err) {
                reject(err);
              } else {
                collection.findOne({"_id": ObjectId(dataObjId)}, function(err, doc) {
                  if (err) {
                    reject(err);
                  } else {
                    var dashDataObj = { metaData: doc.metaData, compiledData: doc.compiledData };
                    resolve(dashDataObj);
                  }
                });
              }
            });
          }
        });
      });

    })
  },

  locateLoginCredentialsByUsername: function(db, username) {
    return new Promise(function(resolve, reject) {
      var collection = database.indigoUsersCollKey[username]
      console.log(collection);

      db.collection(collection, function(err, collection) {
        collection.findOne({ username: username }, function(err, doc) {
          if (err) {
            console.log('findOne Error', err);
          } else if (!doc) {
            reject('collection.findOne returned null')
          } else {
            resolve(doc);
          }
        })
      })
    })
  },

  toggleDashboardDataActivationStatus: function(db, status, schoolCode, id) {
    return new Promise(function(resolve, reject) {
      var collection = schoolCode + '-data';
      console.log(status, collection, id);

      db.collection(collection, function(err, collection) {
        if (err) {
          console.log('COLLECTION ERR', err);
        } else {
          collection.findOneAndUpdate({ "_id": ObjectId(id) }, { $set: { 'metaData.activated': status }}, function(err, doc) {
            if (err) {
              console.log('findOne Error', err);
            } else if (!doc) {
              reject('collection.findOne returned null')
            } else {
              // console.log('doc', doc);
              resolve(doc);
            }
          })
        }
      })
    })
  }
}



module.exports = database;
