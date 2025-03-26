import { google } from 'googleapis';
import credentials from '../credentials/credentials.json' assert { type: 'json' }; // Import directo del JSON

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
    };

    try {
        const response = (await sheets.spreadsheets.values.append(request)).data;
        return response;
    } catch (error) {
        console.error('❌ Error al agregar fila:', error.response?.data || error.message || error);
    }
}

const appendToSheet = async (data) => {
    try {
        const auth = new google.auth.JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        await auth.authorize(); // Autenticación explícita

        const spreadsheetId = '1cUyad9EmmRlvbOWyecWTLHJSvmILy0WLopPpvHYWMjg';

        await addRowToSheet(auth, spreadsheetId, data);
        return '✅ Datos correctamente agregados';
    } catch (error) {
        console.error('❌ Error en appendToSheet:', error.response?.data || error.message || error);
    }
};

export default appendToSheet;
