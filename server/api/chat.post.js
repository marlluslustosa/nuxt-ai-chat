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
        console.error("Error:", error.message);
        return {
            message: "Desculpe, ocorreu um erro ao processar sua solicitação.",
            error: error.message
        };
    }
});
