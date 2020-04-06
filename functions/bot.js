"use strict";

const Telegraf = require("telegraf");
const startAction = require("./actions/start");
const startCron = require("./components/cron-germany");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.use(Telegraf.log());

startAction(bot);
startCron(bot);

bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

exports.handler = async function (event, context, callback) {
  try {
    await bot.handleUpdate(JSON.parse(event.body));
    callback(null, { statusCode: 200, body: "" });
  } catch (e) {
    console.log(e);
    callback({
      statusCode: 400,
      body: "This endpoint is meant for bot and telegram communication",
    });
  }
};
