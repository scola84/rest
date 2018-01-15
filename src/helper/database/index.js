let LinkDeleter = null;
let LinkInserter = null;
let LinkReplacer = null;
let LinkUpdater = null;
let ListSelector = null;
let ObjectDeleter = null;
let ObjectInserter = null;
let ObjectSelector = null;
let ObjectUpdater = null;

function setDatabase(database) {
  LinkDeleter = database.LinkDeleter;
  LinkInserter = database.LinkInserter;
  LinkReplacer = database.LinkReplacer;
  LinkUpdater = database.LinkUpdater;
  ListSelector = database.ListSelector;
  ObjectDeleter = database.ObjectDeleter;
  ObjectInserter = database.ObjectInserter;
  ObjectSelector = database.ObjectSelector;
  ObjectUpdater = database.ObjectUpdater;
}

export {
  LinkDeleter,
  LinkInserter,
  LinkReplacer,
  LinkUpdater,
  ListSelector,
  ObjectDeleter,
  ObjectInserter,
  ObjectSelector,
  ObjectUpdater,
  setDatabase
};
