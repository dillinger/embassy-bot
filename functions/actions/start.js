"use strict";

const Composer = require("telegraf/composer");
const composer = new Composer();
const Markup = require("telegraf/markup");

composer.start(async (ctx) => {
  return ctx.reply(
    "Welcome! Please choose a subscription:",
    Markup.inlineKeyboard([
      Markup.callbackButton("🇩🇪 Embassy", "embassy_of_germany_start"),
    ]).extra()
  );
});

module.exports = (bot) => {
  bot.use(composer.middleware());
};
