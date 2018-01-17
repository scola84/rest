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

export default function createLink(structure, link) {
  const actions = link.actions;

  const linkResolver = new ListResolver();
  const methodRouter = new MethodRouter();

  const deleteValidator = new Validator({
    structure: actions.del
  });

  const getValidator = new Validator({
    filter: filterQueryValidator(),
    structure: actions.get || []
  });

  const linkDeleter = new LinkDeleter({
    id: 'rest-link-delete'
  });

  const linkInserter = new LinkInserter({
    id: 'rest-link-insert'
  });

  const linkSelector = new ListSelector({
    id: 'rest-link-select',
    filter: filterLinkSelector()
  });

  const linkUpdater = new LinkUpdater({
    id: 'rest-link-update'
  });

  const postValidator = new Validator({
    structure: actions.add
  });

  const putValidator = new Validator({
    structure: actions.edit
  });

  methodRouter
    .connect('DELETE', deleteValidator)
    .connect(linkDeleter)
    .connect(linkResolver);

  methodRouter
    .connect('GET', getValidator)
    .connect(linkSelector)
    .connect(linkResolver);

  methodRouter
    .connect('POST', postValidator)
    .connect(linkInserter)
    .connect(linkResolver);

  methodRouter
    .connect('PUT', putValidator)
    .connect(linkUpdater)
    .connect(linkResolver);

  return [methodRouter, linkResolver];
}
