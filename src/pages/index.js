import { useState } from 'react';
import { calculateGotovina, formatCurrency } from '../utils/calculations';
import { saveReport } from '../utils/storage';
import Link from 'next/link';

export default function RestoranForma() {
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0]);
  const [smena, setSmena] = useState('');
  const [apoeni, setApoeni] = useState({
    5000: '',
    2000: '',
    1000: '',
    500: '',
    200: '',
    100: '',
    50: '',
    20: '',
    10: ''
  });
  const [euri, setEuri] = useState('');
  const [kartice, setKartice] = useState('');
  const [virman, setVirman] = useState('');
  const [vipPopust, setVipPopust] = useState('');
  const [napomena, setNapomena] = useState('');
  const [izvestajSastavio, setIzvestajSastavio] = useState('');
  const [sacuvano, setSacuvano] = useState(false);

  const apoenVrednosti = [5000, 2000, 1000, 500, 200, 100, 50, 20, 10];
  
  const { ukupnoApoeni, euriUDinarima, ukupnaGotovina } = calculateGotovina(apoeni, Number(euri) || 0);

  const handleApoenChange = (vrednost, broj) => {
    setApoeni(prev => ({
      ...prev,
      [vrednost]: broj
    }));
  };

  const handleSacuvaj = () => {
    if (!datum || !smena || !izvestajSastavio) {
      alert('Molimo unesite datum, smenu i ko je sastavio izveštaj!');
      return;
    }

    const reportData = {
      datum,
      smena,
      apoeni,
      euri: Number(euri) || 0,
      ukupnaGotovina,
      kartice: Number(kartice) || 0,
      virman: Number(virman) || 0,
      vipPopust: Number(vipPopust) || 0,
      napomena,
      izvestajSastavio
    };

    saveReport(reportData);
    setSacuvano(true);
    
    // Reset forme nakon 2 sekunde
    setTimeout(() => {
      setSacuvano(false);
      // Reset svih polja osim datuma i ko je sastavio
      setSmena('');
      setApoeni({
        5000: '', 2000: '', 1000: '', 500: '', 200: '', 100: '', 50: '', 20: '', 10: ''
      });
      setEuri('');
      setKartice('');
      setVirman('');
      setVipPopust('');
      setNapomena('');
    }, 2000);
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dnevni izveštaj</h1>
        <Link href="/istorija" className="text-blue-500 text-sm">
          Istorija
        </Link>
      </div>

      {/* Datum i Smena */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-2 font-medium">Datum:</label>
          <input 
            type="date" 
            value={datum} 
            onChange={(e) => setDatum(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Smena:</label>
          <select 
            value={smena} 
            onChange={(e) => setSmena(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Izaberi smenu</option>
            <option value="I smena">I smena</option>
            <option value="II smena">II smena</option>
            <option value="Dnevni pazar">Dnevni pazar</option>
          </select>
        </div>
      </div>

      {/* Gotovinski promet */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">💰 Gotovinski promet</h2>
        
        {/* Apoeni */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium mb-3">Apoeni:</h3>
          <div className="space-y-2">
            {apoenVrednosti.map(vrednost => (
              <div key={vrednost} className="flex items-center justify-between">
                <span className="w-16">{vrednost} RSD:</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={apoeni[vrednost]} 
                    onChange={(e) => handleApoenChange(vrednost, e.target.value)}
                    className="w-20 p-2 border rounded text-center"
                    placeholder="0"
                  />
                  <span className="w-24 text-sm text-gray-600">
                    = {formatCurrency((apoeni[vrednost] || 0) * vrednost)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between font-bold">
              <span>Ukupno apoeni:</span>
              <span className="text-green-600">{formatCurrency(ukupnoApoeni)}</span>
            </div>
          </div>
        </div>

        {/* Euri */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <label className="font-medium">Euri u pazaru:</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={euri} 
                onChange={(e) => setEuri(e.target.value)}
                className="w-20 p-2 border rounded text-center"
                placeholder="0"
              />
              <span className="text-sm">€</span>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {euri ? `${euri} × 116 = ${formatCurrency(euriUDinarima)}` : 'Unesite broj eura'}
          </div>
        </div>

        {/* Ukupna gotovina */}
        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">UKUPNA GOTOVINA:</span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(ukupnaGotovina)}
            </span>
          </div>
        </div>
      </div>

      {/* Ostali iznosi */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block mb-2 font-medium">💳 Ukupan iznos kartica:</label>
          <input 
            type="number" 
            value={kartice} 
            onChange={(e) => setKartice(e.target.value)}
            className="w-full p-3 border rounded-lg text-lg"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">🏦 Ukupan iznos virmana:</label>
          <input 
            type="number" 
            value={virman} 
            onChange={(e) => setVirman(e.target.value)}
            className="w-full p-3 border rounded-lg text-lg"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">🎫 Ukupan iznos VIP popusta:</label>
          <input 
            type="number" 
            value={vipPopust} 
            onChange={(e) => setVipPopust(e.target.value)}
            className="w-full p-3 border rounded-lg text-lg"
            placeholder="0"
          />
        </div>
      </div>

      {/* Napomena i sastavio */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block mb-2 font-medium">📝 Napomena:</label>
          <textarea 
            value={napomena} 
            onChange={(e) => setNapomena(e.target.value)}
            className="w-full p-3 border rounded-lg"
            rows="3"
            placeholder="Dodatne napomene..."
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">👤 Izveštaj sastavio:</label>
          <input 
            type="text" 
            value={izvestajSastavio} 
            onChange={(e) => setIzvestajSastavio(e.target.value)}
            className="w-full p-3 border rounded-lg text-lg"
            placeholder="Ime konobara"
          />
        </div>
      </div>

      {/* Save dugme */}
      <button 
        onClick={handleSacuvaj}
        className={`w-full p-4 rounded-lg text-lg font-bold ${
          sacuvano 
            ? 'bg-green-500 text-white' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        disabled={sacuvano}
      >
        {sacuvano ? '✅ Sačuvano!' : '💾 Sačuvaj izveštaj'}
      </button>

      {sacuvano && (
        <p className="text-center text-green-600 mt-2 font-medium">
          Izveštaj je uspešno sačuvan!
        </p>
      )}
    </div>
  );
}