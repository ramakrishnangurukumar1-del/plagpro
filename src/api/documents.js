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

export function getDocumentFileUrl(id) {
  return client.get(`/api/documents/${id}/file`, { responseType: 'blob' }).then((r) => {
    const contentType = r.headers['content-type'] || 'application/octet-stream';
    const blob = new Blob([r.data], { type: contentType });
    return { url: URL.createObjectURL(blob), contentType };
  });
}

export async function getReportPdfBlobUrl(id) {
  const r = await client.get(`/api/documents/${id}/report`, { responseType: 'blob' });
  const blob = new Blob([r.data], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

export async function downloadReportPdf(id, filename) {
  const url = await getReportPdfBlobUrl(id);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'report.pdf';
  a.click();
  URL.revokeObjectURL(url);
}
