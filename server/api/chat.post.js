import axios from 'axios';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const previosMessages = await readBody(event);

    if (!config.public.CHATPDF_API_KEY || !config.public.CHATPDF_SOURCE_ID) {
        console.error("Chaves de API ou Source ID não configuradas");
        return {
            success: false,
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

        // Sanitizar e processar a resposta
        const sanitizedContent = sanitizeContent(response.data.content);

        return {
            success: true,
            message: sanitizedContent
        };
    } catch (error) {
        console.error("Error:", error);
        let errorMessage = "Desculpe, ocorreu um erro ao processar sua solicitação.";
        let errorDetails = {};

        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Response headers:", error.response.headers);
            errorDetails = {
                status: error.response.status,
                data: sanitizeContent(JSON.stringify(error.response.data))
            };
        } else if (error.request) {
            console.error("Request:", error.request);
            errorMessage = "Não foi possível obter resposta do servidor.";
        } else {
            console.error("Error message:", error.message);
            errorMessage = sanitizeContent(error.message);
        }

        return {
            success: false,
            message: errorMessage,
            error: errorDetails
        };
    }
});

function sanitizeContent(content) {
    if (typeof content !== 'string') {
        return JSON.stringify(content);
    }

    // Remover caracteres de controle, exceto nova linha e tabulação
    content = content.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

    // Preservar caracteres acentuados e "ç" enquanto converte outros caracteres Unicode especiais
    content = content.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
        if (i.charCodeAt(0) > 127 && i.charCodeAt(0) < 256) {
            return i; // Preserva caracteres acentuados e "ç"
        }
        return '&#' + i.charCodeAt(0) + ';';
    });

    // Escapar caracteres especiais HTML
    content = content.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[m];
    });

    return content;
}
