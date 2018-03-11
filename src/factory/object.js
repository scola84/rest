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
  mergeLink,
  mergeObject
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
      id: 'rest-object-deleter'
    });

    const deleteValidator = new Validator({
      id: 'rest-object-delete-validator',
      structure: structure.del.form
    });

    methodRouter
      .connect('DELETE', deleteValidator)
      .connect(query.del(deleter, query.config))
      .connect(objectResolver);
  }

  if (structure.view && query.view) {
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
      id: 'rest-object-editor'
    });

    const editValidator = new Validator({
      id: 'rest-object-edit-validator',
      structure: structure.edit.form
    });

    methodRouter
      .connect('PUT', editValidator)
      .connect(query.edit(editor, query.config))
      .connect(objectResolver);
  }

  if (structure.patch && query.patch) {
    const patcher = new Updater({
      id: 'rest-object-patcher'
    });

    const patchValidator = new Validator({
      id: 'rest-object-patch-validator',
      structure: structure.patch.form
    });

    methodRouter
      .connect('PATCH', patchValidator)
      .connect(query.patch(patcher, query.config))
      .connect(objectResolver);
  }

  return [begin, objectResolver];
}
