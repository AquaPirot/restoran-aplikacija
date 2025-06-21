import { query } from '../../lib/mysql';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Testiranje MySQL konekcije...');

    // Test osnovne konekcije
    const testQuery = 'SELECT 1 as test';
    const result = await query(testQuery);
    console.log('✅ Osnovna konekcija radi:', result);

    // Test da li tabela postoji
    const tableCheck = 'SHOW TABLES LIKE "reports"';
    const tableResult = await query(tableCheck);
    console.log('🔍 Tabela "reports" postoji:', tableResult.length > 0);

    if (tableResult.length === 0) {
      return res.status(500).json({ 
        error: 'Tabela "reports" ne postoji u bazi',
        suggestion: 'Kreirajte tabelu pomoću SQL koda iz instrukcija'
      });
    }

    // Test strukture tabele
    const structure = await query('DESCRIBE reports');
    console.log('📋 Struktura tabele:', structure);

    // Test insert dozvole
    const testInsert = `
      INSERT INTO reports (
        datum, smena, apoeni_5000, apoeni_2000, apoeni_1000, apoeni_500,
        apoeni_200, apoeni_100, apoeni_50, apoeni_20, apoeni_10,
        euri, ukupna_gotovina, kartice, virman, vip_popust,
        napomena, izvestaj_sastavio
      ) VALUES (
        '2025-01-01', 'TEST', 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 'Test insert', 'DEBUG TEST'
      )
    `;
    
    const insertResult = await query(testInsert);
    console.log('✅ Test insert uspešan:', insertResult.insertId);

    // Obriši test zapis
    await query('DELETE FROM reports WHERE izvestaj_sastavio = "DEBUG TEST"');
    console.log('🧹 Test zapis obrisan');

    res.status(200).json({ 
      success: true,
      message: 'MySQL konekcija radi ispravno!',
      details: {
        connectionTest: 'OK',
        tableExists: true,
        tableStructure: structure,
        insertTest: 'OK'
      }
    });

  } catch (error) {
    console.error('❌ Debug test greška:', error);
    res.status(500).json({ 
      error: 'MySQL konekcija neuspešna',
      details: {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      }
    });
  }
}