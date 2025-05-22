import { useState, useEffect } from 'react';
import { getReports, getReportsByDate, getReportsBySmena } from '../utils/storage';
import { formatCurrency } from '../utils/calculations';
import Link from 'next/link';

export default function Istorija() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSmena, setSelectedSmena] = useState('');
  const [showDetails, setShowDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, selectedDate, selectedSmena]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const allReports = await getReports(); // Sada je async
      setReports(allReports);
      console.log('Učitano', allReports.length, 'izveštaja iz Firebase');
    } catch (error) {
      console.error('Greška pri učitavanju izveštaja:', error);
      alert('Greška pri učitavanju izveštaja iz baze');
    } finally {
      setLoading(false);
    }
  };

  const filterReports = async () => {
    try {
      let filtered = [...reports];
      
      // Ako su odabrani specifični filteri, koristi Firebase query-je
      if (selectedDate && selectedSmena) {
        // Kombinacija oba filtera - filtriraj localno
        filtered = reports.filter(report => 
          report.datum === selectedDate && report.smena === selectedSmena
        );
      } else if (selectedDate) {
        // Samo datum - koristi Firebase query
        filtered = await getReportsByDate(selectedDate);
      } else if (selectedSmena) {
        // Samo smena - koristi Firebase query  
        filtered = await getReportsBySmena(selectedSmena);
      }
      
      setFilteredReports(filtered);
    } catch (error) {
      console.error('Greška pri filtriranju:', error);
      setFilteredReports([]);
    }
  };

  const toggleDetails = (reportId) => {
    setShowDetails(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };

  const formatDate = (datum) => {
    const date = new Date(datum);
    return date.toLocaleDateString('sr-RS', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getUniqueValues = (key) => {
    return [...new Set(reports.map(report => report[key]))].sort();
  };

  const calculateTotals = (reportsList) => {
    return reportsList.reduce((totals, report) => ({
      gotovina: totals.gotovina + (report.ukupnaGotovina || 0),
      kartice: totals.kartice + (report.kartice || 0),
      virman: totals.virman + (report.virman || 0),
      vipPopust: totals.vipPopust + (report.vipPopust || 0)
    }), { gotovina: 0, kartice: 0, virman: 0, vipPopust: 0 });
  };

  const getTotalForDate = (datum) => {
    const calcsForDate = reports.filter(report => report.datum === datum);
    return calcsForDate.reduce((sum, calc) => sum + (calc.ukupnaGotovina || 0), 0);
  };

  const totals = calculateTotals(filteredReports);

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center py-8">
          <div className="text-2xl">⏳</div>
          <p className="text-gray-500 mt-2">Učitavam izveštaje iz Firebase baze...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">📊 Istorija izveštaja</h1>
          <p className="text-sm text-gray-500">Real-time sinhronizacija sa Firebase</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadReports}
            className="bg-gray-500 text-white px-3 py-2 rounded-lg text-sm"
          >
            🔄 Osvezi
          </button>
          <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Novi izveštaj
          </Link>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Nemate sačuvane izveštaje u Firebase bazi</p>
          <Link href="/" className="bg-blue-500 text-white px-6 py-3 rounded-lg">
            Kreiraj prvi izveštaj
          </Link>
        </div>
      ) : (
        <>
          {/* Filteri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block mb-2 font-medium">Filter po datumu:</label>
              <select 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Svi datumi</option>
                {getUniqueValues('datum').map(datum => (
                  <option key={datum} value={datum}>
                    {formatDate(datum)} - {formatCurrency(getTotalForDate(datum))}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Filter po smeni:</label>
              <select 
                value={selectedSmena}
                onChange={(e) => setSelectedSmena(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Sve smene</option>
                {getUniqueValues('smena').map(smena => (
                  <option key={smena} value={smena}>
                    {smena}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button 
                onClick={() => {
                  setSelectedDate('');
                  setSelectedSmena('');
                }}
                className="w-full p-3 bg-gray-500 text-white rounded-lg"
              >
                Resetuj filtere
              </button>
            </div>
          </div>

          {/* Ukupni izveštaj */}
          {filteredReports.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold mb-3">
                📈 Ukupno za {filteredReports.length} izveštaj(a):
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium">Gotovina</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(totals.gotovina)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Kartice</div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(totals.kartice)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Virman</div>
                  <div className="text-lg font-bold text-purple-600">
                    {formatCurrency(totals.virman)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium">VIP popust</div>
                  <div className="text-lg font-bold text-red-600">
                    {formatCurrency(totals.vipPopust)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista izveštaja */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <p className="text-gray-500 text-center">Nema izveštaja za izabrane filtere</p>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="bg-white border rounded-lg shadow-sm">
                  {/* Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleDetails(report.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">
                          {formatDate(report.datum)} - {report.smena}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Sastavio: {report.izvestajSastavio}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(report.timestamp).toLocaleString('sr-RS')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(report.ukupnaGotovina || 0)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {showDetails[report.id] ? '▼' : '▶'} Detaljno
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalji */}
                  {showDetails[report.id] && (
                    <div className="border-t p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium mb-2">💰 Gotovinski promet:</h4>
                          <div className="text-sm space-y-1">
                            {report.apoeni && Object.entries(report.apoeni).map(([apoen, broj]) => 
                              broj > 0 && (
                                <div key={apoen} className="flex justify-between">
                                  <span>{apoen} RSD × {broj}:</span>
                                  <span>{formatCurrency(apoen * broj)}</span>
                                </div>
                              )
                            )}
                            {report.euri > 0 && (
                              <div className="flex justify-between">
                                <span>{report.euri} € × 116:</span>
                                <span>{formatCurrency(report.euri * 116)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">💳 Ostali iznosi:</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Kartice:</span>
                              <span>{formatCurrency(report.kartice || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Virman:</span>
                              <span>{formatCurrency(report.virman || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>VIP popust:</span>
                              <span className="text-red-600">{formatCurrency(report.vipPopust || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {report.napomena && (
                        <div>
                          <h4 className="font-medium mb-2">📝 Napomena:</h4>
                          <p className="text-sm bg-white p-3 rounded border">
                            {report.napomena}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}