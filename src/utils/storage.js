// Privremeno localStorage - zamenićemo sa Firebase
export const saveReport = (reportData) => {
  const reports = getReports();
  const newReport = {
    id: Date.now(),
    ...reportData,
    timestamp: new Date().toISOString()
  };
  
  const updatedReports = [newReport, ...reports];
  localStorage.setItem('restoran-izvestaji', JSON.stringify(updatedReports));
  return newReport;
};

export const getReports = () => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('restoran-izvestaji');
  return data ? JSON.parse(data) : [];
};

export const getReportsByDate = (datum) => {
  return getReports().filter(report => report.datum === datum);
};

export const getReportsBySmena = (smena) => {
  return getReports().filter(report => report.smena === smena);
};