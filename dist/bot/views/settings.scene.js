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
const greeting_1 = __importDefault(require("./settingsView/greeting"));
const date_of_birth_1 = __importStar(require("./settingsView/date_of_birth"));
const handler = new telegraf_1.Composer();
const settings = new telegraf_1.Scenes.WizardScene("settings", handler, (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, date_of_birth_1.default)(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, date_of_birth_1.date_birth_get_years_handler)(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield select_year(ctx); }));
function select_year(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                ctx.answerCbQuery(ctx.update.callback_query.data);
                if (ctx.update.callback_query.data === 'back') {
                    yield (0, date_of_birth_1.date_birth_get_years)(ctx);
                    ctx.wizard.selectStep(2);
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
settings.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, greeting_1.default)(ctx); }));
handler.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, greeting_1.default)(ctx); }));
handler.action("back", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.answerCbQuery();
    return ctx.scene.enter("dashboard");
}));
settings.action("choose_ln", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.answerCbQuery();
}));
settings.action("choose_gender", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.answerCbQuery();
}));
settings.action("date_birth", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, date_of_birth_1.date_birth)(ctx); }));
exports.default = settings;
//# sourceMappingURL=settings.scene.js.map