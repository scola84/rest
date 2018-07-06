import {
  MethodRouter,
  ObjectResolver,
  RoleChecker,
  UserChecker
} from '@scola/http';

import {
  Deleter,
  Selector,
  Updater
} from '@scola/rest';

import { Validator } from '@scola/validator';
import { Worker } from '@scola/worker';

import {
  decideLink,
  filterData,
  mergeEdit,
  mergeDelete,
  mergeLink,
  mergeObject,
  mergeValidator
} from '../helper';

export default function createObject(structure, query) {
  const begin = new Worker({
    id: 'rest-object-begin'
  });

  const methodRouter = new MethodRouter({
    id: 'rest-object-method-router'
  });

  const objectResolver = new ObjectResolver({
    id: 'rest-object-resolver',
    type: query.type
  });

  if (query.check) {
    const roleChecker = new RoleChecker({
      id: 'rest-object-role-checker',
      filter: query.permission('object')
    });

    const userChecker = new UserChecker({
      id: 'rest-object-user-checker'
    });

    begin
      .connect(userChecker)
      .connect(roleChecker)
      .connect(methodRouter);
  } else {
    begin
      .connect(methodRouter);
  }

  if (structure.del && query.del) {
    const deleter = new Deleter({
      filter: structure.del.filter || filterData(),
      id: 'rest-object-deleter',
      merge: mergeDelete()
    });

    const deleteValidator = new Validator({
      filter: structure.del.filter || filterData(),
      id: 'rest-object-delete-validator',
      merge: mergeValidator(),
      structure: structure.del.form
    });

    methodRouter
      .connect('DELETE', deleteValidator)
      .connect(query.del(deleter, query.config))
      .connect(objectResolver);
  }

  if (query.view) {
    const linker = new Selector({
      decide: decideLink(),
      id: 'rest-object-linker',
      merge: mergeLink(structure)
    });

    const viewer = new Selector({
      id: 'rest-object-viewer',
      merge: mergeObject(query.type)
    });

    methodRouter
      .connect('GET', query.view(viewer, query.config))
      .connect(query.link ? query.link(linker, query.config) : null)
      .connect(objectResolver);
  }

  if (structure.edit && query.edit) {
    const editor = new Updater({
      filter: structure.edit.filter || filterData(),
      id: 'rest-object-editor',
      merge: mergeEdit()
    });

    const editValidator = new Validator({
      filter: structure.edit.filter || filterData(),
      id: 'rest-object-edit-validator',
      merge: mergeValidator(),
      structure: structure.edit.form
    });

    methodRouter
      .connect('PUT', editValidator)
      .connect(query.edit(editor, query.config))
      .connect(objectResolver);
  }

  if (structure.patch && query.patch) {
    const patcher = new Updater({
      filter: structure.patch.filter || filterData(),
      id: 'rest-object-patcher',
      merge: mergeEdit()
    });

    const patchValidator = new Validator({
      filter: structure.patch.filter || filterData(),
      id: 'rest-object-patch-validator',
      merge: mergeValidator(),
      structure: structure.patch.form
    });

    methodRouter
      .connect('PATCH', patchValidator)
      .connect(query.patch(patcher, query.config))
      .connect(objectResolver);
  }

  return [begin, objectResolver];
}
