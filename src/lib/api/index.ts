import * as auth from './auth';
import * as users from './users';
import * as tiers from './tiers';
import * as servers from './servers';
import * as clients from './clients';
import * as requests from './requests';
import * as health from './health';
import * as analytics from './analytics';

export const api = {
  auth,
  users,
  tiers,
  servers,
  clients,
  requests,
  health,
  analytics,
};

export type { ApiResult, ApiError, PaginatedResult } from './types';
export { apiConfig } from './config';
