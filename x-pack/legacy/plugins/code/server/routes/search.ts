/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import Boom from 'boom';

import { RequestFacade, RequestQueryFacade } from '../../';
import {
  CommitSearchRequest,
  DocumentSearchRequest,
  RepositorySearchRequest,
  ResolveSnippetsRequest,
  StackTraceItem,
  StackTraceSnippetsRequest,
  SymbolSearchRequest,
} from '../../model';
import { Logger } from '../log';
import {
  CommitSearchClient,
  DocumentSearchClient,
  IntegrationsSearchClient,
  RepositorySearchClient,
  SymbolSearchClient,
} from '../search';
import { EsClientWithRequest } from '../utils/esclient_with_request';
import { CodeServerRouter } from '../security';
import { getReferenceHelper } from '../utils/repository_reference_helper';

export function repositorySearchRoute(router: CodeServerRouter, log: Logger) {
  router.route({
    path: '/api/code/search/repo',
    method: 'GET',
    async handler(req: RequestFacade) {
      let page = 1;
      const { p, q, repoScope } = req.query as RequestQueryFacade;
      if (p) {
        page = parseInt(p as string, 10);
      }

      const searchReq: RepositorySearchRequest = {
        query: q as string,
        page,
        repoScope: await getScope(req, repoScope),
      };
      try {
        const repoSearchClient = new RepositorySearchClient(new EsClientWithRequest(req), log);
        const res = await repoSearchClient.search(searchReq);
        return res;
      } catch (error) {
        return Boom.internal(`Search Exception`);
      }
    },
  });

  router.route({
    path: '/api/code/suggestions/repo',
    method: 'GET',
    async handler(req: RequestFacade) {
      let page = 1;
      const { p, q, repoScope } = req.query as RequestQueryFacade;
      if (p) {
        page = parseInt(p as string, 10);
      }

      const searchReq: RepositorySearchRequest = {
        query: q as string,
        page,
        repoScope: await getScope(req, repoScope),
      };
      try {
        const repoSearchClient = new RepositorySearchClient(new EsClientWithRequest(req), log);
        const res = await repoSearchClient.suggest(searchReq);
        return res;
      } catch (error) {
        return Boom.internal(`Search Exception`);
      }
    },
  });
}

export function documentSearchRoute(router: CodeServerRouter, log: Logger) {
  router.route({
    path: '/api/code/search/doc',
    method: 'GET',
    async handler(req: RequestFacade) {
      let page = 1;
      const { p, q, langs, repos, repoScope } = req.query as RequestQueryFacade;
      if (p) {
        page = parseInt(p as string, 10);
      }

      const searchReq: DocumentSearchRequest = {
        query: q as string,
        page,
        langFilters: langs ? (langs as string).split(',') : [],
        repoFilters: repos ? decodeURIComponent(repos as string).split(',') : [],
        repoScope: await getScope(req, repoScope),
      };
      try {
        const docSearchClient = new DocumentSearchClient(new EsClientWithRequest(req), log);
        const res = await docSearchClient.search(searchReq);
        return res;
      } catch (error) {
        return Boom.internal(`Search Exception`);
      }
    },
  });

  router.route({
    path: '/api/code/suggestions/doc',
    method: 'GET',
    async handler(req: RequestFacade) {
      let page = 1;
      const { p, q, repoScope } = req.query as RequestQueryFacade;
      if (p) {
        page = parseInt(p as string, 10);
      }

      const searchReq: DocumentSearchRequest = {
        query: q as string,
        page,
        repoScope: await getScope(req, repoScope),
      };
      try {
        const docSearchClient = new DocumentSearchClient(new EsClientWithRequest(req), log);
        const res = await docSearchClient.suggest(searchReq);
        return res;
      } catch (error) {
        return Boom.internal(`Search Exception`);
      }
    },
  });

  // Resolve source code snippets base on APM's stacktrace item data including:
  // * repoUri: ID of the repository
  // * revision: Optional. Revision of the file.
  // * filePath: the path of the file.
  // * lineNumStart: the start line number of the snippet.
  // * lineNumEnd: Optional. The end line number of the snippet.
  // We can always add more context for snippet resolution in the future.
  router.route({
    path: '/api/code/integration/snippets',
    method: 'POST',
    async handler(req: RequestFacade) {
      const reqs: StackTraceSnippetsRequest[] = (req.payload as any).requests;
      const scopes = new Set(
        await getReferenceHelper(req.getSavedObjectsClient()).findReferences()
      );
      return await Promise.all(
        reqs.map((stacktraceReq: StackTraceSnippetsRequest) => {
          const integClient = new IntegrationsSearchClient(new EsClientWithRequest(req), log);
          return Promise.all(
            stacktraceReq.stacktraceItems.map((stacktrace: StackTraceItem) => {
              const repoUris = stacktraceReq.repoUris.filter(uri => scopes.has(uri));
              const integrationReq: ResolveSnippetsRequest = {
                repoUris,
                revision: stacktraceReq.revision,
                filePath: stacktrace.filePath,
                lineNumStart: stacktrace.lineNumStart,
                lineNumEnd: stacktrace.lineNumEnd,
              };
              return integClient.resolveSnippets(integrationReq);
            })
          );
        })
      );
    },
  });
}

export function symbolSearchRoute(router: CodeServerRouter, log: Logger) {
  const symbolSearchHandler = async (req: RequestFacade) => {
    let page = 1;
    const { p, q, repoScope } = req.query as RequestQueryFacade;
    if (p) {
      page = parseInt(p as string, 10);
    }

    const searchReq: SymbolSearchRequest = {
      query: q as string,
      page,
      repoScope: await getScope(req, repoScope),
    };
    try {
      const symbolSearchClient = new SymbolSearchClient(new EsClientWithRequest(req), log);
      const res = await symbolSearchClient.suggest(searchReq);
      return res;
    } catch (error) {
      return Boom.internal(`Search Exception`);
    }
  };

  // Currently these 2 are the same.
  router.route({
    path: '/api/code/suggestions/symbol',
    method: 'GET',
    handler: symbolSearchHandler,
  });
  router.route({
    path: '/api/code/search/symbol',
    method: 'GET',
    handler: symbolSearchHandler,
  });
}

export function commitSearchRoute(router: CodeServerRouter, log: Logger) {
  router.route({
    path: '/api/code/search/commit',
    method: 'GET',
    async handler(req: RequestFacade) {
      let page = 1;
      const { p, q, repos, repoScope } = req.query as RequestQueryFacade;
      if (p) {
        page = parseInt(p as string, 10);
      }

      const searchReq: CommitSearchRequest = {
        query: q as string,
        page,
        repoFilters: repos ? decodeURIComponent(repos as string).split(',') : [],
        repoScope: await getScope(req, repoScope),
      };
      try {
        const commitSearchClient = new CommitSearchClient(new EsClientWithRequest(req), log);
        const res = await commitSearchClient.search(searchReq);
        return res;
      } catch (error) {
        return Boom.internal(`Search Exception`);
      }
    },
  });
}

async function getScope(req: RequestFacade, repoScope: string | string[]): Promise<string[]> {
  let scope: string[] = await getReferenceHelper(req.getSavedObjectsClient()).findReferences();
  if (typeof repoScope === 'string') {
    const uriSet = new Set(repoScope.split(','));
    scope = scope.filter(uri => uriSet.has(uri));
  } else if (Array.isArray(repoScope)) {
    const uriSet = new Set(repoScope);
    scope = scope.filter(uri => uriSet.has(uri));
  }
  return scope;
}
