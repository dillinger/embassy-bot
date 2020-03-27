const Telegraf = require("telegraf");
const startAction = require("./actions/start");
const { execute } = require("./components/cron-germany");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.context.cron = {
  isSubscribed: false,
  job: null,
  execute
};

bot.start(ctx => {
  return startAction(ctx);
});

bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

bot.command("embassy_of_germany_start", ctx => {
  ctx.cron.execute(ctx, "start");
});

bot.command("embassy_of_germany_stop", ctx => {
  ctx.cron.execute(ctx, "stop");
});

exports.handler = async event => {
  try {
    await bot.handleUpdate(JSON.parse(event.body));
    return { statusCode: 200, body: "" };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 400,
      body: "This endpoint is meant for bot and telegram communication"
    };
  }
};
