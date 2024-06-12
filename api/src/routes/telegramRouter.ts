import express from "express";
import telegramController from "../controllers/telegramController";

const telegramRouter = express.Router();

// Маршрут для создания диалога
telegramRouter.post("/", telegramController.create);

// Маршрут для проверки существования пользователя
telegramRouter.get(
  "/user/is-exists/:id",
  telegramController.user_is_exists
);

telegramRouter.post('/create-user', telegramController.register_telegram_user)
telegramRouter.post(
  "/select-language-for-vocabular",
  telegramController.select_language_for_vocabular
);
telegramRouter.post(
  "/new-word-translate-request",
  telegramController.new_word_translate_request
);

export default telegramRouter;
