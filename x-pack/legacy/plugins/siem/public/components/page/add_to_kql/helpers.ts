/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

export const createFilter = (key: string, value: string) => ({
  meta: {
    alias: null,
    negate: false,
    disabled: false,
    type: 'phrase',
    key,
    value,
    params: {
      query: value,
    },
  },
  query: {
    match: {
      [key]: {
        query: value,
        type: 'phrase',
      },
    },
  },
});
