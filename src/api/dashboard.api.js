import { request } from './client.js';

export const dashboardApi = {
  overview() {
    return request('/api/dashboard/overview');
  },
};
