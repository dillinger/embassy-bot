const Telegraf = require("telegraf");
const LocalSession = require("telegraf-session-local");
const startAction = require("./actions/start");
const { execute } = require("./components/cron-germany");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.use(new LocalSession({ database: "session_db.json" }).middleware());

bot.use((ctx, next) => {
  ctx.session.subscription = ctx.session.subscription || false;
  return next();
});

bot.context.cron = {
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

// process.on("SIGINT", code => {
//   console.log("Process exit event with code: ", code);
//   fs.writeFile("session_db.json", "", err => {
//     if (err) console.log("Cannt write into file: session_db.json");
//     console.log("Session reset successfuly.");
//   });
//   process.exit(1);
// });

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
