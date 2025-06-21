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
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'ID je obavezan za brisanje' });
  }

  let connection;
  try {
    console.log('🗑️ Brišem izveštaj ID:', id);
    connection = await mysql.createConnection(dbConfig);
    
    const [existing] = await connection.execute(
      'SELECT id, datum, smena FROM reports WHERE id = ?', 
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Izveštaj ne postoji' });
    }
    
    const [result] = await connection.execute(
      'DELETE FROM reports WHERE id = ?', 
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Izveštaj nije pronađen' });
    }
    
    console.log('✅ Izveštaj obrisan:', existing[0]);
    
    res.status(200).json({ 
      success: true,
      message: 'Izveštaj uspešno obrisan',
      deleted: existing[0]
    });

  } catch (error) {
    console.error('❌ MySQL greška pri brisanju:', error);
    
    res.status(500).json({ 
      error: 'Greška pri brisanju iz baze',
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