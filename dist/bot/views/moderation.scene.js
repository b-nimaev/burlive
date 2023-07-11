"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const telegraf_1 = require("telegraf");
const ISentence_1 = require("../../models/ISentence");
const IUser_1 = require("../../models/IUser");
const greeting_1 = __importDefault(require("./moderationView/greeting"));
// handlers and renders 
const moderationTranslates_1 = __importStar(require("./moderationView/moderationTranslates"));
const moderationSentencesHandler_1 = require("./moderationView/moderationSentencesHandler");
const mongodb_1 = require("mongodb");
const IReport_1 = require("../../models/IReport");
const handler = new telegraf_1.Composer();
const moderation = new telegraf_1.Scenes.WizardScene("moderation", handler, (ctx) => __awaiter(void 0, void 0, void 0, function* () { return moderation_sentences_handler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return moderation_translates_handler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return moderation_report_handler(ctx); }));
function moderation_report_handler(ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query' || ctx.updateType === 'message') {
                if (ctx.updateType === 'callback_query') {
                    if (ctx.update.callback_query.data === 'continue' || ctx.update.callback_query.data === 'back') {
                        yield (0, moderationTranslates_1.render_vote_sentence)(ctx);
                    }
                }
                if (ctx.updateType === 'message') {
                    // отправка жалобы в канал
                    let senderReport = yield ctx.telegram.forwardMessage('-1001952917634', ctx.update.message.chat.id, ctx.message.message_id);
                    let user = yield IUser_1.User.findOne({
                        id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id
                    });
                    if (user) {
                        let report = {
                            // @ts-ignore
                            user_id: user._id,
                            translation_id: ctx.scene.session.current_translation_for_vote,
                            message_id: senderReport.message_id
                        };
                        yield new IReport_1.ReportModel(report).save().then((report) => __awaiter(this, void 0, void 0, function* () {
                            var _b;
                            yield IUser_1.User.findOneAndUpdate({
                                id: (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id
                            }, {
                                $push: {
                                    reports: report._id
                                }
                            });
                        }));
                    }
                    let message = `<b>Спасибо!</b> \nВаше сообщение принято на рассмотрение.`;
                    yield ctx.reply(message, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Вернуться к модерации', callback_data: 'continue' }]
                            ]
                        }
                    });
                }
            }
            else {
                yield report_section_render(ctx);
            }
            ctx.answerCbQuery();
        }
        catch (err) {
            console.error(err);
        }
    });
}
moderation.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, greeting_1.default)(ctx); }));
moderation.action("moderation_sentences", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, moderationSentencesHandler_1.moderation_sentences)(ctx); }));
function moderation_sentences_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let update = ctx.updateType;
            if (update === 'callback_query') {
                let data = ctx.update.callback_query.data;
                if (data === 'back') {
                    ctx.wizard.selectStep(0);
                    yield (0, greeting_1.default)(ctx);
                }
                if (data === 'good') {
                    yield (0, moderationSentencesHandler_1.updateSentence)(ctx, 'accepted');
                }
                if (data === 'bad') {
                    yield (0, moderationSentencesHandler_1.updateSentence)(ctx, 'declined');
                }
                ctx.answerCbQuery();
            }
            else {
                yield (0, moderationSentencesHandler_1.moderation_sentences)(ctx);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
moderation.action("moderation_translates", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, moderationTranslates_1.default)(ctx); }));
function updateRating(translation) {
    return __awaiter(this, void 0, void 0, function* () {
        let votes = translation.votes;
        let rating = 0;
        if (votes) {
            let pluses = 0;
            let minuses = 0;
            for (let i = 0; i < votes.length; i++) {
                let voteDocument = yield ISentence_1.voteModel.findById(votes[i]);
                if (voteDocument) {
                    if (voteDocument.vote === true) {
                        pluses = pluses + 1;
                    }
                    else {
                        minuses = minuses + 1;
                    }
                }
            }
            console.log(`pluses: ${pluses}`);
            console.log(`minuses: ${minuses}`);
            rating = pluses - minuses;
            // console.log(rating)
            return rating;
        }
        // console.log(rating)
    });
}
function ratingHandler(translation) {
    return __awaiter(this, void 0, void 0, function* () {
        if (translation) {
            let rating = yield updateRating(translation);
            if (rating) {
                // @ts-ignore
                yield ISentence_1.Translation.findByIdAndUpdate(translation._id, {
                    $set: {
                        rating: rating
                    }
                }).then((newtranslation) => __awaiter(this, void 0, void 0, function* () {
                    // @ts-ignore
                    if (rating >= 3) {
                        yield new ISentence_1.ConfirmedTranslations(newtranslation === null || newtranslation === void 0 ? void 0 : newtranslation.toObject()).save();
                        yield ISentence_1.Translation.findByIdAndDelete(newtranslation === null || newtranslation === void 0 ? void 0 : newtranslation._id);
                    }
                }));
            }
        }
    });
}
// обрабатываем голос
function moderation_translates_handler(ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (ctx.updateType === 'callback_query') {
            // сохраняем коллбэк
            let data = ctx.update.callback_query.data;
            let translate_id = ctx.scene.session.current_translation_for_vote;
            let user = yield IUser_1.User.findOne({ id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id });
            if (user) {
                if (data === 'good') {
                    // Сохраняем голос +
                    yield new ISentence_1.voteModel({ user_id: user === null || user === void 0 ? void 0 : user._id, translation_id: translate_id, vote: true }).save().then((data) => __awaiter(this, void 0, void 0, function* () {
                        // Возвращаем _id сохранненого голоса
                        let vote_id = data._id;
                        // пушим в массив голосов докумена перевода
                        yield ISentence_1.Translation.findOneAndUpdate({ _id: translate_id }, { $push: { votes: vote_id } })
                            .then((translation) => __awaiter(this, void 0, void 0, function* () { return yield ratingHandler(translation); }));
                        yield IUser_1.User.findOneAndUpdate({ _id: user === null || user === void 0 ? void 0 : user._id }, { $addToSet: { voted_translations: translate_id } });
                    }));
                    yield (0, moderationTranslates_1.render_vote_sentence)(ctx);
                }
                else if (data === 'bad') {
                    // сохраняем голос -
                    yield new ISentence_1.voteModel({ user_id: user === null || user === void 0 ? void 0 : user._id, translation_id: translate_id, vote: false }).save().then((data) => __awaiter(this, void 0, void 0, function* () {
                        // вернули айдишку
                        let vote_id = data._id;
                        yield IUser_1.User.findOneAndUpdate({ _id: user === null || user === void 0 ? void 0 : user._id }, { $addToSet: { voted_translations: translate_id } });
                        // сохранили айдишку в документе перевода
                        yield ISentence_1.Translation.findOneAndUpdate({ _id: translate_id }, { $push: { votes: vote_id } })
                            .then((translation) => __awaiter(this, void 0, void 0, function* () { return yield ratingHandler(translation); }));
                    }));
                    yield (0, moderationTranslates_1.render_vote_sentence)(ctx);
                }
                else if (data === 'skip') {
                    yield ISentence_1.Translation.findByIdAndUpdate(translate_id, {
                        $push: {
                            skipped_by: user._id
                        }
                    });
                }
            }
            else {
                ctx.wizard.selectStep(0);
                yield (0, greeting_1.default)(ctx);
            }
            // Если чел хочет вернутьтся на начальный экран модерации
            if (data === 'back') {
                ctx.wizard.selectStep(0);
                yield (0, greeting_1.default)(ctx);
            }
            ctx.answerCbQuery();
        }
        else {
            yield (0, moderationTranslates_1.render_vote_sentence)(ctx);
        }
    });
}
moderation.action("moderation_vocabular", (ctx) => __awaiter(void 0, void 0, void 0, function* () { ctx.answerCbQuery('Модерация словаря в разработке'); }));
moderation.action("report", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield report_section_render(ctx); }));
function report_section_render(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = '<b>Модерация / Голосование / Жалоба</b>\n\n';
            let translation = yield ISentence_1.Translation.findOne({
                // @ts-ignore
                _id: ctx.scene.session.current_translation_for_vote
            });
            if (translation) {
                let sentence_russian = yield ISentence_1.Sentence.findOne({
                    _id: new mongodb_1.ObjectId(translation === null || translation === void 0 ? void 0 : translation.sentence_russian)
                });
                if (sentence_russian) {
                    message += `Предложение\n\n`;
                    message += `<code>${sentence_russian.text}</code>\n\n`;
                }
                message += `Перевод\n\n`;
                message += `<code>${translation.translate_text}</code>`;
                message += `\n\n<b>Отправьте следующим сообщением, причину жалобы</b>`;
                let extra = {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Назад', callback_data: 'back' }]
                        ]
                    }
                };
                if (ctx.updateType === 'callback_query') {
                    yield ctx.editMessageText(message, extra).then(() => {
                        ctx.wizard.selectStep(3);
                    });
                }
                else {
                    yield ctx.reply(message, extra).then(() => {
                        ctx.wizard.selectStep(3);
                    });
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    });
}
handler.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, greeting_1.default)(ctx); }));
handler.action("back", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.answerCbQuery();
    return ctx.scene.enter("home");
}));
exports.default = moderation;
//# sourceMappingURL=moderation.scene.js.map