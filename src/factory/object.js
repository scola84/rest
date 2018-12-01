import {
  FileResolver,
  MethodRouter,
  ObjectResolver,
  OptionsResolver,
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
  filterOptions,
  mergeEdit,
  mergeDelete,
  mergeLink,
  mergeObject,
  mergeValidator
} from '../helper';

export default function createObject(structure, query) {
  const options = {
    del: query.del && structure.del,
    edit: query.edit && structure.edit,
    patch: query.patch && structure.patch,
    view: query.view && structure.view
  };

  const begin = new Worker({
    id: 'rest-object-begin'
  });

  const end = new Worker({
    err(request, error, callback) {
      this.fail(request.createResponse(), error, callback);
    },
    id: 'rest-object-end'
  });

  const methodRouter = new MethodRouter({
    id: 'rest-object-method-router'
  });

  const objectResolver = query.type === 'file' ?
    new FileResolver({ id: 'rest-file-resolver' }) :
    new ObjectResolver({ id: 'rest-object-resolver' });

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
      extract: (s) => s.del.form,
      filter: structure.del.filter || filterData(),
      id: 'rest-object-delete-validator',
      merge: mergeValidator(),
      structure
    });

    methodRouter
      .connect('DELETE', new Worker())
      .connect(query.options ? query.options(options) : null)
      .connect(deleteValidator)
      .connect(query.del(deleter))
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
      merge: mergeObject(query.type, query.omit)
    });

    methodRouter
      .connect('GET', query.view(viewer))
      .connect(query.link ? query.link(linker) : null)
      .connect(objectResolver);
  }

  if (query.options) {
    const optionsResolver = new OptionsResolver({
      id: 'rest-object-options-resolver',
      filter: filterOptions(query.permission('object'))
    });

    methodRouter
      .connect('OPTIONS', query.options(options))
      .connect(optionsResolver)
      .connect(end);
  }

  if (structure.patch && query.patch) {
    const patcher = new Updater({
      filter: structure.patch.filter || filterData(),
      id: 'rest-object-patcher',
      merge: mergeEdit()
    });

    const patchValidator = new Validator({
      extract: (s) => s.patch.form,
      filter: structure.patch.filter || filterData(),
      id: 'rest-object-patch-validator',
      merge: mergeValidator(),
      structure
    });

    methodRouter
      .connect('PATCH', new Worker())
      .connect(query.options ? query.options(options) : null)
      .connect(patchValidator)
      .connect(query.patch(patcher))
      .connect(objectResolver);
  }

  if (structure.edit && query.edit) {
    const editor = new Updater({
      filter: structure.edit.filter || filterData(),
      id: 'rest-object-editor',
      merge: mergeEdit()
    });

    const editValidator = new Validator({
      extract: (s) => s.edit.form,
      filter: structure.edit.filter || filterData(),
      id: 'rest-object-edit-validator',
      merge: mergeValidator(),
      structure
    });

    methodRouter
      .connect('PUT', new Worker())
      .connect(query.options ? query.options(options) : null)
      .connect(editValidator)
      .connect(query.edit(editor))
      .connect(objectResolver);
  }

  methodRouter
    .bypass(end);

  objectResolver
    .connect(end);

  return [begin, end];
}
