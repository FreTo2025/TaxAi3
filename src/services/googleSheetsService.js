import path from 'path';
import { google } from 'googleapis';

import fs from 'fs';
const credentialsPath = path.join(process.cwd(), 'src/credentials', 'credentials.json');
const content = fs.readFileSync(credentialsPath, 'utf-8');
console.log('📄 Primeras líneas de private_key:\n', JSON.parse(content).private_key.split('\n').slice(0, 3));



const sheets = google.sheets('v4');

async function addRowToSheet(auth, spreadsheetId, values) {
    const request = {
        spreadsheetId,
        range: 'reservas',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: [values],
        },
        auth,
    }

    try {
        const response = (await sheets.spreadsheets.values.append(request).data);
        return response;
    } catch (error) {
        console.error(error)
    }
}

const appendToSheet = async (data) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), 'src/credentials', 'credentials.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const authClient = await auth.getClient();
        const spreadsheetId = '1cUyad9EmmRlvbOWyecWTLHJSvmILy0WLopPpvHYWMjg'


auth.getClient().then(() => {
  console.log('✔️ Autenticación exitosa');
}).catch(err => {
  console.error('❌ Error autenticando:', err);
});



        
        await addRowToSheet(authClient, spreadsheetId, data);
        return 'Datos correctamente agregados'
    } catch (error) {
        console.error(error);
    }
}

export default appendToSheet;
