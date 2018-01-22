import { ListResolver, MethodRouter } from '@scola/http';
import { Validator } from '@scola/validator';

import {
  LinkDeleter,
  LinkInserter,
  LinkUpdater,
  ListSelector,
  filterLinkSelector,
  filterQueryValidator
} from '../helper';

export default function createLink(structure, link, query = {}) {
  const linkResolver = new ListResolver();
  const methodRouter = new MethodRouter();

  const deleteValidator = new Validator({
    structure: link.actions.del
  });

  const getValidator = new Validator({
    filter: filterQueryValidator(),
    structure: link.actions.get || []
  });

  const linkDeleter = new LinkDeleter({
    id: 'rest-link-delete'
  });

  const linkInserter = new LinkInserter({
    id: 'rest-link-insert'
  });

  const linkSelector = new ListSelector({
    filter: filterLinkSelector(),
    id: 'rest-link-select'
  });

  const linkUpdater = new LinkUpdater({
    id: 'rest-link-update'
  });

  const postValidator = new Validator({
    structure: link.actions.add
  });

  const putValidator = new Validator({
    structure: link.actions.edit
  });

  if (query.del) {
    methodRouter
      .connect('DELETE', deleteValidator)
      .connect(query.del(linkDeleter))
      .connect(linkResolver);
  }

  if (query.get) {
    methodRouter
      .connect('GET', getValidator)
      .connect(query.get(linkSelector))
      .connect(linkResolver);
  }

  if (query.post) {
    methodRouter
      .connect('POST', postValidator)
      .connect(query.post(linkInserter))
      .connect(linkResolver);
  }

  if (query.put) {
    methodRouter
      .connect('PUT', putValidator)
      .connect(query.put(linkUpdater))
      .connect(linkResolver);
  }

  return [methodRouter, linkResolver];
}
