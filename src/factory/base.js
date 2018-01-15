import {
  RoleChecker,
  UserChecker
} from '@scola/http';

import { Validator } from '@scola/validator';

import {
  ObjectSelector,
  filterIdValidator,
  filterRoleChecker,
  mergeObjectSelector
} from '../helper';

export default function createBase(structure, link = {}) {
  const userChecker = new UserChecker();

  const getValidator = new Validator({
    filter: filterIdValidator(structure.name),
    structure: [structure.object.id]
  });

  const objectSelector = new ObjectSelector({
    id: 'rest-object-select',
    merge: mergeObjectSelector()
  });

  const roleChecker = new RoleChecker({
    filter: filterRoleChecker(structure.name, link.name || 'object')
  });

  getValidator
    .connect(userChecker)
    .connect(roleChecker)
    .connect(objectSelector);

  return [getValidator, objectSelector];
}
