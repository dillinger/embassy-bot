const Telegraf = require("telegraf");
const startAction = require("./actions/start");
const { execute, newCronJob } = require("./components/cron-germany");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.use((ctx, next) => {
  ctx.state.cron = {
    isSubscribed: false,
    job: newCronJob(ctx),
    execute
  };
  return next();
});

bot.start(ctx => {
  startAction(ctx);
});

bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

bot.command("embassy_of_germany_start", ctx => {
  ctx.state.cron.execute(ctx, "start");
});

bot.command("embassy_of_germany_stop", ctx => {
  ctx.state.cron.execute(ctx, "stop");
});

exports.handler = async function(event, context, callback) {
  try {
    await bot.handleUpdate(JSON.parse(event.body));
    callback(null, { statusCode: 200, body: "" });
  } catch (e) {
    console.log(e);
    callback({
      statusCode: 400,
      body: "This endpoint is meant for bot and telegram communication"
    });
  }
};
