import {
  Broadcaster,
  Slicer,
  Unifier
} from '@scola/worker';

import { Validator } from '@scola/validator';

import {
  Inserter,
  Selector,
  Updater
} from '@scola/rest';

import {
  Collector,
  Importer
} from '../import';

import {
  decideImport,
  filterData,
  filterImport,
  mergeAdd,
  mergeEdit,
  mergeImport,
  mergeUnique
} from '../helper';

export default function createImport(structure, query, map) {
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

  let name = null;
  let sub = null;
  let subs = null;
  let subQuery = null;
  let subStructure = null;

  let adder = null;
  let collector = null;
  let editor = null;
  let importer = null;
  let slicer = null;
  let unifier = null;
  let unique = null;
  let validator = null;

  const names = Object.keys(map);

  for (let i = 0; i < names.length; i += 1) {
    name = names[i];
    subs = Object.keys(map[name]);

    for (let j = 0; j < subs.length; j += 1) {
      sub = subs[j];

      adder = null;
      editor = null;
      unique = null;
      validator = null;

      subStructure = structure[name] && structure[name][sub];
      subQuery = query[name] && query[name][sub];

      collector = new Collector({
        id: 'rest-import-collector',
        name,
        sub
      });

      importer = new Importer({
        id: 'rest-import-importer',
        map: map[name][sub],
        name,
        sub
      });

      slicer = new Slicer({
        filter: filterImport(name, sub),
        id: 'rest-import-slicer',
        merge: mergeImport(),
        name: name + sub,
        wrap: true
      });

      unifier = new Unifier({
        id: 'rest-import-unifier',
        name: name + sub,
        wrap: true
      });

      if (subStructure && subStructure.add) {
        validator = new Validator({
          filter: filterData({}, false),
          id: 'rest-import-validator',
          structure: subStructure.add.form
        });
      }

      if (subQuery && subQuery.add) {
        adder = new Inserter({
          decide: decideImport(null),
          filter: filterData({}, false),
          id: 'rest-import-adder',
          merge: mergeAdd()
        });
      }

      if (subQuery && subQuery.edit) {
        editor = new Updater({
          decide: decideImport(true, true),
          filter: filterData({}, false),
          id: 'rest-import-editor',
          merge: mergeEdit()
        });
      }

      if (subQuery && subQuery.unique) {
        unique = new Selector({
          decide: decideImport(),
          filter: filterData({}, false),
          id: 'rest-import-unique',
          merge: mergeUnique()
        });
      }

      importBroadcaster
        .connect(importer)
        .connect(slicer)
        .connect(validator)
        .connect(unique ? subQuery.unique(unique, {}, false) : null)
        .connect(adder ? subQuery.add(adder, {}, false) : null)
        .connect(editor ? subQuery.edit(editor, {}, false) : null)
        .connect(collector)
        .connect(unifier)
        .connect(importUnifier);
    }
  }

  return [importBroadcaster, importUnifier];
}
