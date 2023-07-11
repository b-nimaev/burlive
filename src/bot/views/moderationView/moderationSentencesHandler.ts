import { ObjectId } from "mongodb"
import { ISentence, Sentence } from "../../../models/ISentence"
import rlhubContext from "../../models/rlhubContext"
import greeting from "./greeting"
import { ExtraEditMessageText } from "telegraf/typings/telegram-types"
import { User } from "../../../models/IUser"

export async function moderation_sentences_handler(ctx: rlhubContext) {
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

        }

    } catch (err) {
        console.log(err)
    }
}

export async function updateSentence(ctx: rlhubContext, value: 'accepted' | 'declined' | 'not view') {


    await Sentence.findOneAndUpdate({ _id: new ObjectId(ctx.session.__scenes.moderation_sentence) }, {
        $set: {
            'accepted': value
        }
    }).then(async (res) => {
        if (res) {
            if (res.accepted === 'accepted') {
                ctx.answerCbQuery('Предложение принято ✅')
            } else if (res.accepted === 'declined') {
                ctx.answerCbQuery('Предложение отправлено на рассмотрение')
            }
        }
    }).catch(err => {
        console.log(err)
    })

    await moderation_sentences(ctx)

}

export async function moderation_sentences(ctx: rlhubContext) {
    try {

        return await Sentence.findOne({ accepted: "not view" }).then(async (document: ISentence | null) => {

            // Если предлождений для модерации нет

            if (!document) {

                await ctx.answerCbQuery('Предложений не найдено')
                ctx.wizard.selectStep(0)
                return await greeting(ctx).catch(() => { ctx.answerCbQuery('Предложений не найдено') })
            
            } else {

                // Если есть предложения для модерации сохраняем его в контекст

                if (document._id) {

                    ctx.session.__scenes.moderation_sentence = document._id.toString()
                
                }


                // Инициализируем переменные

                let message: string = `<b>Модерация</b> \n\n`
                let extra: ExtraEditMessageText = {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '👍',
                                    callback_data: 'good'
                                },
                                {
                                    text: '👎',
                                    callback_data: 'bad'
                                }
                            ],
                            [
                                {
                                    text: 'Назад',
                                    callback_data: 'back'
                                }
                            ]
                        ]
                    }
                }

                const options = {
                    weekday: 'short', // короткое название дня недели, например 'Пн'
                    year: 'numeric', // год, например '2023'
                    month: 'short', // короткое название месяца, например 'апр'
                    day: 'numeric', // число месяца, например '21'
                    hour: 'numeric', // часы, например '17'
                    minute: 'numeric', // минуты, например '14'
                    second: 'numeric', // секунды, например '33'
                };

                const formattedDate = document.createdAt.toLocaleDateString('ru-RU', options); // 'Пн, 21 апр. 2023'

                message += `${document.text} \n\n`
                message += `<pre>${formattedDate}</pre>`

                if (ctx.updateType === 'callback_query') {

                    await ctx.editMessageText(message, extra)
                    ctx.wizard.selectStep(1)
                    ctx.answerCbQuery()

                } else {

                    await ctx.reply(message, extra)

                }

            }
        })


    } catch (err) {

        console.log(err)

    }
}