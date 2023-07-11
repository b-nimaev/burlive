import { Composer, Scenes } from "telegraf";
import { ConfirmedTranslations, Sentence, Translation, translation, voteModel } from "../../models/ISentence";
import rlhubContext from "../models/rlhubContext";
import { IUser, User } from "../../models/IUser";
import greeting from "./moderationView/greeting";

// handlers and renders 
import moderation_translates, { render_vote_sentence } from "./moderationView/moderationTranslates";
import { moderation_sentences, updateSentence } from "./moderationView/moderationSentencesHandler";
import { ObjectId } from "mongodb";
import { ExtraEditMessageText } from "telegraf/typings/telegram-types";
import { IReport, ReportModel } from "../../models/IReport";

const handler = new Composer<rlhubContext>();
const moderation = new Scenes.WizardScene("moderation", handler,
    async (ctx: rlhubContext) => moderation_sentences_handler(ctx),
    async (ctx: rlhubContext) => moderation_translates_handler(ctx),
    async (ctx: rlhubContext) => moderation_report_handler(ctx)
)

async function moderation_report_handler(ctx: rlhubContext) {

    try {

        if (ctx.updateType === 'callback_query' || ctx.updateType === 'message') {


            if (ctx.updateType === 'callback_query') {
                if (ctx.update.callback_query.data === 'continue' || ctx.update.callback_query.data === 'back') {
                    await render_vote_sentence(ctx)
                }
            }

            if (ctx.updateType === 'message') {

                // отправка жалобы в канал
                let senderReport = await ctx.telegram.forwardMessage('-1001952917634', ctx.update.message.chat.id, ctx.message.message_id)
                let user: IUser | null = await User.findOne({
                    id: ctx.from?.id
                })

                if (user) {

                    let report: IReport = {
                        // @ts-ignore
                        user_id: user._id,
                        translation_id: ctx.scene.session.current_translation_for_vote,
                        message_id: senderReport.message_id
                    }

                    await new ReportModel(report).save().then(async (report) => {
                        await User.findOneAndUpdate({
                            id: ctx.from?.id
                        }, {
                            $push: {
                                reports: report._id
                            }
                        })
                    })

                }

                let message: string = `<b>Спасибо!</b> \nВаше сообщение принято на рассмотрение.`
                await ctx.reply(message, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Вернуться к модерации', callback_data: 'continue' }]
                        ]
                    }
                })

            }

        } else {

            await report_section_render(ctx)
        
        }

        ctx.answerCbQuery()

    } catch (err) { console.error(err) }

}
moderation.enter(async (ctx: rlhubContext) => await greeting(ctx));

moderation.action("moderation_sentences", async (ctx) => await moderation_sentences(ctx))

async function moderation_sentences_handler(ctx: rlhubContext) {
    try {

        let update = ctx.updateType

        if (update === 'callback_query') {

            let data: 'back' | 'good' | 'bad' = ctx.update.callback_query.data

            if (data === 'back') {
                
                ctx.wizard.selectStep(0)
                await greeting(ctx)
            
            }

            if (data === 'good') {
                await updateSentence(ctx, 'accepted')
            }

            if (data === 'bad') {
                await updateSentence(ctx, 'declined')
            }

            ctx.answerCbQuery()

        } else {

            await moderation_sentences(ctx)

        }

    } catch (err) {

        console.log(err)
    
    }
}

