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
exports.bot = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const telegraf_1 = require("telegraf");
dotenv_1.default.config();
exports.bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
require("./app");
require("./webhook");
require("./database");
const home_scene_1 = __importDefault(require("./bot/views/home.scene"));
const sentences_scene_1 = __importDefault(require("./bot/views/sentences.scene"));
const settings_scene_1 = __importDefault(require("./bot/views/settings.scene"));
const dashboard_scene_1 = __importDefault(require("./bot/views/dashboard.scene"));
const vocabular_scene_1 = __importDefault(require("./bot/views/vocabular.scene"));
const moderation_scene_1 = __importDefault(require("./bot/views/moderation.scene"));
const chat_scene_1 = __importDefault(require("./bot/views/chat.scene"));
const ISentence_1 = require("./models/ISentence");
const stage = new telegraf_1.Scenes.Stage([home_scene_1.default, chat_scene_1.default, vocabular_scene_1.default, sentences_scene_1.default, dashboard_scene_1.default, moderation_scene_1.default, settings_scene_1.default], { default: 'home' });
// (async () => {
//     const extra: ExtraEditMessageText = {
//         parse_mode: 'HTML',
//         reply_markup: {
//             inline_keyboard: [
//                 [
//                     { text: "Самоучитель", callback_data: "study" },
//                     { text: "Словарь", callback_data: "vocabular" }
//                 ],
//                 [{ text: 'Предложения', callback_data: 'sentences' }],
//                 [{ text: 'Переводчик', callback_data: 'translater' }],
//                 [{ text: 'Модерация', callback_data: 'moderation' }],
//                 [{ text: "🔐 Chat GPT", callback_data: "chatgpt" }],
//                 [{ text: "Личный кабинет", callback_data: "dashboard" }]
//             ]
//         }
//     }
//     let message = `Самоучитель бурятского языка \n\nКаждое взаимодействие с ботом, \nвлияет на сохранение и дальнейшее развитие <b>Бурятского языка</b>`
//     message += '\n\nВыберите раздел, чтобы приступить'
//     try {
//         let users = await User.find()
//         users.forEach(async (element) => {
//             if (element.id) {
//                 try {
//                     await bot.telegram.sendMessage(`${element.id}`, message, extra)
//                 } catch (err) {
//                     console.log(err)
//                 }
//             }
//         });
//         // ctx.updateType === 'message' ? await ctx.reply(message, extra) : false
//         // ctx.updateType === 'callback_query' ? await ctx.editMessageText(message, extra) : ctx.reply(message, extra)
//         // bot.telegram.sendMessage(1272270574, message, extra)
//     } catch (err) {
//         console.log(err)
//     }
// })();
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        exports.bot.telegram.sendMessage(1272270574, 'бот запущен!');
    }
    catch (err) {
        console.error(err);
    }
}))();
home_scene_1.default.command('chat', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('chatgpt'); }));
chat_scene_1.default.command('chat', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('chatgpt'); }));
vocabular_scene_1.default.command('chat', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('chatgpt'); }));
sentences_scene_1.default.command('chat', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('chatgpt'); }));
dashboard_scene_1.default.command('chat', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('chatgpt'); }));
moderation_scene_1.default.command('chat', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('chatgpt'); }));
settings_scene_1.default.command('chat', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('chatgpt'); }));
home_scene_1.default.command('home', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('home'); }));
chat_scene_1.default.command('home', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('home'); }));
vocabular_scene_1.default.command('home', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('home'); }));
sentences_scene_1.default.command('home', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('home'); }));
dashboard_scene_1.default.command('home', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('home'); }));
moderation_scene_1.default.command('home', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('home'); }));
settings_scene_1.default.command('home', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('home'); }));
exports.bot.use((0, telegraf_1.session)());
exports.bot.use(stage.middleware());
exports.bot.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.scene.enter('home');
    // ctx.deleteMessage(874)
}));
exports.bot.command('update_translates_collection', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let translates = yield ISentence_1.Translation.find();
    translates.forEach((element) => __awaiter(void 0, void 0, void 0, function* () {
        let votes = element.votes;
        let rating = 0;
        if (votes) {
            let pluses = 0;
            let minuses = 0;
            for (let i = 0; i < votes.length; i++) {
                let voteDocument = yield ISentence_1.voteModel.findById(votes[i]);
                if (voteDocument) {
                    if (voteDocument.vote === true) {
                        pluses++;
                    }
                    else {
                        minuses++;
                    }
                }
            }
            rating = pluses - minuses;
        }
        yield ISentence_1.Translation.findByIdAndUpdate(element._id, {
            $set: {
                rating: rating
            }
        });
    }));
}));
exports.bot.command('chat', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('chatgpt'); }));
exports.bot.command('home', (ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('home'); }));
//# sourceMappingURL=index.js.map