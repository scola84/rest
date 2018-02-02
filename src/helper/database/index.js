let Deleter = null;
let Inserter = null;
let Updater = null;
let Selector = null;

function setDatabase(database) {
  Deleter = database.Deleter;
  Inserter = database.Inserter;
  Updater = database.Updater;
  Selector = database.Selector;
}

export {
  Deleter,
  Inserter,
  Selector,
  Updater,
  setDatabase
};
