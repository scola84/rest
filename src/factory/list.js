import {
  ListResolver,
  MethodRouter,
  ObjectResolver,
  RoleChecker
} from '@scola/http';

import {
  ListSelector,
  ObjectInserter
} from '../helper';

import { Validator } from '@scola/validator';
import { Worker } from '@scola/worker';

import {
  filterIdResolver,
  filterQueryValidator,
  filterRoleChecker
} from '../helper';

export default function createList(structure) {
  const listResolver = new ListResolver();
  const methodRouter = new MethodRouter();
  const union = new Worker();

  const listSelector = new ListSelector({
    id: 'rest-list-select'
  });

  const listValidator = new Validator({
    filter: filterQueryValidator(),
    structure: structure.list
  });

  const objectInserter = new ObjectInserter({
    id: 'rest-object-insert'
  });

  const objectResolver = new ObjectResolver({
    filter: filterIdResolver(structure.name)
  });

  const postValidator = new Validator({
    structure: [structure.object.form]
  });

  const roleChecker = new RoleChecker({
    filter: filterRoleChecker(structure.name, 'object')
  });

  roleChecker
    .connect(methodRouter);

  methodRouter
    .connect('GET', listValidator)
    .connect(listSelector)
    .connect(listResolver)
    .connect(union);

  methodRouter
    .connect('POST', postValidator)
    .connect(objectInserter)
    .connect(objectResolver)
    .connect(union);

  return [roleChecker, union];
}
