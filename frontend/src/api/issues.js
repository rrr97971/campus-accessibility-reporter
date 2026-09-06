import api from './axios';

// Scoped to the logged-in user on the backend — no user_id needs to be passed.
export async function getMyIssues(params = {}) {
  const { data } = await api.get('/issues', { params });
  return data.issues;
}

export async function getIssueById(id) {
  const { data } = await api.get(`/issues/${id}`);
  return data.issue;
}

export async function createIssue(issue) {
  const { data } = await api.post('/issues', issue);
  return data.issue;
}

export async function updateIssue(id, issue) {
  const { data } = await api.put(`/issues/${id}`, issue);
  return data.issue;
}

export async function deleteIssue(id) {
  const { data } = await api.delete(`/issues/${id}`);
  return data;
}

export async function getIssueUpdates(id) {
  const { data } = await api.get(`/issues/${id}/updates`);
  return data.updates;
}
