/* eslint prefer-reflect: 0 */

import {
  MethodRouter,
  ObjectResolver,
  OptionsResolver,
  RoleChecker,
  UserChecker
} from '@scola/http';

import { Validator } from '@scola/validator';
import { Worker } from '@scola/worker';

import {
  filterData,
  filterOptions,
  mergeValidator
} from '../helper';

export default function createCall(structure, query) {
  const options = {
    call: query.call && structure.call
  };

  const beginner = new Worker({
    id: 'rest-call-beginner'
  });

  const ender = new Worker({
    err(request, error, callback) {
      this.fail(request.createResponse(), error, callback);
    },
    id: 'rest-call-ender'
  });

  const methodRouter = new MethodRouter({
    id: 'rest-call-method-router'
  });

  if (query.check) {
    const roleChecker = new RoleChecker({
      filter: query.permission('call'),
      id: 'rest-call-role-checker'
    });

    const userChecker = new UserChecker({
      id: 'rest-call-user-checker'
    });

    beginner
      .connect(userChecker)
      .connect(roleChecker)
      .connect(methodRouter);
  } else {
    beginner
      .connect(methodRouter);
  }

  if (query.options) {
    const optionsResolver = new OptionsResolver({
      id: 'rest-call-options-resolver',
      filter: filterOptions(query.permission('call'))
    });

    methodRouter
      .connect('OPTIONS', query.options(options))
      .connect(optionsResolver)
      .connect(ender);
  }

  if (structure.call && query.call) {
    const callResolver = new ObjectResolver({
      id: 'rest-call-resolver',
      status: 201
    });

    const callValidator = new Validator({
      extract: (s) => s.call.form,
      filter: structure.call.filter || filterData(),
      id: 'rest-call-validator',
      merge: mergeValidator(),
      structure
    });

    methodRouter
      .connect('POST', new Worker())
      .connect(query.options ? query.options(options) : null)
      .connect(callValidator
        .bypass(callResolver))
      .connect(query.call())
      .connect(callResolver)
      .connect(ender);
  }

  methodRouter
    .bypass(ender);

  return [beginner, ender];
}
