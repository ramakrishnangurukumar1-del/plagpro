import client from './client';

export function uploadDocuments(files) {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  return client.post('/api/documents/upload', formData).then((r) => r.data);
}

export function getMyDocuments() {
  return client.get('/api/documents/mine').then((r) => r.data);
}

export function getDocumentResult(id) {
  return client.get(`/api/documents/${id}/result`).then((r) => r.data);
}

export function getFacultyDocuments() {
  return client.get('/api/faculty/documents').then((r) => r.data);
}

export function getFacultyStats() {
  return client.get('/api/faculty/stats').then((r) => r.data);
}
