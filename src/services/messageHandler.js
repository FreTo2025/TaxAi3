import whatsappService from './whatsappService.js';
import appendToSheet from './googleSheetsService.js';
import openAiService from './openAiService.js';

class MessageHandler {

  constructor() {
    this.appointmentState = {};
    this.assistandState = {};
  }

  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim();

      if(this.isGreeting(incomingMessage)){
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      } else if(incomingMessage === 'media') {
        await this.sendMedia(message.from);
      } else if (this.appointmentState[message.from]) {
        await this.handleAppointmentFlow(message.from, incomingMessage);
      } else if (this.assistandState[message.from]) {
        await this.handleAssistandFlow(message.from, incomingMessage);
      } else {
        await this.handleMenuOption(message.from, incomingMessage);
      }
      await whatsappService.markAsRead(message.id);
    } else if (message?.type === 'interactive') {
      const option = message?.interactive?.button_reply?.id;
      await this.handleMenuOption(message.from, option);
      await whatsappService.markAsRead(message.id);
    }
  }

  isGreeting(message) {
    const greetings = [
        "hola", "buen dia", "buen día", 
        "buenos dias", "buenos días", 
        "buenas tardes", "buenas noches"
    ];

    // Normaliza el mensaje (elimina espacios extra y convierte a minúsculas)
    const normalizedMessage = message.toLowerCase().trim();

    return greetings.some(greeting => normalizedMessage.includes(greeting));
}

  getSenderName(senderInfo) {
    return senderInfo.profile?.name || senderInfo.wa_id;
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo);
    const welcomeMessage = `Hola ${name}, Bienvenido a TaxAi, experto tributario en línea. ¿En qué puedo ayudarte hoy?`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  async sendWelcomeMenu(to) {
    const menuMessage = "Elige una Opción"
    const buttons = [
      {
        type: 'reply', reply: { id: 'option_1', title: 'Agendar' }
      },
      {
        type: 'reply', reply: { id: 'option_2', title: 'Consultar'}
      },
      {
        type: 'reply', reply: { id: 'option_3', title: 'Ubicación'}
      }
    ];

    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }

  waiting = (delay, callback) => {
    setTimeout(callback, delay);
  };

  async handleMenuOption(to, option) {
    let response;
    switch (option) {
      case 'option_1':
        this.appointmentState[to] = { step: 'name' }
        response = "Por favor, ingresa tu nombre:";
        break;
      case 'option_2':
        this.assistandState[to] = { step: 'question' };
        response = "Realiza tu consulta";
        break
      case 'option_3': 
       response = 'Te esperamos.';
       await this.sendLocation(to);
       break
       case 'option_5': // Opción para hacer otra pregunta
       this.assistandState[to] = { step: 'question' }; // Reinicia el flujo de consultas
       response = "Puedes hacer otra consulta.";
       break
       case 'option_6':
        response = "Sí requieres profundizar contacta a *Fredy O. Torres C.* Contador Público, Especialista en Gerencia y Administracion Tributaria, Certificado en Niif por ICAEW, Especialista en Gerencia de Proyectos, con mas de 12 años de experiencia"
        await this.sendContact(to);
        break
      default: 
       response = "¡Nos alegra haber sido de ayuda! 😊"
    }
    await whatsappService.sendMessage(to, response);
  }

  async sendMedia(to) {
    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-audio.aac';
    // const caption = 'Bienvenida';
    // const type = 'audio';

    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-imagen.png';
    // const caption = '¡Esto es una Imagen!';
    // const type = 'image';

    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4';
    // const caption = '¡Esto es una video!';
    // const type = 'video';

    const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-file.pdf';
    const caption = '¡Esto es un PDF!';
    const type = 'document';

    await whatsappService.sendMediaMessage(to, type, mediaUrl, caption);
  }

  async completeAppointment(to) {
    const appointment = this.appointmentState[to];
    delete this.appointmentState[to];

    const userData = [
      to,
      appointment.name,
      appointment.ClientName,
      appointment.ClientType,
      appointment.reason,
      new Date().toISOString()
    ];

    appendToSheet(userData);

    const response = `Gracias por agendar tu cita. 
    Resumen de tu cita:
    
    Nombre: ${appointment.name}
    Nombre de la empresa: ${appointment.ClientName}
    Actividad Económica: ${appointment.ClientType}
    Motivo: ${appointment.reason}
    
    Nos pondremos en contacto contigo pronto para confirmar la fecha y hora de tu cita.`;

    await whatsappService.sendMessage(to, response);
    await this.sendWelcomeMenu(to); // Enviar el menú después del resumen
}

  async handleAppointmentFlow(to, message) {
    const state = this.appointmentState[to];
    let response;

    switch (state.step) {
      case 'name':
        state.name = message;
        state.step = 'ClientName';
        response = "Gracias, Ahora, ¿Cuál es el nombre de tu Empresa?"
        break;
      case 'ClientName':
        state.ClientName = message;
        state.step = 'ClientType';
        response = '¿Cual es la actividad economica?'
        break;
      case 'ClientType':
        state.ClientType = message;
        state.step = 'reason';
        response = '¿Cuál es el motivo de la Consulta?';
        break;
      case 'reason':
        state.reason = message;
        response = this.completeAppointment(to);
        break;
    }
    await whatsappService.sendMessage(to, response);
  }

  async handleAssistandFlow(to, message) {
    const state = this.assistandState[to];
    let response;

    const menuMessage = "¿La respuesta fue de tu ayuda?"
    const buttons = [
      { type: 'reply', reply: { id: 'option_4', title: "Si, Gracias" } },
      { type: 'reply', reply: { id: 'option_5', title: 'Hacer otra pregunta'}},
      { type: 'reply', reply: { id: 'option_6', title: 'Contactar'}}
    ];

    if (state.step === 'question') {
      response = await openAiService(message);
    }

    delete this.assistandState[to];
    await whatsappService.sendMessage(to, response);
    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }

  async sendContact(to) {
    const contact = {
      addresses: [
        {
          street: "Cl 9 19 01",
          city: "San Jose del Guavaire",
          state: "Guaviare",
          zip: "950001",
          country: "Colombia",
          country_code: "CO",
          type: "WORK"
        }
      ],
      emails: [
        {
          email: "ftorres@ftcasesorias.co",
          type: "WORK"
        }
      ],
      name: {
        formatted_name: "Fredy O. Torres C.",
        first_name: "Fredy O.",
        last_name: "Torres C.",
        middle_name: "",
        suffix: "",
        prefix: ""
      },
      org: {
        company: "FTC Asesorias",
        department: "",
        title: "Tu Asesor"
      },
      phones: [
        {
          phone: "+573159999178",
          wa_id: "573159999178",
          type: "WORK"
        }
      ],
      urls: [
        {
          url: "https://www.ftcasesorias.co",
          type: "WORK"
        }
      ]
    };

    await whatsappService.sendContactMessage(to, contact);
  }

  async sendLocation(to) {
    const latitude = 2.568958;
    const longitude = -72.645452;
    const name = 'FTC';
    const address = 'Cl 9 19-01'

    await whatsappService.sendLocationMessage(to, latitude, longitude, name, address);
  }

}

export default new MessageHandler();
