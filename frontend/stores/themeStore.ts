import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';
interface User {
  id: string;
  email?: string;
  c_username?: string;
  first_name?: string;
  rating?: number;
  createdAt?: string;
}

interface UserExistsResponse {
  is_exists: boolean;
  user?: User;
}

interface CreateUserResponse {
  message: string;
}

// Ваш заранее сгенерированный токен
const JWT_TOKEN = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmZiZGYyN2E2NjhjYmZhNzFlNzdjY2QiLCJzZXNzaW9uSWQiOiJhMWU3YWIyNS04OGJkLTRhYTQtOGE4MS1mYThiMWI4MTc2NWQiLCJpYXQiOjE3Mjk1Mzg5MjEsImV4cCI6MTcyOTc5ODEyMX0.BFNaCtVsQGCHpS8hFPDPBOMv7fW79bjbqssmDmUfeiY`;

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<'light' | 'dark'>('light'); // Оборачиваем в ref для реактивности
  const user = ref<User | null>(null);

  // Инициализация пользователя через Telegram API
  const initializeUser = async () => {
    const tg = (window as any).Telegram.WebApp;
    const tgUser = tg.initDataUnsafe?.user;

    if (tgUser) {
      console.log(tgUser)
      const userExists = await checkUserExists(tgUser.id);
      if (!userExists) {
        await createUser({
          id: tgUser.id,
          username: tgUser.username || '',
          first_name: tgUser.first_name || '',
          email: tgUser.email || '',
        });
      }
    }
  };

  // Проверка существования пользователя
  const checkUserExists = async (telegramId: number): Promise<boolean> => {
    try {
      const response = await $fetch<UserExistsResponse>(
        `http://localhost:5000/backendapi/telegram/user/is-exists/${telegramId}`,
        {
          headers: {
            Authorization: JWT_TOKEN, // Передача токена в заголовке
            method: 'GET'
          },
        }
      );
      console.log(response)
      if (response.is_exists && response.user) {
        user.value = response.user;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка при проверке существования пользователя:', error);
      return false;
    }
  };
  const loadTheme = async () => {
    try {
      const response = await fetch('/api/theme');
      const data = await response.json();
      theme.value = data.theme || 'light';
    } catch (error) {
      console.error('Ошибка загрузки темы:', error);
    }
  };

  const saveTheme = async (newTheme: 'light' | 'dark') => {
    try {
      await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      });
      theme.value = newTheme; // Обновляем значение темы
    } catch (error) {
      console.error('Ошибка сохранения темы:', error);
    }
  };

  // Создание пользователя на сервере
  const createUser = async (telegramUser: { id: number; username: string; first_name: string; email: string }) => {
    try {
      const response = await $fetch<CreateUserResponse>(
        `http://localhost:5000/backendapi/telegram/create-user`,
        {
          method: 'POST',
          body: telegramUser,
          headers: {
            Authorization: JWT_TOKEN, // Передача токена в заголовке
          },
        }
      );
      console.log(response.message); // Успешная регистрация
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
    }
  };
  onMounted(loadTheme); // Загружаем тему при старте

  return { theme, saveTheme, initializeUser };
});
