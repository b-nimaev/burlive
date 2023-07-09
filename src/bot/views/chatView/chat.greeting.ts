import { ExtraEditMessageText } from "telegraf/typings/telegram-types"
import rlhubContext from "../../models/rlhubContext"

export default async function greeting(ctx: rlhubContext) {
    try {

        let message: string = ``
        message += `Бот можно применять к любой задаче, \nсвязанной с генерацией текста.`

        let extra: ExtraEditMessageText = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Новый диалог', callback_data: 'new_chat' }],
                    [{ text: 'Назад', callback_data: 'home' }]
                ]
            }
        }

        if (ctx.updateType === 'callback_query') {

            ctx.answerCbQuery()
            await ctx.editMessageText(message, extra)

        } else {

            await ctx.reply(message, extra)

        }

    } catch (error) {

        console.error(error)

    }
}