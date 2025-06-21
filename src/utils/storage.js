// Next.js API routes pristup - sada imamo sve endpoints
export const saveReport = async (reportData) => {
  console.log('storage.js: šalje na /api/reports/save');
  
  try {
    const response = await fetch('/api/reports/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Greška pri čuvanju');
    }

    const result = await response.json();
    console.log('✅ Sačuvano u MySQL:', result);
    return result;
  } catch (error) {
    console.error('❌ API greška:', error);
    throw error;
  }
};

export const getReports = async () => {
  console.log('storage.js: šalje na /api/reports/list');
  
  try {
    const response = await fetch('/api/reports/list');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Greška pri učitavanju');
    }

    const reports = await response.json();
    console.log('✅ Učitano iz MySQL:', reports.length, 'izveštaja');
    return reports;
  } catch (error) {
    console.error('❌ API greška:', error);
    throw error;
  }
};

export const getReportsByDate = async (datum) => {
  try {
    const response = await fetch(`/api/reports/list?datum=${datum}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Greška pri učitavanju');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ API greška:', error);
    throw error;
  }
};

export const getReportsBySmena = async (smena) => {
  try {
    const response = await fetch(`/api/reports/list?smena=${encodeURIComponent(smena)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Greška pri učitavanju');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ API greška:', error);
    throw error;
  }
};