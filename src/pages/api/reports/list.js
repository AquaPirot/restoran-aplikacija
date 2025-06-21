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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection;
  try {
    console.log('🔍 Povezujem se sa MySQL za učitavanje...');
    connection = await mysql.createConnection(dbConfig);
    
    let sql = 'SELECT * FROM reports';
    let params = [];
    
    const { datum, smena } = req.query;
    
    if (datum) {
      sql += ' WHERE datum = ?';
      params.push(datum);
    } else if (smena) {
      sql += ' WHERE smena = ?';
      params.push(smena);
    }
    
    sql += ' ORDER BY datum DESC, timestamp DESC';
    
    console.log('📋 SQL:', sql);
    console.log('🔍 Parametri:', params);
    
    const [rows] = await connection.execute(sql, params);
    
    const reports = rows.map(row => ({
      id: row.id,
      datum: row.datum,
      smena: row.smena,
      apoeni: {
        '5000': row.apoeni_5000 || 0,
        '2000': row.apoeni_2000 || 0,
        '1000': row.apoeni_1000 || 0,
        '500': row.apoeni_500 || 0,
        '200': row.apoeni_200 || 0,
        '100': row.apoeni_100 || 0,
        '50': row.apoeni_50 || 0,
        '20': row.apoeni_20 || 0,
        '10': row.apoeni_10 || 0
      },
      euri: parseFloat(row.euri) || 0,
      ukupnaGotovina: parseFloat(row.ukupna_gotovina) || 0,
      kartice: parseFloat(row.kartice) || 0,
      virman: parseFloat(row.virman) || 0,
      vipPopust: parseFloat(row.vip_popust) || 0,
      napomena: row.napomena || '',
      izvestajSastavio: row.izvestaj_sastavio,
      timestamp: row.timestamp,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    console.log('✅ Učitano', reports.length, 'izveštaja iz MySQL');
    
    res.status(200).json(reports);

  } catch (error) {
    console.error('❌ MySQL greška pri učitavanju:', error);
    
    res.status(500).json({ 
      error: 'Greška pri učitavanju iz baze',
      details: error.message,
      code: error.code || 'UNKNOWN'
    });
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 MySQL konekcija zatvorena');
    }
  }
}