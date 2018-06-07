import {
  ListResolver,
  MethodRouter,
  ObjectResolver,
  RoleChecker,
  UserChecker
} from '@scola/http';

import {
  Deleter,
  Inserter,
  Selector
} from '@scola/rest';

import { Validator } from '@scola/validator';
import { Worker } from '@scola/worker';

import {
  decideMeta,
  filterData,
  filterList,
  mergeAdd,
  mergeDelete,
  mergeList,
  mergeMeta,
  mergeValidator
} from '../helper';

export default function createList(structure, query) {
  const begin = new Worker({
    id: 'rest-list-begin'
  });

  const end = new Worker({
    id: 'rest-list-end'
  });

  const methodRouter = new MethodRouter({
    id: 'rest-list-method-router'
  });

  if (query.check) {
    const roleChecker = new RoleChecker({
      filter: query.permission('list'),
      id: 'rest-list-role-checker'
    });

    const userChecker = new UserChecker({
      id: 'rest-list-user-checker'
    });

    begin
      .connect(userChecker)
      .connect(roleChecker)
      .connect(methodRouter);
  } else {
    begin
      .connect(methodRouter);
  }

  if (structure.clr && query.clr) {
    const deleter = new Deleter({
      filter: structure.clr.filter || filterData(),
      id: 'rest-list-deleter',
      merge: mergeDelete()
    });

    const deleteResolver = new ObjectResolver({
      id: 'rest-list-delete-resolver'
    });

    const deleteValidator = new Validator({
      filter: structure.clr.filter || filterData(),
      id: 'rest-list-delete-validator',
      merge: mergeValidator(),
      structure: structure.clr.form
    });

    methodRouter
      .connect('DELETE', deleteValidator)
      .connect(query.clr(deleter, query.config))
      .connect(deleteResolver)
      .connect(end);
  }

  if (structure.list && query.list) {
    const lister = new Selector({
      id: 'rest-lister',
      merge: mergeList()
    });

    const meta = new Selector({
      decide: decideMeta(),
      id: 'rest-list-meta',
      merge: mergeMeta()
    });

    const listResolver = new ListResolver({
      id: 'rest-list-resolver'
    });

    const listValidator = new Validator({
      id: 'rest-list-validator',
      structure: structure.list.query,
      filter: filterList()
    });

    methodRouter
      .connect('GET', listValidator)
      .connect(query.list(lister, query.config))
      .connect(query.meta ? query.meta(meta, query.config) : null)
      .connect(listResolver)
      .connect(end);
  }

  if (structure.add && query.add) {
    const adder = new Inserter({
      filter: structure.add.filter || filterData(),
      id: 'rest-list-adder',
      merge: mergeAdd()
    });

    const addResolver = new ObjectResolver({
      id: 'rest-list-add-resolver',
      status: 201
    });

    const addValidator = new Validator({
      filter: structure.add.filter || filterData(),
      id: 'rest-list-add-validator',
      merge: mergeValidator(),
      structure: structure.add.form
    });

    methodRouter
      .connect('POST', addValidator)
      .connect(query.add(adder, query.config))
      .connect(addResolver)
      .connect(end);
  }

  return [begin, end];
}
