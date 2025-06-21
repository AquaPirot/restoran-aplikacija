import mysql from 'mysql2/promise';

// MySQL konfiguracija za aggroup.rs hosting
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'aggroup_konobari_aplikacija',
  password: '~msns4KOmNXTpuy@',
  database: 'aggroup_restoran_aplikacija',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
};

let pool;

export async function getConnection() {
  try {
    if (!pool) {
      console.log('🔌 Kreiram MySQL pool konekciju...');
      pool = mysql.createPool(dbConfig);
    }
    return pool;
  } catch (error) {
    console.error('❌ Greška pri kreiranju pool konekcije:', error);
    throw new Error(`MySQL pool greška: ${error.message}`);
  }
}

export async function query(sql, params = []) {
  let connection;
  try {
    console.log('🔍 MySQL query:', sql.substring(0, 100) + '...');
    console.log('📋 Parametri:', params);
    
    connection = await getConnection();
    const [results] = await connection.execute(sql, params);
    
    console.log('✅ Query uspešan, rezultat:', results);
    return results;
  } catch (error) {
    console.error('❌ MySQL query error details:');
    console.error('- Message:', error.message);
    console.error('- Code:', error.code);
    console.error('- Errno:', error.errno);
    console.error('- SQL State:', error.sqlState);
    console.error('- SQL Message:', error.sqlMessage);
    console.error('- SQL:', sql);
    console.error('- Params:', params);
    
    // Specifične greške
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      throw new Error('MySQL: Neispravno korisničko ime ili lozinka');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      throw new Error('MySQL: Baza podataka ne postoji');
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('MySQL: Konekcija odbijena - server nije dostupan');
    } else if (error.code === 'ENOTFOUND') {
      throw new Error('MySQL: Host nije pronađen');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      throw new Error('MySQL: Tabela ne postoji');
    }
    
    throw new Error(`MySQL greška: ${error.message} (Code: ${error.code})`);
  }
}

export async function closeConnection() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 MySQL pool konekcija zatvorena');
  }
}