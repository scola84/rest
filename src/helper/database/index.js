import MaskedId from './masked-id';

let Database = null;
let Deleter = null;
let Inserter = null;
let Selector = null;
let Updater = null;

function setDatabase(database) {
  Database = database.Database;
  Deleter = database.Deleter;
  Inserter = database.Inserter;
  Selector = database.Selector;
  Updater = database.Updater;
}

export {
  MaskedId
};

export {
  Database,
  Deleter,
  Inserter,
  Selector,
  Updater
};

export {
  setDatabase
};
