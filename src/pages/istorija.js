import { useState, useEffect } from 'react';
import { getReports, deleteReport, getDaysUntilExpiry } from '../utils/storage';
import { formatCurrency } from '../utils/calculations';
import Link from 'next/link';

export default function Istorija() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSmena, setSelectedSmena] = useState('');
  const [showDetails, setShowDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    let filtered = [...reports];
    if (selectedDate) filtered = filtered.filter(r => r.datum === selectedDate);
    if (selectedSmena) filtered = filtered.filter(r => r.smena === selectedSmena);
    setFilteredReports(filtered);
  }, [reports, selectedDate, selectedSmena]);

  const loadReports = async () => {
    setLoading(true);
    const freshReports = await getReports();
    setReports(freshReports);
    setLastUpdate(new Date());
    setLoading(false);
  };

  const handleDelete = async (reportId, datum, smena) => {
    const confirmMessage = `Da li ste sigurni da želite da obrišete izveštaj?\n\nDatum: ${formatDate(datum)}\nSmena: ${smena}`;
    if (confirm(confirmMessage)) {
      await deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    }
  };

  const toggleDetails = (reportId) => {
    setShowDetails(prev => ({ ...prev, [reportId]: !prev[reportId] }));
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
    return [...new Set(reports.map(r => r[key]))].sort();
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
    return reports
      .filter(r => r.datum === datum)
      .reduce((sum, r) => sum + (r.ukupnaGotovina || 0), 0);
  };

  const expiryBadge = (report) => {
    const days = getDaysUntilExpiry(report);
    if (days <= 1) return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Ističe sutra</span>;
    if (days <= 2) return <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Ističe za {days} dana</span>;
    return <span className="text-xs text-gray-400">Ističe za {days} dana</span>;
  };

  const totals = calculateTotals(filteredReports);

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center py-8">
          <div className="text-2xl">⏳</div>
          <p className="text-gray-500 mt-2">Učitavam izveštaje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">📊 Istorija izveštaja</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>📱 Lokalno čuvanje · 7 dana</span>
          </div>
          {lastUpdate && (
            <p className="text-xs text-gray-400">
              Poslednje ažuriranje: {lastUpdate.toLocaleTimeString('sr-RS')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadReports}
            className="px-3 py-2 rounded-lg text-sm bg-gray-500 text-white hover:bg-gray-600"
          >
            🔄 Osveži
          </button>
          <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Novi izveštaj
          </Link>
        </div>
      </div>

      {/* Statistike */}
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <div className="flex justify-between text-sm">
          <span>Ukupno izveštaja: <strong>{reports.length}</strong></span>
          <span>Prikazano: <strong>{filteredReports.length}</strong></span>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Nemate sačuvane izveštaje</p>
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
                    {formatDate(datum)} — {formatCurrency(getTotalForDate(datum))}
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
                  <option key={smena} value={smena}>{smena}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => { setSelectedDate(''); setSelectedSmena(''); }}
                className="w-full p-3 bg-gray-500 text-white rounded-lg"
              >
                Resetuj filtere
              </button>
            </div>
          </div>

          {/* Ukupni izveštaj */}
          {filteredReports.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold mb-3">
                📈 Ukupno za {filteredReports.length} izveštaj(a):
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium">Gotovina</div>
                  <div className="text-lg font-bold text-green-600">{formatCurrency(totals.gotovina)}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Kartice</div>
                  <div className="text-lg font-bold text-blue-600">{formatCurrency(totals.kartice)}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Virman</div>
                  <div className="text-lg font-bold text-purple-600">{formatCurrency(totals.virman)}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">VIP popust</div>
                  <div className="text-lg font-bold text-red-600">{formatCurrency(totals.vipPopust)}</div>
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
                  <div className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => toggleDetails(report.id)}
                      >
                        <h3 className="font-bold text-lg">
                          {formatDate(report.datum)} — {report.smena}
                        </h3>
                        <p className="text-sm text-gray-600">Sastavio: {report.izvestajSastavio}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {new Date(report.timestamp).toLocaleString('sr-RS')}
                          </p>
                          {expiryBadge(report)}
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(report.ukupnaGotovina || 0)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {showDetails[report.id] ? '▼' : '▶'} Detaljno
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(report.id, report.datum, report.smena);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                          title="Obriši izveštaj"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>

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
                          <p className="text-sm bg-white p-3 rounded border">{report.napomena}</p>
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
