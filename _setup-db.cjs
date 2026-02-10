// Script temporário para criar schema no Supabase
// Deletar após uso
const { Client } = require('pg');
const dns = require('dns');
const fs = require('fs');

// Forçar IPv4
dns.setDefaultResultOrder('ipv4first');

const client = new Client({
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.bwxrgdevafcacyjayuou',
  password: 'y8?3$33#uN48cWF',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    await client.connect();
    console.log('Conectado ao Supabase Postgres!');

    const schema = fs.readFileSync('supabase-schema.sql', 'utf8');
    await client.query(schema);
    console.log('✅ Schema criado com sucesso!');

    const seed = fs.readFileSync('supabase-seed.sql', 'utf8');
    await client.query(seed);
    console.log('✅ Seed executado com sucesso!');

    // Verificar
    const { rows: pessoas } = await client.query('SELECT count(*) FROM pessoas');
    const { rows: usuarios } = await client.query('SELECT count(*) FROM usuarios');
    const { rows: demandas } = await client.query('SELECT count(*) FROM demandas');
    console.log(`\nVerificação:`);
    console.log(`  Pessoas: ${pessoas[0].count}`);
    console.log(`  Usuarios: ${usuarios[0].count}`);
    console.log(`  Demandas: ${demandas[0].count}`);
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await client.end();
  }
}

run();
