import {
  Inserter,
  Selector,
  Updater
} from '@scola/rest';

import { Validator } from '@scola/validator';

import {
  Broadcaster,
  Slicer,
  Unifier
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

export default function createImport(structure, query, imprt) {
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

  let object = null;
  let name = null;
  let names = null;
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

      if (objectStructure && objectStructure.add) {
        validator = new Validator({
          filter: filterData({}, false),
          id: 'rest-import-validator',
          structure: objectStructure.add.form
        });
      }

      if (objectQuery && objectQuery.add) {
        adder = new Inserter({
          decide: decideImport(null, false, imprt[object][name].key),
          filter: filterData({}, false),
          id: 'rest-import-adder',
          merge: mergeAdd()
        });
      }

      if (objectQuery && objectQuery.edit) {
        editor = new Updater({
          decide: decideImport(true, true, imprt[object][name].key),
          filter: filterData({}, false),
          id: 'rest-import-editor',
          merge: mergeData()
        });

        editor.set({ any: true });
      }

      if (objectQuery && objectQuery.unique) {
        unique = new Selector({
          decide: decideImport(false, false, imprt[object][name].key),
          filter: filterData({}, false),
          id: 'rest-import-unique',
          merge: mergeUnique(true)
        });
      }

      importBroadcaster
        .connect(importer)
        .connect(slicer)
        .connect(validator)
        .connect(unique ? objectQuery.unique(unique) : null)
        .connect(adder ? objectQuery.add(adder) : null)
        .connect(editor ? objectQuery.edit(editor) : null)
        .connect(collector)
        .connect(unifier)
        .connect(importUnifier);
    }
  }

  return [importBroadcaster, importUnifier];
}
