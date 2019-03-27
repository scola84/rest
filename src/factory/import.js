import {
  Inserter,
  Selector,
  Transactor,
  Updater
} from '@scola/rest';

import { Validator } from '@scola/validator';

import {
  Broadcaster,
  Slicer,
  Unifier,
  Queuer,
  Worker
} from '@scola/worker';

import {
  Collector,
  Importer
} from '../import';

import {
  decideImport,
  filterData,
  filterImport,
  mergeAdd,
  mergeData,
  mergeImport,
  mergeUnique
} from '../helper';

export default function createImport(structure, query, imprt, options) {
  const importBeginner = new Transactor({
    begin: options.begin,
    connection(box, data, pool, callback) {
      pool.getConnection((error, connection) => {
        if (error) {
          callback(error);
          return;
        }

        box.connection = connection;
        callback(null, connection);
      });
    },
    id: 'rest-import-import-beginner'
  });

  const importBroadcaster = new Broadcaster({
    id: 'rest-import-import-broadcaster',
    name: 'import',
    sync: true
  });

  const importCommitter = new Transactor({
    commit: options.commit,
    connection: (box, data, pool, callback) => {
      callback(null, box.connection, false);
    },
    decide: (box, data) => {
      return data.output.error !== true;
    },
    id: 'rest-import-import-committer'
  });

  const importRollbacker = new Transactor({
    connection: (box, data, pool, callback) => {
      callback(null, box.connection, false);
    },
    decide: (box, data) => {
      return data.output.error === true;
    },
    id: 'rest-import-import-rollbacker',
    rollback: options.rollback
  });

  const importUnifier = new Unifier({
    id: 'rest-import-import-unifier',
    name: 'import',
    sync: true
  });

  const importQueuer = new Queuer({
    id: 'rest-import-import-queuer'
  });

  const importResolver = new Worker({
    act(box, data, callback) {
      callback();
      this.pass(box, data);
    },
    id: 'rest-import-import-resolver'
  });

  let object = null;
  let name = null;
  let names = null;

  let objectForm = null;
  let objectQuery = null;
  let objectStructure = null;

  let adder = null;
  let collector = null;
  let editor = null;
  let importer = null;
  let slicer = null;
  let unifier = null;
  let unique = null;
  let validator = null;

  const objects = Object.keys(imprt);

  for (let i = 0; i < objects.length; i += 1) {
    object = objects[i];
    names = Object.keys(imprt[object]);

    for (let j = 0; j < names.length; j += 1) {
      name = names[j];

      adder = null;
      editor = null;
      unique = null;
      validator = null;

      objectStructure = structure[object] && structure[object][name];
      objectQuery = query[object] && query[object][name];
      objectForm = objectStructure.add || objectStructure.edit;

      collector = new Collector({
        id: 'rest-import-collector',
        name,
        object
      });

      importer = new Importer({
        id: 'rest-import-importer',
        map: imprt[object][name],
        name,
        object
      });

      slicer = new Slicer({
        filter: filterImport(object, name),
        id: 'rest-import-slicer',
        merge: mergeImport(),
        name: object + name,
        wrap: true
      });

      unifier = new Unifier({
        id: 'rest-import-unifier',
        name: object + name,
        wrap: true
      });

      if (objectStructure && objectForm) {
        validator = new Validator({
          decide: decideImport(false, false, false, 'validate',
            imprt[object][name]),
          filter: filterData({}, false),
          id: 'rest-import-validator',
          structure: objectForm.form
        });
      }

      if (objectQuery && objectQuery.unique) {
        unique = new Selector({
          decide: decideImport(false, false, false, 'unique',
            imprt[object][name]),
          filter: filterData({}, false),
          id: 'rest-import-unique',
          merge: mergeUnique(true)
        });

        unique = objectQuery.unique(unique);
      }

      if (objectQuery && objectQuery.add || objectQuery.edit) {
        adder = new Inserter({
          connection: (box, data, pool, callback) => {
            callback(null, box.box.connection, false);
          },
          decide: decideImport(null, false, true, 'add',
            imprt[object][name]),
          filter: filterData({}, false),
          id: 'rest-import-adder',
          merge: (box, data, merger) => {
            return mergeAdd(true)(box.box, data, merger);
          },
          trigger: false
        });

        if (objectQuery.add) {
          adder = objectQuery.add(adder);
        } else {
          adder = objectQuery.edit(adder);
        }
      }

      if (objectQuery && objectQuery.edit) {
        editor = new Updater({
          connection: (box, data, pool, callback) => {
            callback(null, box.box.connection, false);
          },
          decide: decideImport(true, true, true, 'edit',
            imprt[object][name]),
          filter: filterData({}, false),
          id: 'rest-import-editor',
          merge: mergeData(),
          trigger: false
        });

        editor.set({ any: true });
        editor = objectQuery.edit(editor);
      }

      importBroadcaster
        .connect(importer)
        .connect(slicer)
        .connect(validator)
        .connect(unique)
        .connect(adder)
        .connect(editor)
        .connect(collector)
        .connect(unifier)
        .connect(importUnifier);
    }
  }

  importQueuer
    .connect(importBeginner)
    .connect(importBroadcaster);

  importUnifier
    .connect(importCommitter)
    .connect(importRollbacker)
    .connect(importResolver);

  return [importQueuer, importResolver];
}
