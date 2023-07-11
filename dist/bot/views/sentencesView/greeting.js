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
const ISentence_1 = require("../../../models/ISentence");
const format_money_1 = __importDefault(require("../../utlis/format_money"));
// при входе
function greeting(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Добавить предложения',
                                callback_data: 'add_sentence'
                            }
                        ], [
                            {
                                text: 'Добавить перевод',
                                callback_data: 'translate_sentences'
                            }
                        ], [
                            {
                                text: 'Статистика',
                                callback_data: 'my_sentences'
                            }
                        ],
                        [
                            {
                                text: 'Назад',
                                callback_data: 'home'
                            }
                        ],
                    ]
                }
            };
            let sentences = yield ISentence_1.Translation.find();
            let confirmed = yield ISentence_1.ConfirmedTranslations.find();
            let left = 100000 - confirmed.length;
            let message = `<b>Перевод предложений 🚀</b> \n\n`;
            message += `Наша цель собрать 100 000 корректных переводов предложений из разных сфер жизни, для создания машинного-бурятского языка\n\n`;
            // message += `А Чтобы переводить предложения, нужны сами предложения на <b>русском языке</b>.` 
            message += `До конца цели осталось <b>${(0, format_money_1.default)(left)} переводов</b>`;
            ctx.updateType === 'message' ? yield ctx.reply(message, extra) : false;
            ctx.updateType === 'callback_query' ? yield ctx.editMessageText(message, extra) : false;
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.default = greeting;
//# sourceMappingURL=greeting.js.map