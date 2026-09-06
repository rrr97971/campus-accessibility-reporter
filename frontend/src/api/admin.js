import api from './axios';

export async function getAllIssuesAdmin(params = {}) {
  const { data } = await api.get('/admin/issues', { params });
  return data.issues;
}

export async function getDashboardStats() {
  const { data } = await api.get('/admin/dashboard');
  return data.stats;
}

export async function updateIssueStatus(id, status, comment) {
  const { data } = await api.put(`/admin/issues/${id}/status`, { status, comment });
  return data.issue;
}

export async function updateIssuePriority(id, priority) {
  const { data } = await api.put(`/admin/issues/${id}/priority`, { priority });
  return data.issue;
}

export async function assignIssue(id, assigned_to) {
  const { data } = await api.put(`/admin/issues/${id}/assign`, { assigned_to });
  return data.issue;
}

export async function deleteIssueAdmin(id) {
  const { data } = await api.delete(`/admin/issues/${id}`);
  return data;
}
