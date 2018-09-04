import {
  Inserter,
  Selector,
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

export default function createImport(structure, query, imprt, config) {
  const importBroadcaster = new Broadcaster({
    id: 'rest-import-import-broadcaster',
    name: 'import',
    wrap: true
  });

  const importUnifier = new Unifier({
    id: 'rest-import-import-unifier',
    name: 'import',
    wrap: true
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

        unique = objectQuery.unique(unique, config[object]);
      }

      if (objectQuery && objectQuery.add || objectQuery.edit) {
        adder = new Inserter({
          decide: decideImport(null, false, true, 'add',
            imprt[object][name]),
          filter: filterData({}, false),
          id: 'rest-import-adder',
          merge: mergeAdd()
        });

        if (objectQuery.add) {
          adder = objectQuery.add(adder, config[object]);
        } else {
          adder = objectQuery.edit(adder, config[object]);
        }
      }

      if (objectQuery && objectQuery.edit) {
        editor = new Updater({
          decide: decideImport(true, true, true, 'edit',
            imprt[object][name]),
          filter: filterData({}, false),
          id: 'rest-import-editor',
          merge: mergeData()
        });

        editor.set({ any: true });
        editor = objectQuery.edit(editor, config[object]);
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
    .connect(importBroadcaster);

  importUnifier
    .connect(importResolver);

  return [importQueuer, importResolver];
}
