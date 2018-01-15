import {
  MethodRouter,
  ObjectResolver
} from '@scola/http';

import { Validator } from '@scola/validator';

import {
  ObjectUpdater,
  filterObjectDeleter
} from '../helper';

import createBase from './base';

export default function createObject(structure) {
  const methodRouter = new MethodRouter();
  const objectResolver = new ObjectResolver();

  const [
    getValidator,
    objectSelector
  ] = createBase(structure);

  const objectDeleter = new ObjectUpdater({
    filter: filterObjectDeleter(structure.name),
    id: 'rest-object-delete'
  });

  const objectUpdater = new ObjectUpdater({
    id: 'rest-object-update'
  });

  const putValidator = new Validator({
    structure: [structure.object.form, structure.object.id]
  });

  objectSelector
    .connect(methodRouter);

  methodRouter
    .connect('DELETE', objectDeleter)
    .connect(objectResolver);

  methodRouter
    .connect('GET', objectResolver);

  methodRouter
    .connect('PUT', putValidator)
    .connect(objectUpdater)
    .connect(objectResolver);

  return [getValidator, objectResolver];
}
