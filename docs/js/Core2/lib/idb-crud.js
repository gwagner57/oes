/*******************************************************************************
 * IndexedDB CRUD
 * Based on Jake Archibald's IDB version 5
 *
 * @copyright Copyright 2020 Gerd Wagner
 *   Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license The MIT License (MIT)
 * @author Gerd Wagner
 ******************************************************************************/

const idbc = {};
/*******************************************************************
 * Create an empty IndexedDB
 *
 * @method
 * @author Gerd Wagner
 *******************************************************************/
idbc.createEmptyDB = async function (dbName, tableNames) {
  idbc.dbName = dbName;
  idbc.db = await idb.openDB( sim.model.name, 1, {
    upgrade(db) {
      tableNames.forEach( function (tn) {
        if (!db.objectStoreNames.contains( tn)) {
          db.createObjectStore( tn, {keyPath: "id"});
        }
      })
    }
  });
};
/*******************************************************************
 * Add records to an object store (= table)
 *
 * @method
 * @author Gerd Wagner
 *******************************************************************/
idbc.addRecords = async function (tableName, records) {
  const tx = idbc.db.transaction( tableName, 'readwrite');
  Promise.all( records.map( r => tx.store.add( r)));
  await tx.done;
};
