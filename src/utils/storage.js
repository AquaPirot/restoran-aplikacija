const STORAGE_KEY = 'restoran_reports';
const AUTHOR_KEY = 'restoran_last_author';
const EXPIRY_DAYS = 7;

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const readAll = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const writeAll = (reports) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

const isExpired = (report) => {
  const savedAt = new Date(report.savedAt || report.timestamp);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - EXPIRY_DAYS);
  return savedAt < cutoff;
};

const purgeExpired = (reports) => {
  const valid = reports.filter(r => !isExpired(r));
  if (valid.length !== reports.length) writeAll(valid);
  return valid;
};

export const saveReport = async (reportData) => {
  const reports = readAll();
  const report = {
    ...reportData,
    id: generateId(),
    savedAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  };
  reports.unshift(report);
  writeAll(reports);
  return report;
};

export const getReports = async () => {
  return purgeExpired(readAll());
};

export const getReportsByDate = async (datum) => {
  const reports = await getReports();
  return reports.filter(r => r.datum === datum);
};

export const getReportsBySmena = async (smena) => {
  const reports = await getReports();
  return reports.filter(r => r.smena === smena);
};

export const deleteReport = async (id) => {
  writeAll(readAll().filter(r => r.id !== id));
};

export const getDaysUntilExpiry = (report) => {
  const savedAt = new Date(report.savedAt || report.timestamp);
  const expiresAt = new Date(savedAt);
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);
  const msLeft = expiresAt - new Date();
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
};

export const getLastAuthor = () => {
  try { return localStorage.getItem(AUTHOR_KEY) || ''; } catch { return ''; }
};

export const saveLastAuthor = (name) => {
  try { localStorage.setItem(AUTHOR_KEY, name); } catch {}
};
