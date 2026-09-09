export type ChatLanguage = 'en' | 'hi';

interface SendChatMessageParams {
  message: string;
  conversationId?: string;
  language: ChatLanguage;
  image?: string;
}

interface ChatResponse {
  success: boolean;
  reply: string;
  conversationId: string;
  message?: string;
}

const API_BASE_URL = 'http://10.0.2.2:5000';

export const sendChatMessage = async ({
  message,
  conversationId,
  language,
  image
}: SendChatMessageParams): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        conversationId,
        language,
        image
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || 'Failed to get a response from AI Sahayak.'
      );
    }

    return {
      success: Boolean(data.success),
      reply: data.reply || 'Sorry, I could not generate a response.',
      conversationId: data.conversationId || conversationId || '',
      message: data.message
    };
  } catch (error) {
    console.error('Chat service error:', error);

    return {
      success: false,
      reply:
        error instanceof Error
          ? error.message
          : 'Unable to connect to AI Sahayak.',
      conversationId: conversationId || ''
    };
  }
};

