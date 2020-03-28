const { newCronJob } = require("../components/cron-germany");

module.exports = async ctx => {
  ctx.reply(`Welcome! Please choose a subscription:

    /embassy_of_germany_start - Subscribe to news from kiew.diplo.de
    /embassy_of_germany_stop - Unsubscribe from kiew.diplo.de
  `);
};
