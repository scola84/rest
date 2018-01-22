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

export default function createList(structure, query = {}) {
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
    filter: filterRoleChecker(structure.name, 'list')
  });

  roleChecker
    .connect(methodRouter);

  if (query.get) {
    methodRouter
      .connect('GET', listValidator)
      .connect(query.get(listSelector))
      .connect(listResolver)
      .connect(union);
  }

  if (query.post) {
    methodRouter
      .connect('POST', postValidator)
      .connect(query.post(objectInserter))
      .connect(objectResolver)
      .connect(union);
  }

  return [roleChecker, union];
}
