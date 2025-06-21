import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'aggroup.rs',
  port: 3306,
  user: 'aggroup_konobari_aplikacija',
  password: '~msns4KOmNXTpuy@',
  database: 'aggroup_restoran_aplikacija',
  ssl: false,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 10000
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const {
      datum, smena, apoeni, euri, ukupnaGotovina,
      kartice, virman, vipPopust, napomena, izvestajSastavio
    } = req.body;

    if (!datum || !smena || !izvestajSastavio) {
      return res.status(400).json({ 
        error: 'Nedostaju obavezna polja' 
      });
    }

    const sql = `
      INSERT INTO reports (
        datum, smena, apoeni_5000, apoeni_2000, apoeni_1000, apoeni_500,
        apoeni_200, apoeni_100, apoeni_50, apoeni_20, apoeni_10,
        euri, ukupna_gotovina, kartice, virman, vip_popust,
        napomena, izvestaj_sastavio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      datum, smena,
      parseInt(apoeni?.['5000']) || 0,
      parseInt(apoeni?.['2000']) || 0,
      parseInt(apoeni?.['1000']) || 0,
      parseInt(apoeni?.['500']) || 0,
      parseInt(apoeni?.['200']) || 0,
      parseInt(apoeni?.['100']) || 0,
      parseInt(apoeni?.['50']) || 0,
      parseInt(apoeni?.['20']) || 0,
      parseInt(apoeni?.['10']) || 0,
      parseFloat(euri) || 0,
      parseFloat(ukupnaGotovina) || 0,
      parseFloat(kartice) || 0,
      parseFloat(virman) || 0,
      parseFloat(vipPopust) || 0,
      napomena || '',
      izvestajSastavio
    ];

    const [result] = await connection.execute(sql, values);
    
    res.status(200).json({ 
      success: true, 
      id: result.insertId,
      message: 'Sačuvano u MySQL!' 
    });

  } catch (error) {
    console.error('MySQL error:', error);
    
    res.status(500).json({ 
      error: 'MySQL greška',
      details: error.message,
      code: error.code
    });
  } finally {
    if (connection) await connection.end();
  }
}