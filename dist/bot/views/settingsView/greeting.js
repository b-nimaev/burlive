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
Object.defineProperty(exports, "__esModule", { value: true });
function greeting(ctx) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[
                            {
                                text: 'Указать пол',
                                callback_data: 'choose_gender'
                            }
                        ],
                        [
                            {
                                text: 'Указать дату рождения',
                                callback_data: 'date_birth'
                            }
                        ],
                        [{
                                text: 'Выбрать язык интерфейса',
                                callback_data: 'choose_ln'
                            }
                        ],
                        [{
                                text: 'Назад',
                                callback_data: 'back'
                            }],
                    ]
                }
            };
            let message = '';
            if (ctx.from) {
                if ((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.first_name) {
                    message = `<b>Личный кабинет / Настройки</b> \n\nИмя пользователя: <b>${(_b = ctx.from) === null || _b === void 0 ? void 0 : _b.first_name}</b>`;
                }
                else {
                    message = `<b>Настройки</b> \n\nИмя пользователя: <b>${(_c = ctx.from) === null || _c === void 0 ? void 0 : _c.id}</b>`;
                }
            }
            message += `\nДата рождения: 07.08.2000`;
            message += `\nЯзык интерфейса: Русский`;
            message += `\n\nДата регистрации: 01.01.1990`;
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