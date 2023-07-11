import express from 'express';
import bodyParser from 'body-parser';
import { IUser, User } from './models/IUser';
import { IPayment, Payment } from './models/IPayment';
import { ObjectId } from 'mongodb';
import { bot } from './index';
import cors from 'cors';
const morgan = require("morgan")
const PORT = process.env.PORT;


const app = express();
export const secretPath = `/telegraf/secret_path`;
app.use(bodyParser.json());

app.post(`/telegraf/secret_path`, (req, res) => {
    bot.handleUpdate(req.body, res);
});

app.get("/", (req, res) => res.send("Бот запущен!"))

app.get('/success', async (req, res) => {

    try {
        // Extract the billId from the request URL
        let billId: string = res.req.url.replace('/success?billId=', '');

        console.log(billId);

        if (billId && (billId.indexOf('billId') == -1)) {

            // Find the payment document using the billId
            let payment: IPayment | null = await Payment.findOne({
                _id: new ObjectId(billId)
            });

            if (payment) {
                // Find the user document using the payment's user_id
                let user: IUser | null = await User.findOne({
                    id: payment?.user_id
                });

                if (user && payment) {
                    // Send a sticker and a message to the user using the Telegram bot
                    await bot.telegram.sendSticker(user?.id, 'CAACAgIAAxkBAAEIRdBkHZukHX1iJJVPMeQmZvfKXRgfDQACiRkAAkHrwEvwxgiNPD3Rai8E');
                    await bot.telegram.sendMessage(user?.id, 'Спасибо за внесенный платеж!', {
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
                    await User.findOneAndUpdate(
                        {
                            id: user.id
                        },
                        {
                            $set: {
                                supported: user.supported + payment.amount
                            }
                        }
                    );
                }
            }

        }

        // Redirect the user to 'https://t.me/burlive_bot'
    } catch (err) {
        console.error(err)
    }
    res.redirect('https://t.me/burlang_bot');

});

app.use(morgan("dev"));
app.use(cors());
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`) });

const fetchData = async () => {
    const { default: fetch } = await import('node-fetch');

    const res = await fetch('http://localhost:4040/api/tunnels');
    const json = await res.json();
    console.log(json)
    //@ts-ignore
    const secureTunnel = json.tunnels[0].public_url
    console.log(secureTunnel)
    await bot.telegram.setWebhook(`${secureTunnel}${secretPath}`)
        .then(res => {
            console.log(res)
        })
};

async function set_webhook() {
    console.log(`${process.env.mode?.replace(/"/g, '')}`)
    if (`${process.env.mode?.replace(/"/g, '')}` === "production") {
        console.log(`${process.env.mode?.replace(/"/g, '')}`)
        console.log(`secret path: ${secretPath}`)
        await bot.telegram.setWebhook(`https://profori.pro/telegraf/secret_path`)
            .then((status) => {
                console.log(secretPath);
                console.log(status);
            }).catch(err => {
                console.log(err)
            })
    } else {
        await fetchData().catch((error: any) => {
            console.error('Error setting webhook:', error);
        });
    }
};

set_webhook()
