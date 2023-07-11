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
const IUser_1 = require("../../../models/IUser");
const format_money_1 = __importDefault(require("../../utlis/format_money"));
function greeting(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.from) {
                let user = yield IUser_1.User.findOne({ id: ctx.from.id });
                if (user) {
                    const extra = {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'О проекте',
                                        callback_data: 'about'
                                    }
                                ], [
                                    {
                                        text: 'Поддержка проекта',
                                        callback_data: 'help'
                                    }
                                ],
                                [
                                    {
                                        text: 'Персональные данные',
                                        callback_data: 'common_settings'
                                    }
                                ],
                                [
                                    {
                                        text: 'Справочные материалы',
                                        callback_data: 'reference_materials'
                                    }
                                ],
                                [
                                    {
                                        text: 'Назад',
                                        callback_data: 'home'
                                    },
                                    {
                                        text: 'Обратная связь',
                                        url: 'https://t.me/bur_live'
                                    }
                                ],
                            ]
                        }
                    };
                    let words = [];
                    let message = `<b>Личный кабинет</b> \n\n`;
                    message += `Общий рейтинг: ${user.rating} \n`;
                    // message += `Добавлено слов: 0 \n`
                    // message += `Слов на модерации: ${words.length} \n`
                    message += `Предложено предложений для перевода: ${user.proposedProposals.length}\n`;
                    message += `Количество переведенных предложений: 0 \n`;
                    message += `Количество голосов за перевод: ${user.voted_translations.length}`;
                    message += `\n\n<b>Внесено в проект ${(0, format_money_1.default)(user.supported)} ₽</b>`;
                    ctx.updateType === 'message' ? yield ctx.reply(message, extra) : false;
                    ctx.updateType === 'callback_query' ? yield ctx.editMessageText(message, extra) : false;
                }
                else {
                    console.log('123');
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.default = greeting;
//# sourceMappingURL=greeting.js.map