moderation.action("moderation_translates", async (ctx) => await moderation_translates(ctx))
async function updateRating(translation: translation) {
    
    let votes = translation.votes
    let rating: number = 0

    if (votes) {

        let pluses = 0
        let minuses = 0

        for (let i = 0; i < votes.length; i++) {

            let voteDocument = await voteModel.findById(votes[i])

            if (voteDocument) {

                if (voteDocument.vote === true) {
                    pluses = pluses + 1
                } else {
                    minuses = minuses + 1
                }

            }

        }

        console.log(`pluses: ${pluses}`)
        console.log(`minuses: ${minuses}`)

        rating = pluses - minuses
        // console.log(rating)
        return rating
    }
    // console.log(rating)
}
async function ratingHandler(translation: any) {
    if (translation) {

        let rating: number | undefined = await updateRating(translation)
        if (rating) {

            // @ts-ignore
            await Translation.findByIdAndUpdate(translation._id, {

                $set: {
                    rating: rating
                }

            }).then(async (newtranslation) => {

                // @ts-ignore
                if (rating >= 3) {

                    await new ConfirmedTranslations(newtranslation?.toObject()).save()
                    await Translation.findByIdAndDelete(newtranslation?._id)
                }

            })
        }

    }
}
// обрабатываем голос
async function moderation_translates_handler(ctx: rlhubContext) {
    if (ctx.updateType === 'callback_query') {

        // сохраняем коллбэк
        let data: 'back' | 'addTranslate' | 'good' | 'bad' | 'skip' = ctx.update.callback_query.data
        let translate_id = ctx.scene.session.current_translation_for_vote

        let user = await User.findOne({ id: ctx.from?.id })

        if (user) {
            if (data === 'good') {

                // Сохраняем голос +
                await new voteModel({ user_id: user?._id, translation_id: translate_id, vote: true }).save().then(async (data) => {

                    // Возвращаем _id сохранненого голоса
                    let vote_id = data._id

                    // пушим в массив голосов докумена перевода
                    await Translation.findOneAndUpdate({ _id: translate_id }, { $push: { votes: vote_id } })
                        .then(async (translation) => await ratingHandler(translation))

                    await User.findOneAndUpdate({ _id: user?._id }, { $addToSet: { voted_translations: translate_id } })
                })

                await render_vote_sentence(ctx)

            } else if (data === 'bad') {

                // сохраняем голос -
                await new voteModel({ user_id: user?._id, translation_id: translate_id, vote: false }).save().then(async (data) => {

                    // вернули айдишку
                    let vote_id = data._id

                    await User.findOneAndUpdate({ _id: user?._id }, { $addToSet: { voted_translations: translate_id } })
                    // сохранили айдишку в документе перевода
                    await Translation.findOneAndUpdate({ _id: translate_id }, { $push: { votes: vote_id } })
                        .then(async (translation) => await ratingHandler(translation))
                })

                await render_vote_sentence(ctx)

            } else if (data === 'skip') {

                await Translation.findByIdAndUpdate(translate_id, {
                    $push: {
                        skipped_by: user._id
                    }
                })

            }
        } else {
            ctx.wizard.selectStep(0)
            await greeting(ctx)
        }

        // Если чел хочет вернутьтся на начальный экран модерации
        if (data === 'back') {

            ctx.wizard.selectStep(0)
            await greeting(ctx)

        }

        ctx.answerCbQuery()

    } else {

        await render_vote_sentence(ctx)

    }
}

moderation.action("moderation_vocabular", async (ctx) => { ctx.answerCbQuery('Модерация словаря в разработке') })

moderation.action("report", async (ctx) => await report_section_render(ctx))

async function report_section_render(ctx: rlhubContext) {
    try {

        let message: string = '<b>Модерация / Голосование / Жалоба</b>\n\n'
        let translation = await Translation.findOne({
            // @ts-ignore
            _id: ctx.scene.session.current_translation_for_vote
        })

        if (translation) {
            let sentence_russian = await Sentence.findOne({
                _id: new ObjectId(translation?.sentence_russian)
            })

            if (sentence_russian) {
                message += `Предложение\n\n`
                message += `<code>${sentence_russian.text}</code>\n\n`
            }

            message += `Перевод\n\n`
            message += `<code>${translation.translate_text}</code>`

            message += `\n\n<b>Отправьте следующим сообщением, причину жалобы</b>`

            let extra: ExtraEditMessageText = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Назад', callback_data: 'back' }]
                    ]
                }
            }

            if (ctx.updateType === 'callback_query') {
                await ctx.editMessageText(message, extra).then(() => {
                    ctx.wizard.selectStep(3)
                })
            } else {
                await ctx.reply(message, extra).then(() => {
                    ctx.wizard.selectStep(3)
                })
            }

        }

    } catch (err) {
        console.error(err)
    }
}

handler.on("message", async (ctx) => await greeting(ctx))

handler.action("back", async (ctx) => {
    await ctx.answerCbQuery()
    return ctx.scene.enter("home")
})

export default moderation