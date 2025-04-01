import OpenAI from "openai";
import config from "../config/env.js";

const client = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
});

const openAiService = async (message) => {
    try {
        const response = await client.chat.completions.create({
            messages: [{ role: 'system', content: 'Eres parte de un servicio de asistencia online y debes de comportarte como un experto tributario en colombia, experto en niif y experto en auditoria. Resuelve las preguntas citando las normas vigentes a 2025, con una explicación tecnica y precisa evaluando que la informacion a responder efectivamente este actualizada. Debes de responde en texto simple como si fuera un mensaje de un bot conversacional, no saludes, no generas conversación, solo respondes con la pregunta del usuario. siempre al finalizar cada respuesta, indica que no se es responsable de lo que se pueda realizar con la informacion suministrada y que lo mejor es que contacte a un experto'}, { role: 'user', content: message }],
            model: 'gpt-4o'
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error(error);
    }
}

export default openAiService;
