// src/routes/vocabularyRouter.ts
import express from "express";
import { body, query } from "express-validator";
import vocabularyController from "../controllers/vocabularyController";
import authenticateToken from "../middleware/authenticateToken";
import authorizeAdmin from "../middleware/authorizeAdmin";
import validate from "../middleware/validate";
import attachSuggestedWord from "../middleware/attachSuggestedWord";

const vocabularyRouter = express.Router();

/**
 * @route   GET /backendapi/vocabulary
 * @desc    Получение всех слов
 * @access  Public
 */
vocabularyRouter.get("/", vocabularyController.getAllWords);

/**
 * @route   GET /backendapi/vocabulary/paginated
 * @desc    Получение всех слов с пагинацией и сортировкой
 * @access  Public
 */
vocabularyRouter.get(
    "/paginated",
    [
        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("page должен быть целым числом больше 0"),
        query("limit")
            .optional()
            .isInt({ min: 1 })
            .withMessage("limit должен быть целым числом больше 0"),
    ],
    validate,
    vocabularyController.getAllWordsPaginated
);

/**
 * @route   GET /backendapi/vocabulary/approval
 * @desc    Получение предложенных слов на утверждение с пагинацией
 * @access  Public
 */
vocabularyRouter.get(
    "/approval",
    [
        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("page должен быть целым числом больше 0"),
        query("limit")
            .optional()
            .isInt({ min: 1 })
            .withMessage("limit должен быть целым числом больше 0"),
    ],
    validate,
    vocabularyController.getWordsOnApproval
);

/**
 * @route   POST /backendapi/vocabulary/suggest-translate
 * @desc    Предложение перевода слова
 * @access  Private
 */
vocabularyRouter.post(
    "/suggest-translate",
    authenticateToken,
    [
        body("word_id")
            .isMongoId()
            .withMessage("word_id должен быть валидным ObjectId"),
        body("translate_language")
            .isString()
            .withMessage("translate_language должен быть строкой"),
        body("translate")
            .isString()
            .withMessage("translate должен быть строкой"),
        body("dialect")
            .optional()
            .isString()
            .withMessage("dialect должен быть строкой"),
        body("normalized_text")
            .isString()
            .withMessage("normalized_text должен быть строкой"),
        body("telegram_user_id")
            .isMongoId()
            .withMessage("telegram_user_id должен быть валидным ObjectId"),
    ],
    validate,
    vocabularyController.suggestWordTranslate
);

/**
 * @route   POST /backendapi/vocabulary/suggest-words
 * @desc    Предложение нескольких слов
 * @access  Private
 */
vocabularyRouter.post(
    "/suggest-words",
    authenticateToken,
    attachSuggestedWord, // Middleware для прикрепления suggestedWord и telegram_user_id
    [
        body("text")
            .isString()
            .withMessage("text должен быть строкой")
            .notEmpty()
            .withMessage("text не может быть пустым"),
        body("language")
            .isString()
            .withMessage("language должен быть строкой")
            .notEmpty()
            .withMessage("language не может быть пустым"),
        body("id")
            .isString()
            .withMessage("id должен быть строкой")
            .notEmpty()
            .withMessage("id не может быть пустым"),
        body("dialect")
            .optional()
            .isString()
            .withMessage("dialect должен быть строкой"),
    ],
    validate,
    vocabularyController.suggestWords
);

/**
 * @route   POST /backendapi/vocabulary/accept-suggested-word
 * @desc    Принятие предложенного слова
 * @access  Private/Admin
 */
vocabularyRouter.post(
    "/accept-suggested-word",
    authenticateToken,
    authorizeAdmin,
    [
        body("suggestedWordId")
            .isMongoId()
            .withMessage("suggestedWordId должен быть валидным ObjectId"),
        body("telegram_user_id")
            .isMongoId()
            .withMessage("telegram_user_id должен быть валидным ObjectId"),
    ],
    validate,
    attachSuggestedWord, // Middleware для прикрепления suggestedWord и telegram_user_id
    vocabularyController.acceptSuggestedWord
);

/**
 * @route   POST /backendapi/vocabulary/decline-suggested-word
 * @desc    Отклонение предложенного слова
 * @access  Private/Admin
 */
vocabularyRouter.post(
    "/decline-suggested-word",
    authenticateToken,
    authorizeAdmin,
    [
        body("suggestedWordId")
            .isMongoId()
            .withMessage("suggestedWordId должен быть валидным ObjectId"),
    ],
    validate,
    attachSuggestedWord, // Middleware для прикрепления suggestedWord
    vocabularyController.declineSuggestedWord
);

/**
 * @route   GET /backendapi/vocabulary/confirmed-word
 * @desc    Получение одного подтверждённого слова или случайного
 * @access  Public
 */
vocabularyRouter.get(
    "/confirmed-word",
    [
        query("wordId")
            .optional()
            .isMongoId()
            .withMessage("wordId должен быть валидным ObjectId"),
    ],
    validate,
    vocabularyController.getConfirmedWord
);

export default vocabularyRouter;
