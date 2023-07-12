import { IChat, ChatModel } from "../../../models/IChat"
import { User } from "../../../models/IUser"
import rlhubContext from "../../models/rlhubContext"
  
export default async function create_new_chat_handler(ctx: rlhubContext) {
    try {

        if (ctx.updateType === 'callback_query') {

        } else if (ctx.updateType === 'message' && ctx.update.message.text) {

            if (ctx.update.message.text.trim().length < 2) {
                ctx.reply('Слишком короткое название')
            } else if (ctx.update.message.text.trim().length > 15) {
                ctx.reply('Слишком длинное название')
            } else {

                let message: string = `Создание комнаты с идентификатором: <b>${ctx.update.message.text}</b>`
                await ctx.reply(message, { parse_mode: 'HTML' })

                let user: any = await User.findOne({
                    id: ctx.from?.id
                })

                let chat: IChat = {
                    user_id: user._id,
                    name: ctx.update.message.text.trim(),
                    context: '\n'
                }

                await new ChatModel(chat).save().then(async (res) => {
                    await User.findOneAndUpdate({
                        _id: user._id
                    }, {
                        $push: {
                            chats: res._id
                        }
                    })

                    // objectid
                    ctx.scene.session.current_chat = res._id
                }).then(async () => {
                    await ctx.reply('Подключение API ...').then(async (update) => {
                        await ctx.deleteMessage(update.message_id - 1)
                    })
                    await ctx.reply('Продуктивного диалога!').then(async (update) => {
                        await ctx.deleteMessage(update.message_id - 1)
                        ctx.wizard.selectStep(2)
                    })
                }).catch(async (err) => {
                    if (err.code === 11000) {
                        return ctx.reply('Такое название уже существует')
                    }
                })

            }

        }

    } catch (error) {
        console.error(error)
    }
}