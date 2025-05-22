// Koristimo samo Firebase - uklanjamo localStorage fallback
import { saveReportToFirebase, getReportsFromFirebase } from './firebase';

export const saveReport = async (reportData) => {
  console.log('storage.js: pozivam saveReportToFirebase');
  return await saveReportToFirebase(reportData);
};

export const getReports = async () => {
  console.log('storage.js: pozivam getReportsFromFirebase');
  return await getReportsFromFirebase();
};

export const getReportsByDate = async (datum) => {
  console.log('storage.js: filtriram po datumu:', datum);
  const reports = await getReportsFromFirebase();
  return reports.filter(report => report.datum === datum);
};

export const getReportsBySmena = async (smena) => {
  console.log('storage.js: filtriram po smeni:', smena);
  const reports = await getReportsFromFirebase();
  return reports.filter(report => report.smena === smena);
};