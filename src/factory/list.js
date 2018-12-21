import {
  ListResolver,
  MethodRouter,
  ObjectResolver,
  OptionsResolver,
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
  filterData,
  filterList,
  filterOptions,
  mergeAdd,
  mergeDelete,
  mergeList,
  mergeValidator
} from '../helper';

export default function createList(structure, query) {
  const options = {
    add: query.add && structure.add,
    clr: query.clr && structure.clr,
    list: query.list && structure.list
  };

  const beginner = new Worker({
    id: 'rest-list-beginner'
  });

  const ender = new Worker({
    err(request, error, callback) {
      this.fail(request.createResponse(), error, callback);
    },
    id: 'rest-list-ender'
  });

  const methodRouter = new MethodRouter({
    id: 'rest-list-method-router'
  });

  if (query.check) {
    const roleChecker = new RoleChecker({
      filter: query.permission('list'),
      id: 'rest-list-role-checker'
    });

    const userChecker = new UserChecker({
      id: 'rest-list-user-checker'
    });

    beginner
      .connect(userChecker)
      .connect(roleChecker)
      .connect(methodRouter);
  } else {
    beginner
      .connect(methodRouter);
  }

  if (structure.clr && query.clr) {
    const deleter = new Deleter({
      filter: structure.clr.filter || filterData(),
      id: 'rest-list-deleter',
      merge: mergeDelete()
    });

    const deleteResolver = new ObjectResolver({
      id: 'rest-list-delete-resolver'
    });

    const deleteValidator = new Validator({
      extract: (s) => s.clr.form,
      filter: structure.clr.filter || filterData(),
      id: 'rest-list-delete-validator',
      merge: mergeValidator(),
      structure
    });

    methodRouter
      .connect('DELETE', new Worker())
      .connect(query.options ? query.options(options) : null)
      .connect(deleteValidator
        .bypass(deleteResolver))
      .connect(query.clr(deleter))
      .connect(deleteResolver)
      .connect(ender);
  }

  if (structure.list && query.list) {
    const lister = new Selector({
      id: 'rest-lister',
      merge: mergeList()
    });

    const listResolver = new ListResolver({
      id: 'rest-list-resolver'
    });

    const listValidator = new Validator({
      extract: (s) => s.list.query,
      filter: filterList(),
      id: 'rest-list-validator',
      structure
    });

    methodRouter
      .connect('GET', listValidator
        .bypass(listResolver))
      .connect(query.list(lister))
      .connect(listResolver)
      .connect(ender);
  }

  if (query.options) {
    const optionsResolver = new OptionsResolver({
      id: 'rest-list-options-resolver',
      filter: filterOptions(query.permission('list'))
    });

    methodRouter
      .connect('OPTIONS', query.options(options))
      .connect(optionsResolver)
      .connect(ender);
  }

  if (structure.add && query.add) {
    const adder = new Inserter({
      filter: structure.add.filter || filterData(),
      id: 'rest-list-adder',
      merge: mergeAdd()
    });

    const addResolver = new ObjectResolver({
      id: 'rest-list-add-resolver',
      status: 201
    });

    const addValidator = new Validator({
      extract: (s) => s.add.form,
      filter: structure.add.filter || filterData(),
      id: 'rest-list-add-validator',
      merge: mergeValidator(),
      structure
    });

    methodRouter
      .connect('POST', new Worker())
      .connect(query.options ? query.options(options) : null)
      .connect(addValidator
        .bypass(addResolver))
      .connect(query.add(adder))
      .connect(addResolver)
      .connect(ender);
  }

  methodRouter
    .bypass(ender);

  return [beginner, ender];
}
