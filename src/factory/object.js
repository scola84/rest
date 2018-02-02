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

export default function createObject(structure, query, helper) {
  const linkSelector = new Selector({
    id: 'rest-object-link-selector',
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
    filter: helper.permission('object')
  });

  const selector = new Selector({
    id: 'rest-object-selector',
    merge: mergeObject()
  });

  const selectValidator = new Validator({
    id: 'rest-object-select-validator',
    structure: [{
      fields: [{
        name: 'id',
        required: true,
        type: 'integer'
      }]
    }],
    filter: filterView()
  });

  const updater = new Updater({
    id: 'rest-object-updater'
  });

  const updateValidator = new Validator({
    id: 'rest-object-update-validator',
    structure: structure.edit && structure.edit.form
  });

  const userChecker = new UserChecker({
    id: 'rest-object-user-checker'
  });

  userChecker
    .connect(roleChecker)
    .connect(methodRouter);

  if (query.view) {
    methodRouter
      .connect('GET', selectValidator)
      .connect(query.view(selector))
      .connect(query.link ? query.link(linkSelector) : null)
      .connect(objectResolver);
  }

  if (query.edit) {
    methodRouter
      .connect('PUT', updateValidator)
      .connect(query.edit(updater))
      .connect(objectResolver);
  }

  return [userChecker, objectResolver];
}
