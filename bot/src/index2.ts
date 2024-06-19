import { Context, Scenes, session, Telegraf } from "telegraf";

/**
 * It is possible to extend the session object that is available to each scene.
 * This can be done by extending `SceneSessionData` and in turn passing your own
 * interface as a type variable to `SceneContextScene`.
 */
interface MySceneSession extends Scenes.SceneSessionData {
  // will be available under `ctx.scene.session.mySceneSessionProp`
  mySceneSessionProp: number;
}

/**
 * We can define our own context object.
 *
 * We now have to set the scene object under the `scene` property. As we extend
 * the scene session, we need to pass the type in as a type variable.
 */
interface MyContext extends Context {
  // will be available under `ctx.myContextProp`
  myContextProp: string;

  // declare scene type
  scene: Scenes.SceneContextScene<MyContext, MySceneSession>;
}

// Handler factories
const { enter, leave } = Scenes.Stage;
import dotenv from "dotenv";
dotenv.config();
// Greeter scene
const greeterScene = new Scenes.BaseScene<MyContext>("greeter");
greeterScene.enter((ctx) => ctx.reply("Hi"));
greeterScene.leave((ctx) => ctx.reply("Bye"));
greeterScene.hears("hi", enter<MyContext>("greeter"));
greeterScene.on("message", (ctx) => ctx.replyWithMarkdown("Send `hi`"));

// Echo scene
const echoScene = new Scenes.BaseScene<MyContext>("echo");
echoScene.enter((ctx) => ctx.reply("echo scene"));
echoScene.leave((ctx) => ctx.reply("exiting echo scene"));
echoScene.command("back", leave<MyContext>());
echoScene.on("text", (ctx) => ctx.reply(ctx.message.text));
echoScene.on("message", (ctx) => ctx.reply("Only text messages please"));

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN);

const stage = new Scenes.Stage<MyContext>([greeterScene, echoScene], {
  ttl: 10,
});

bot.use(session());
bot.use(stage.middleware());
bot.use((ctx, next) => {
    console.log('12312312')
  // we now have access to the the fields defined above
  ctx.myContextProp ??= "";
  ctx.scene.session.mySceneSessionProp ??= 0;
  return next();
});
bot.command("greeter", (ctx) => ctx.scene.enter("greeter"));
bot.command("echo", (ctx) => ctx.scene.enter("echo"));
bot.on("message", (ctx) => ctx.reply("Try /echo or /greeter"));

bot.launch();
