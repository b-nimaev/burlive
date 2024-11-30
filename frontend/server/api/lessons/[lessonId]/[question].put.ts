import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const apiBase = config.apiBase;
    const jwtToken = config.jwtToken;

    // Извлекаем параметры пути
    const { lessonId, question } = event.context.params as { lessonId: string; question: string };

    if (!lessonId || !question) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: lessonId and question are required',
        });
    }

    try {
        // Запрос к бэкенду
        const response = await $fetch(`${apiBase}/lessons/${lessonId}/${question}`, {
            method: 'PUT',
            headers: {
                Authorization: jwtToken,
            },
        });

        return response;
    } catch (error: any) {
        console.error('Ошибка при добавлении вопроса к уроку:', error);

        // Создаём и выбрасываем ошибку с помощью createError
        throw createError({
            statusCode: error.response?.status || 500,
            statusMessage: error.message || 'Internal Server Error',
        });
    }
});
