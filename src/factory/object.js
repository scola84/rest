import {
  MethodRouter,
  ObjectResolver,
  RoleChecker,
  UserChecker
} from '@scola/http';

import {
  Selector,
  Updater
} from '@scola/rest';

import { Validator } from '@scola/validator';

import {
  filterView,
  mergeLink,
  mergeObject
} from '../helper';

export default function createObject(structure, query) {

  const editor = new Updater({
    id: 'rest-object-editor'
  });

  const editValidator = new Validator({
    id: 'rest-object-edit-validator',
    structure: structure.edit && structure.edit.form
  });

  const linker = new Selector({
    id: 'rest-object-linker',
    type: 'list',
    merge: mergeLink()
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
