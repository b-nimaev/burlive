import { Composer, Scenes } from "telegraf";
import rlhubContext from "../models/rlhubContext";
import { User } from "../../models/IUser";
import { ChatModel, IChat } from "../../models/IChat";
import greeting from "./chatView/chat.greeting";
import create_new_chat_handler from "./chatView/createNewChat";
import { ObjectId } from "mongoose";
import { sendRequest } from "./chatView/sendRequest";
import { ExtraEditMessageText } from "telegraf/typings/telegram-types";
import { Configuration, OpenAIApi } from "openai";
import { error } from "console";
const configuration = new Configuration({
    apiKey: process.env.apikey,
});

const openai = new OpenAIApi(configuration);
const handler = new Composer<rlhubContext>();
const chat = new Scenes.WizardScene("chatgpt", handler,
    async (ctx: rlhubContext) => await create_new_chat_handler(ctx),
    async (ctx: rlhubContext) => await new_chat_handler(ctx),
    async (ctx: rlhubContext) => await select_chat_handler(ctx)
)

chat.enter(async (ctx: rlhubContext) => await greeting(ctx))
chat.command('main', async (ctx) => {
    return ctx.scene.enter('home')
})

// Генерация случайного целого числа от min до max
function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

chat.action("list", async (ctx) => {

    ctx.answerCbQuery("У вас нет сохраненных диалогов!")

})

handler.action("home", async (ctx: rlhubContext) => {
    try {

        ctx.answerCbQuery()
        return await ctx.scene.enter('home')

    } catch (error) {

        console.error(error)

    }
})
handler.action("new_chat", async (ctx) => {

    try {

        // уведомление о создании комнаты

        let message: string = `Создание комнаты с идентификатором: <b>${getRandomInt(1, 190)}...</b>`
        await ctx.reply(message, { parse_mode: 'HTML' })

        // находим пользователя

        let user: any = await User.findOne({
            id: ctx.from?.id
        })

        let chat: IChat = {
            user_id: user._id,
            context: '\nПривет!\n'
        }

        await new ChatModel(chat).save().then((async (response) => {

            await User.findByIdAndUpdate(user._id, { $push: { chats: response._id } })

            // сохраняем айди чата в контекст бота 
            ctx.scene.session.current_chat = response._id

        }))

        let current_chat: ObjectId = ctx.scene.session.current_chat
        let old = await ChatModel.findById(current_chat)
        let newDoc = await ChatModel.findById(current_chat)

        await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            temperature: .1,
            // @ts-ignore
            messages: [{ role: "user", content: newDoc?.context.trim() }],
        }).then(async (response) => {

            if (response) {

                let current_chat: ObjectId = ctx.scene.session.current_chat
                let old = await ChatModel.findById(current_chat)
                let chat = await ChatModel.findOneAndUpdate({
                    _id: current_chat
                }, {
                    $set: {
                        // @ts-ignore
                        context: old?.context + '/n/n' + response.data.choices[0].message?.content.trim() + '/n/n'
                    }
                })

                // @ts-ignore
                await ctx.editMessageText(response.data.choices[0].message?.content, { parse_mode: 'HTML' })
            }

        })

    } catch (error) {

        console.error(error)

    }

    ctx.wizard.selectStep(2)

})
handler.action("chats", async (ctx) => {

    ctx.wizard.selectStep(3)
    ctx.answerCbQuery()

    let user = await User.findOne({
        id: ctx.from?.id
    })

    let chats = await ChatModel.find({
        user_id: user?._id
    })

    const itemsOnPerPage = 5

    if (chats.length) {
        if (chats.length > itemsOnPerPage) {

            const pages = Math.ceil(chats.length / itemsOnPerPage)
            const sliced = chats.slice(0, itemsOnPerPage)

            sliced.forEach(async (element) => {
                console.log(element.name)
            })

        } else {

            let message: string = 'Выберите чат, с которым хотите продолжить работу'
            let extra: ExtraEditMessageText = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: []
                }
            }

            chats.forEach(async (chat) => {

            })

            extra.reply_markup?.inline_keyboard.push([{ text: 'Назад', callback_data: 'back' }])
            await ctx.editMessageText(message, extra)
            ctx.wizard.selectStep(3)

        }
    }

})
handler.on("message", async (ctx) => await greeting(ctx))

async function select_chat_handler(ctx: rlhubContext) {
    try {
        if (ctx.updateType === 'callback_query') {

            let data: string = ctx.update.callback_query.data

            if (data === 'back') {

                ctx.wizard.selectStep(0)
                await greeting(ctx)

            }

            ctx.answerCbQuery()

        }
    } catch (error) {
        console.error(error)
    }
}

async function new_chat_handler(ctx: rlhubContext) {
    try {

        await sendRequest(ctx).then(async (res) => {
            if (res) {
                // res.data.choices[0].message?.content
                let current_chat: ObjectId = ctx.scene.session.current_chat
                let old = await ChatModel.findById(current_chat)
                let chat = await ChatModel.findOneAndUpdate({
                    _id: current_chat
                }, {
                    $set: {
                        // @ts-ignore
                        context: old?.context + '/n/n' + res.data.choices[0].message?.content.trim() + '/n/n'
                    }
                })
                // @ts-ignore
                await ctx.reply(res.data.choices[0].message?.content, { parse_mode: 'HTML' }).catch(async (error) => {
                    await ctx.reply(`При отправке результата возникла ошибка, можете переформулировать запрос? Ошибка: \n` + error.response.description)
                })
            }
        })

    } catch (error) {
    
        console.log(error)
        
    }
}

export default chat