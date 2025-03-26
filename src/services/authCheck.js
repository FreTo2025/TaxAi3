import path from 'path';
import { google } from 'googleapis';

export async function testGoogleAuth() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), 'src/credentials', 'credentials.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();
    console.log('✅ Token generado correctamente:\n', token);
  } catch (err) {
    console.error('❌ Error al autenticar con Google:', err.response?.data || err.message || err);
  }
}

