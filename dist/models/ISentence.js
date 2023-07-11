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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmedTranslations = exports.ActiveTranslator = exports.Translation = exports.Sentence = exports.voteModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const voteSchema = new mongoose_1.default.Schema({
    user_id: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    translation_id: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    vote: { type: Boolean, required: true }
}, {
    timestamps: true
});
exports.voteModel = (0, mongoose_1.model)("votes", voteSchema);
const translationSchema = new mongoose_1.default.Schema({
    sentence_russian: { type: String, required: true },
    translate_text: { type: String, required: true },
    author: { type: Number, required: true },
    votes: { type: [mongoose_1.default.Schema.Types.ObjectId], required: false },
    rating: { type: Number, required: false },
    skipped_by: { type: [mongoose_1.default.Schema.Types.ObjectId], required: false }
}, {
    timestamps: true
});
const Translation = (0, mongoose_1.model)("Translation", translationSchema);
exports.Translation = Translation;
const ConfirmedTranslations = (0, mongoose_1.model)("Translatios_confirmed", translationSchema);
exports.ConfirmedTranslations = ConfirmedTranslations;
const ActiveTranslator = (0, mongoose_1.model)("Active_translator", new mongoose_1.Schema({
    user_id: { type: mongoose_1.default.Schema.Types.ObjectId, required: true }
}, {
    timestamps: {
        createdAt: true
    },
    expireAfterSeconds: 5
}));
exports.ActiveTranslator = ActiveTranslator;
const Sentence = (0, mongoose_1.model)("Sentence", new mongoose_1.Schema({
    text: { type: String, required: true },
    author: { type: Number, required: true },
    translations: [{ type: String, required: true }],
    skipped_by: [{ type: Number, required: true }],
    accepted: { type: String, required: true },
    active_translator: [{ type: String, required: true }]
}, {
    timestamps: true
}));
exports.Sentence = Sentence;
//# sourceMappingURL=ISentence.js.map