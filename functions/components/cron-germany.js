const CronJob = require("cron").CronJob;
const puppeteer = require("puppeteer-core");

const CRONT_TIME = "00 08-17 * * 1-5";
// const CRONT_TIME = "* * * * *";
const CRON_TIMEZONE = "Europe/Kiev";

const EMBASSY_NEWS_PAGE_URL = "https://kiew.diplo.de/ua-uk/aktuelles";
const EMBASSY_SCREENSHOT_FILE = "page-screenshot.png";

async function getLastNewsFromEmbassy() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // await page.setViewport({
  //   width: 720,
  //   height: 1280,
  //   deviceScaleFactor: 1
  // });

  await page.goto(EMBASSY_NEWS_PAGE_URL);
  // await page.screenshot({ path: EMBASSY_SCREENSHOT_FILE });

  const links = await page.$$eval(".c-teaser--big a", resultsSelector => {
    const anchors = Array.from(
      document.querySelectorAll(
        '.u-section.isnt-margintop [data-css="c-teaser"] a'
      )
    );
    return anchors.map(anchor => anchor.getAttribute("title"));
  });

  await browser.close();
  return links;
}

const crontTickFn = ctx => async () => {
  const r = await getLastNewsFromEmbassy();
  const response = r.map(x => `→ ${x}`).join(" \n\n");
  ctx.reply(response);
  ctx.reply(`🕑 Next update will be ${ctx.cron.job.nextDates().fromNow()}`);
};

const cronTerminateFn = ctx => () => {
  ctx.reply("❌ Your subscription terminated");
};

const newCronJob = ctx =>
  new CronJob(
    CRONT_TIME,
    crontTickFn(ctx),
    cronTerminateFn(ctx),
    false,
    CRON_TIMEZONE
  );

const execute = (ctx, action) => {
  if (action === "start") {
    if (!ctx.session.subscription) {
      ctx.session.subscription = true;

      ctx.cron.job.start();

      ctx.reply(
        `⚠️ You have successfully subscribed to the news. Next update will be ${ctx.cron.job
          .nextDates()
          .fromNow()}`
      );
    } else {
      ctx.reply(
        `⚠️ You are alredy subscribed. Next update will be ${ctx.cron.job
          .nextDates()
          .fromNow()}`
      );
    }
  }

  if (action === "stop") {
    ctx.cron.job.stop();
  }
};

module.exports = {
  execute,
  newCronJob
};
