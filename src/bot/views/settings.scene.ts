import { Composer, Scenes } from "telegraf";
import rlhubContext from "../models/rlhubContext";
import greeting from "./settingsView/greeting";
import date_birth_handler, { date_birth, date_birth_get_years, date_birth_get_years_handler } from "./settingsView/date_of_birth";

const handler = new Composer<rlhubContext>();
const settings = new Scenes.WizardScene("settings", handler,
    async (ctx: rlhubContext) => await date_birth_handler(ctx),
    async (ctx: rlhubContext) => await date_birth_get_years_handler(ctx),
    async (ctx: rlhubContext) => await select_year(ctx)
);

async function select_year(ctx:rlhubContext) {
    try {

        if (ctx.updateType === 'callback_query') {

            ctx.answerCbQuery(ctx.update.callback_query.data)

            if (ctx.update.callback_query.data === 'back') {

                await date_birth_get_years(ctx)
                ctx.wizard.selectStep(2)

            }

        }

    } catch (error) {
        console.error(error)
    }
}

settings.enter(async (ctx: rlhubContext) => await greeting(ctx));

handler.on("message", async (ctx) => await greeting(ctx))

handler.action("back", async (ctx) => {
    await ctx.answerCbQuery()
    return ctx.scene.enter("dashboard")
})

settings.action("choose_ln", async (ctx) => {
    return ctx.answerCbQuery()
})

settings.action("choose_gender", async (ctx) => {
    return ctx.answerCbQuery()
})

settings.action("date_birth", async (ctx: rlhubContext) => await date_birth(ctx))

export default settings