import path from 'path';
import { google } from 'googleapis';

async function testAuth() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), 'src/credentials', 'credentials.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();
    console.log('✅ Token obtenido:', token);
  } catch (err) {
    console.error('❌ Error en autenticación:', err.response?.data || err.message || err);
  }
}

testAuth();

