// Kalkulacije za restoran aplikaciju

export const calculateGotovina = (apoeni, euri = 0) => {
  const apoenVrednosti = {
    5000: 5000,
    2000: 2000,
    1000: 1000,
    500: 500,
    200: 200,
    100: 100,
    50: 50,
    20: 20,
    10: 10
  };
  
  let ukupnoApoeni = 0;
  Object.keys(apoenVrednosti).forEach(apoen => {
    ukupnoApoeni += (apoeni[apoen] || 0) * apoenVrednosti[apoen];
  });
  
  const euriUDinarima = euri * 116;
  
  return {
    ukupnoApoeni,
    euriUDinarima,
    ukupnaGotovina: ukupnoApoeni + euriUDinarima
  };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('sr-RS').format(amount) + ' RSD';
};