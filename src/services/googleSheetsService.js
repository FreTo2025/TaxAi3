import path from 'path';
import { google } from 'googleapis';

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
        console.log('Client email:', (await auth.getCredentials()).client_email);
        const spreadsheetId = '1cUyad9EmmRlvbOWyecWTLHJSvmILy0WLopPpvHYWMjg'

        await addRowToSheet(authClient, spreadsheetId, data);
        return 'Datos correctamente agregados'
    } catch (error) {
        if (error.response) {
            console.error('API error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        console.error(error);
    }
}

export default appendToSheet;
