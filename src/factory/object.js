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

import {
  decideLink,
  filterView,
  mergeLink,
  mergeObject
} from '../helper';

export default function createObject(structure, query) {
  const deleter = new Deleter({
    id: 'rest-object-deleter'
  });

  const deleteValidator = new Validator({
    id: 'rest-object-delete-validator',
    structure: structure.del && structure.del.form
  });

  const editor = new Updater({
    id: 'rest-object-editor'
  });

  const editValidator = new Validator({
    id: 'rest-object-edit-validator',
    structure: structure.edit && structure.edit.form
  });

  const linker = new Selector({
    decide: decideLink(),
    id: 'rest-object-linker',
    merge: mergeLink(structure)
  });

  const methodRouter = new MethodRouter({
    id: 'rest-object-method-router'
  });

  const objectResolver = new ObjectResolver({
    id: 'rest-object-resolver'
  });

  const roleChecker = new RoleChecker({
    id: 'rest-object-role-checker',
    filter: query.permission('object')
  });

  const userChecker = new UserChecker({
    id: 'rest-object-user-checker'
  });

  const viewer = new Selector({
    id: 'rest-object-viewer',
    merge: mergeObject()
  });

  const viewValidator = new Validator({
    id: 'rest-object-view-validator',
    structure: [{
      fields: [{
        array: true,
        name: 'id',
        required: true,
        type: 'integer'
      }]
    }],
    filter: filterView()
  });

  userChecker
    .connect(roleChecker)
    .connect(methodRouter);

  if (query.del) {
    methodRouter
      .connect('DELETE', deleteValidator)
      .connect(query.del(deleter))
      .connect(objectResolver);
  }

  if (query.view) {
    methodRouter
      .connect('GET', viewValidator)
      .connect(query.view(viewer))
      .connect(query.link ? query.link(linker) : null)
      .connect(objectResolver);
  }

  if (query.edit) {
    methodRouter
      .connect('PUT', editValidator)
      .connect(query.edit(editor))
      .connect(objectResolver);
  }

  return [userChecker, objectResolver];
}
