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
  filterAdd,
  filterList,
  mergeList
} from '../helper';

export default function createList(structure, query, helper) {
  const deleter = new Deleter({
    id: 'rest-list-deleter'
  });

  const deleteValidator = new Validator({
    id: 'rest-list-delete-validator',
    structure: structure.del && structure.del.form
  });

  const inserter = new Inserter({
    id: 'rest-list-inserter'
  });

  const insertResolver = new ObjectResolver({
    id: 'rest-list-insert-resolver',
    filter: filterAdd()
  });

  const insertValidator = new Validator({
    id: 'rest-list-insert-validator',
    structure: structure.add && structure.add.form
  });

  const methodRouter = new MethodRouter({
    id: 'rest-list-method-router'
  });

  const roleChecker = new RoleChecker({
    filter: helper.permission('list'),
    id: 'rest-list-role-checker'
  });

  const selector = new Selector({
    id: 'rest-list-selector',
    type: 'list',
    merge: mergeList()
  });

  const selectResolver = new ListResolver({
    id: 'rest-list-select-resolver'
  });

  const selectValidator = new Validator({
    id: 'rest-list-select-validator',
    structure: structure.list && structure.list.query,
    filter: filterList()
  });

  const union = new Worker({
    id: 'rest-list-union'
  });

  const userChecker = new UserChecker({
    id: 'rest-list-user-checker'
  });

  userChecker
    .connect(roleChecker)
    .connect(methodRouter);

  if (query.del) {
    methodRouter
      .connect('DELETE', deleteValidator)
      .connect(query.del(deleter))
      .connect(union);
  }

  if (query.list) {
    methodRouter
      .connect('GET', selectValidator)
      .connect(query.list(selector))
      .connect(selectResolver)
      .connect(union);
  }

  if (query.add) {
    methodRouter
      .connect('POST', insertValidator)
      .connect(query.add(inserter))
      .connect(insertResolver)
      .connect(union);
  }

  return [userChecker, union];
}
