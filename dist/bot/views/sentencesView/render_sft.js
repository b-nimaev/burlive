"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.add_translate_to_sentences_hander = void 0;
const ISentence_1 = require("../../../models/ISentence");
const IUser_1 = require("../../../models/IUser");
const getTranslations_1 = __importDefault(require("./getTranslations"));
const renderSentences_1 = require("./renderSentences");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const timezone = 'Asia/Shanghai'; // ваш часовой пояс
const now = (0, moment_timezone_1.default)().tz(timezone);
const fs_1 = __importDefault(require("fs"));
const mongodb_1 = require("mongodb");
const translateSentences_1 = __importDefault(require("./translateSentences"));
function render_sft(ctx) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = ``;
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: []
                }
            };
            // получение предложения которое нужно перевести
            // @ts-ignore
            let sentence = yield ISentence_1.Sentence.aggregate([
                { $match: { skipped_by: { $ne: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id }, accepted: 'accepted' } },
                { $sort: { active_translator: 1 } },
                { $project: { text: 1, author: 1, accepted: 1, translations: 1, translations_length: { $size: "$translations" } } },
                { $sort: { translations_length: 1, active_translator: 1 } },
                { $limit: 1 }
            ]).then((doc) => __awaiter(this, void 0, void 0, function* () {
                return doc[0];
            }));
            console.log(sentence);
            // если он найден
            if (sentence) {
                yield (0, renderSentences_1.render_sentencse_for_translate)(ctx, sentence).then((response) => {
                    message += response;
                });
                // Вернули объект, либо false
                let translations = yield (0, getTranslations_1.default)(ctx, sentence);
                // Если объект существует
                if (translations) {
                    if (translations.author_translation.length > 0) {
                        // Если у пользвателя ест переводы, добавим кнопку продолжить
                        (_b = extra.reply_markup) === null || _b === void 0 ? void 0 : _b.inline_keyboard.push([{ text: 'Дальше', callback_data: 'continue' }]);
                    }
                    else {
                        // Если и пользователя нет переводов, добавим кнопку пропустить
                        (_c = extra.reply_markup) === null || _c === void 0 ? void 0 : _c.inline_keyboard.push([{ text: 'Пропустить', callback_data: 'skip' }]);
                    }
                    yield IUser_1.User.findOne({ id: (_d = ctx.from) === null || _d === void 0 ? void 0 : _d.id }).then((user) => __awaiter(this, void 0, void 0, function* () {
                        // Создаем документ активного переводчика
                        yield new ISentence_1.ActiveTranslator({ user_id: user === null || user === void 0 ? void 0 : user._id }).save().then((document) => __awaiter(this, void 0, void 0, function* () {
                            // далее идентификатор созданного активного переводчика
                            // добавляем в массив active_translator в документе текущего Sentence
                            yield ISentence_1.Sentence.findOneAndUpdate({ _id: sentence._id }, { $push: { active_translator: document.id.toString() } }).then(() => __awaiter(this, void 0, void 0, function* () {
                                // айди созданного активного переводчика сохраняем в контекст бота
                                ctx.scene.session.active_translation = document.id.toString();
                                // устанавливаем таймер в 1 минуту
                                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                    // удаляем идентификатор активного переводчика из Sentence
                                    yield ISentence_1.Sentence.findOneAndUpdate({ _id: sentence._id }, { $pull: { active_translator: document.id.toString() } }).then(() => __awaiter(this, void 0, void 0, function* () {
                                        // Запишем это в лог
                                        const message = `Активный переводчик ${document.id} удален из предложения ${sentence._id} at ${now.toISOString()}\n`;
                                        fs_1.default.appendFile('log.txt', message, (err) => {
                                            if (err)
                                                throw err;
                                        });
                                        yield ISentence_1.ActiveTranslator.findOneAndDelete({
                                            _id: new mongodb_1.ObjectId(document.id)
                                        }).then(() => __awaiter(this, void 0, void 0, function* () {
                                            const message = `Документ активного переводчика ${document.id} удален`;
                                            fs_1.default.appendFile('log.txt', message, (err) => {
                                                if (err)
                                                    throw err;
                                            });
                                        }));
                                    })).catch(err => {
                                        // Типа обработки ошибки
                                        console.log(err);
                                    });
                                }), 60 * 1000);
                            }));
                        }));
                    }));
                }
            }
            else {
                // если предложений нет
                message += `Предложений не найдено`;
                (_e = extra.reply_markup) === null || _e === void 0 ? void 0 : _e.inline_keyboard.push([{ text: 'Добавить предложения', callback_data: 'add_sentence' }]);
            }
            (_f = extra.reply_markup) === null || _f === void 0 ? void 0 : _f.inline_keyboard.push([{ text: 'Назад', callback_data: 'back' }]);
            if (ctx.updateType === 'callback_query') {
                ctx.answerCbQuery();
                return yield ctx.editMessageText(message, extra).then(() => {
                    ctx.scene.session.active_translation;
                });
            }
            else {
                return yield ctx.reply(message, extra).then(() => {
                    ctx.scene.session.active_translation;
                });
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = render_sft;
// добавление перевода предложения
function add_translate_to_sentences_hander(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ctx.from) {
            try {
                if (ctx.updateType === 'callback_query') {
                    // @ts-ignore
                    if (ctx.callbackQuery.data) {
                        // @ts-ignore
                        let data = ctx.callbackQuery.data;
                        if (data === 'back') {
                            yield ISentence_1.Sentence.findOneAndUpdate({
                                _id: new mongodb_1.ObjectId(ctx.session.__scenes.sentence_id)
                            }, {
                                $pull: {
                                    active_translator: ctx.scene.session.active_translation
                                }
                            }).then((doc) => __awaiter(this, void 0, void 0, function* () {
                                var _a;
                                if (doc) {
                                    const message_log = `User ${(_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id} removed active translator by back ${ctx.scene.session.active_translation} from sentence ${doc._id} at ${(0, moment_timezone_1.default)().tz(timezone).toISOString()}\n`;
                                    fs_1.default.appendFile('log.txt', message_log, (err) => {
                                        if (err)
                                            throw err;
                                    });
                                }
                            }));
                            yield (0, translateSentences_1.default)(ctx);
                        }
                        if (data === 'skip' || data === 'continue') {
                            yield ISentence_1.Sentence.findOneAndUpdate({
                                _id: new mongodb_1.ObjectId(ctx.session.__scenes.sentence_id)
                            }, {
                                $push: {
                                    skipped_by: ctx.from.id
                                },
                                $pull: {
                                    active_translator: ctx.scene.session.active_translation
                                }
                            }).then((doc) => __awaiter(this, void 0, void 0, function* () {
                                var _b;
                                if (doc) {
                                    const message_log = `User ${(_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id} removed active translator ${ctx.scene.session.active_translation} from sentence ${doc._id} at ${(0, moment_timezone_1.default)().tz(timezone).toISOString()}\n`;
                                    fs_1.default.appendFile('log.txt', message_log, (err) => {
                                        if (err)
                                            throw err;
                                    });
                                    yield ISentence_1.ActiveTranslator.findOneAndDelete({
                                        _id: new mongodb_1.ObjectId(ctx.scene.session.active_translation)
                                    }).then(() => __awaiter(this, void 0, void 0, function* () {
                                        var _c;
                                        const message_log = `Документ активного переводчика ${(_c = ctx.from) === null || _c === void 0 ? void 0 : _c.id} удален из предложения ${ctx.session.__scenes.sentence_id} ${now.toISOString()}\n`;
                                        fs_1.default.appendFile('log.txt', message_log, (err) => {
                                            if (err)
                                                throw err;
                                        });
                                    }));
                                    yield render_sft(ctx);
                                }
                            }));
                            ctx.answerCbQuery();
                        }
                    }
                }
                if (ctx.updateType === 'message') {
                    // @ts-ignore
                    if (ctx.message.text) {
                        // @ts-ignore
                        let text = ctx.message.text;
                        let user_id = ctx.from.id;
                        let translation = {
                            sentence_russian: ctx.scene.session.sentence_id,
                            translate_text: text,
                            author: user_id,
                            rating: 0
                        };
                        console.log(ctx.scene.session.active_translation);
                        new ISentence_1.Translation(translation).save().then((document) => __awaiter(this, void 0, void 0, function* () {
                            yield ISentence_1.Sentence.findOneAndUpdate({
                                _id: new mongodb_1.ObjectId(ctx.scene.session.sentence_id)
                            }, {
                                $push: {
                                    translations: document._id.toString()
                                },
                                $pull: {
                                    active_translator: ctx.scene.session.active_translation
                                }
                            }).then(() => __awaiter(this, void 0, void 0, function* () {
                                const message_log = `User ${user_id} removed active translator ${document.id} from sentence ${ctx.scene.session.active_translation} at ${(0, moment_timezone_1.default)().tz(timezone).toISOString()}\n`;
                                fs_1.default.appendFile('log.txt', message_log, (err) => {
                                    if (err)
                                        throw err;
                                });
                            }));
                            yield render_sft(ctx);
                        }));
                    }
                    else {
                        yield ctx.reply("Нужно отправить в текстовом виде");
                        yield render_sft(ctx);
                    }
                }
            }
            catch (err) {
                console.log(err);
            }
        }
    });
}
exports.add_translate_to_sentences_hander = add_translate_to_sentences_hander;
//# sourceMappingURL=render_sft.js.map