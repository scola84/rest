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

export default function createList(structure, query) {
  const adder = new Inserter({
    id: 'rest-list-adder'
  });

  const addResolver = new ObjectResolver({
    id: 'rest-list-add-resolver',
    filter: filterAdd()
  });

  const addValidator = new Validator({
    id: 'rest-list-add-validator',
    structure: structure.add && structure.add.form
  });

  const deleter = new Deleter({
    id: 'rest-list-deleter'
  });

  const deleteValidator = new Validator({
    id: 'rest-list-delete-validator',
    structure: structure.del && structure.del.form
  });

  const getter = new Selector({
    id: 'rest-list-getter',
    type: 'list',
    merge: mergeList()
  });

  const getResolver = new ListResolver({
    id: 'rest-list-get-resolver'
  });

  const getValidator = new Validator({
    id: 'rest-list-get-validator',
    structure: structure.list && structure.list.query,
    filter: filterList()
  });

  const methodRouter = new MethodRouter({
    id: 'rest-list-method-router'
  });

  const roleChecker = new RoleChecker({
    filter: query.permission('list'),
    id: 'rest-list-role-checker'
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
      .connect('GET', getValidator)
      .connect(query.list(getter))
      .connect(getResolver)
      .connect(union);
  }

  if (query.add) {
    methodRouter
      .connect('POST', addValidator)
      .connect(query.add(adder))
      .connect(addResolver)
      .connect(union);
  }

  return [userChecker, union];
}
