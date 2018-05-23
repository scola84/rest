import {
  Broadcaster,
  Router,
  Slicer,
  Unifier,
  Worker
} from '@scola/worker';

import { Validator } from '@scola/validator';
import { Inserter } from '@scola/rest';

import {
  Collector,
  Importer
} from '../import';

import {
  filterImport,
  mergeAdd,
  mergeImport
} from '../helper';

export default function createImport(structure, query, map, config) {
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

  let collector = null;
  let importer = null;
  let inserter = null;
  let passthrough = null;
  let router = null;
  let slicer = null;
  let tester = null;
  let unifier = null;
  let validator = null;

  const names = Object.keys(map);

  for (let i = 0; i < names.length; i += 1) {
    name = names[i];
    subs = Object.keys(map[name]);

    for (let j = 0; j < subs.length; j += 1) {
      sub = subs[j];

      inserter = null;
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

      passthrough = new Worker({
        id: 'rest-import-passthrough'
      });

      router = new Router({
        filter: (box) => {
          return box.box.box.load ? 'load' : 'test';
        },
        id: 'rest-import-router'
      });

      slicer = new Slicer({
        filter: filterImport(name, sub),
        id: 'rest-import-slicer',
        merge: mergeImport(name, sub, config),
        name: name + sub,
        wrap: true
      });

      tester = new Worker({
        act(box, data, callback) {
          this.pass(box, data, callback);
        },
        err(box, error, callback) {
          this.fail(box, error, callback);
        },
        id: 'rest-import-tester'
      });

      unifier = new Unifier({
        id: 'rest-import-unifier',
        name: name + sub,
        wrap: true
      });

      if (subStructure && subStructure.add) {
        validator = new Validator({
          id: 'rest-import-validator',
          structure: subStructure.add.form
        });
      }

      if (subQuery && subQuery.add) {
        inserter = new Inserter({
          id: 'rest-import-adder',
          merge: mergeAdd()
        });
      }

      importBroadcaster
        .connect(importer)
        .connect(slicer)
        .connect(validator)
        .connect(router);

      router
        .connect('load', passthrough)
        .connect(inserter ? subQuery.add(inserter) : null)
        .connect(collector);

      router
        .connect('test', tester)
        .connect(collector);

      collector
        .connect(unifier)
        .connect(importUnifier);
    }
  }

  return [importBroadcaster, importUnifier];
}
