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
exports.secretPath = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const IUser_1 = require("./models/IUser");
const IPayment_1 = require("./models/IPayment");
const mongodb_1 = require("mongodb");
const index_1 = require("./index");
const cors_1 = __importDefault(require("cors"));
const morgan = require("morgan");
const PORT = process.env.PORT;
const app = (0, express_1.default)();
exports.secretPath = `/telegraf/secret_path`;
app.use(body_parser_1.default.json());
app.post(`/telegraf/secret_path`, (req, res) => {
    index_1.bot.handleUpdate(req.body, res);
});
app.get("/", (req, res) => res.send("Бот запущен!"));
app.get('/success', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract the billId from the request URL
        let billId = res.req.url.replace('/success?billId=', '');
        console.log(billId);
        if (billId && (billId.indexOf('billId') == -1)) {
            // Find the payment document using the billId
            let payment = yield IPayment_1.Payment.findOne({
                _id: new mongodb_1.ObjectId(billId)
            });
            if (payment) {
                // Find the user document using the payment's user_id
                let user = yield IUser_1.User.findOne({
                    id: payment === null || payment === void 0 ? void 0 : payment.user_id
                });
                if (user && payment) {
                    // Send a sticker and a message to the user using the Telegram bot
                    yield index_1.bot.telegram.sendSticker(user === null || user === void 0 ? void 0 : user.id, 'CAACAgIAAxkBAAEIRdBkHZukHX1iJJVPMeQmZvfKXRgfDQACiRkAAkHrwEvwxgiNPD3Rai8E');
                    yield index_1.bot.telegram.sendMessage(user === null || user === void 0 ? void 0 : user.id, 'Спасибо за внесенный платеж!', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Назад',
                                        callback_data: 'back'
                                    }
                                ]
                            ]
                        }
                    });
                    // Update the user's 'supported' field by adding the payment amount
                    yield IUser_1.User.findOneAndUpdate({
                        id: user.id
                    }, {
                        $set: {
                            supported: user.supported + payment.amount
                        }
                    });
                }
            }
        }
        // Redirect the user to 'https://t.me/burlive_bot'
    }
    catch (err) {
        console.error(err);
    }
    res.redirect('https://t.me/burlang_bot');
}));
app.use(morgan("dev"));
app.use((0, cors_1.default)());
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
    const { default: fetch } = yield Promise.resolve().then(() => __importStar(require('node-fetch')));
    const res = yield fetch('http://localhost:4040/api/tunnels');
    const json = yield res.json();
    console.log(json);
    //@ts-ignore
    const secureTunnel = json.tunnels[0].public_url;
    console.log(secureTunnel);
    yield index_1.bot.telegram.setWebhook(`${secureTunnel}${exports.secretPath}`)
        .then(res => {
        console.log(res);
    });
});
function set_webhook() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`${(_a = process.env.mode) === null || _a === void 0 ? void 0 : _a.replace(/"/g, '')}`);
        if (`${(_b = process.env.mode) === null || _b === void 0 ? void 0 : _b.replace(/"/g, '')}` === "production") {
            console.log(`${(_c = process.env.mode) === null || _c === void 0 ? void 0 : _c.replace(/"/g, '')}`);
            console.log(`secret path: ${exports.secretPath}`);
            yield index_1.bot.telegram.setWebhook(`https://profori.pro/telegraf/secret_path`)
                .then((status) => {
                console.log(exports.secretPath);
                console.log(status);
            }).catch(err => {
                console.log(err);
            });
        }
        else {
            yield fetchData().catch((error) => {
                console.error('Error setting webhook:', error);
            });
        }
    });
}
;
set_webhook();
//# sourceMappingURL=app.js.map