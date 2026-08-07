import 'dotenv/config';
import { Client } from 'pg';
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query(`SELECT column_name, data_type, column_default, is_nullable FROM information_schema.columns WHERE table_name='department' ORDER BY ordinal_position;`);
    console.log('columns:', JSON.stringify(res.rows, null, 2));
    const constraints = await client.query(`SELECT conname, pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname='department';`);
    console.log('constraints:', JSON.stringify(constraints.rows, null, 2));
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await client.end();
  }
})();
