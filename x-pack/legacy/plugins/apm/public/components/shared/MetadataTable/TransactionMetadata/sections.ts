/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  Section,
  TRANSACTION,
  LABELS,
  HTTP,
  HOST,
  CONTAINER,
  SERVICE,
  PROCESS,
  AGENT,
  URL,
  PAGE,
  USER,
  USER_AGENT,
  CUSTOM_TRANSACTION
} from '../sections';

export const TRANSACTION_METADATA_SECTIONS: Section[] = [
  TRANSACTION,
  { ...LABELS, required: true },
  HTTP,
  HOST,
  CONTAINER,
  SERVICE,
  PROCESS,
  AGENT,
  URL,
  { ...PAGE, key: 'transaction.page' },
  { ...USER, required: true },
  USER_AGENT,
  CUSTOM_TRANSACTION
];
