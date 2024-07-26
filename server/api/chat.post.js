import axios from 'axios';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const previosMessages = await readBody(event);

    // Verifique se as chaves de configuração estão definidas
    if (!config.public.CHATPDF_API_KEY || !config.public.CHATPDF_SOURCE_ID) {
        console.error("Chaves de API ou Source ID não configuradas");
        return {
            message: "Erro de configuração do servidor",
            error: "API keys não configuradas"
        };
    }

    const chatPdfConfig = {
        headers: {
            "x-api-key": config.public.CHATPDF_API_KEY,
            "Content-Type": "application/json",
        },
	timeout: 30000, // 30 segundos de timeout
    };

    const chatPdfData = {
        referenceSources: true,
        sourceId: config.public.CHATPDF_SOURCE_ID,
        messages: previosMessages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.message
        })),
    };

    try {
        const response = await axios.post(
            "https://api.chatpdf.com/v1/chats/message",
            chatPdfData,
            chatPdfConfig
        );

        return {
            message: response.data.content
        };
    } catch (error) {
  console.error("Error:", error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error("Response data:", error.response.data);
    console.error("Response status:", error.response.status);
    console.error("Response headers:", error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    console.error("Request:", error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error("Error message:", error.message);
  }
  return {
    message: "Desculpe, ocorreu um erro ao processar sua solicitação.",
    error: error.message
  };
} 
});
