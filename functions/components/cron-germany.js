"use strict";

const CronJob = require("cron").CronJob;
const puppeteer = require("puppeteer-core");
const chrome = require("chrome-aws-lambda");
const Composer = require("telegraf/composer");
const Markup = require("telegraf/markup");

const composer = new Composer();

const exePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// const CRONT_TIME = "00 08-17 * * 1-5";
const CRONT_TIME = "* * * * *";
const CRON_TIMEZONE = "Europe/Kiev";

const EMBASSY_NEWS_PAGE_URL = "https://kiew.diplo.de/ua-uk/aktuelles";
// const EMBASSY_SCREENSHOT_FILE = "page-screenshot.png";

async function getOption(isDev) {
  if (isDev) {
    return {
      product: "chrome",
      args: [],
      executablePath: exePath,
      headless: true,
    };
  }

  return {
    product: "chrome",
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  };
}

const allSubscription = {};

function registerTasks(ctx) {
  allSubscription[ctx.chat.id] = new CronJob(
    CRONT_TIME,
    crontTickFn(ctx),
    cronTerminateFn(ctx),
    false,
    CRON_TIMEZONE
  );
}

async function getLastNewsFromEmbassy() {
  try {
    const option = await getOption(false);

    const browser = await puppeteer.launch(option);
    const page = await browser.newPage();

    await page.goto(EMBASSY_NEWS_PAGE_URL);
    // await page.screenshot({ path: EMBASSY_SCREENSHOT_FILE });

    const links = await page.$$eval(".c-teaser--big a", (resultsSelector) => {
      const anchors = Array.from(
        document.querySelectorAll(
          '.u-section.isnt-margintop [data-css="c-teaser"] a'
        )
      );
      return anchors.map((anchor) => anchor.getAttribute("title"));
    });

    await browser.close();
    return links;
  } catch {
    console.log("Somthing whent wrong width Puppeteer...");
  }
}

const crontTickFn = (ctx) => async () => {
  const r = await getLastNewsFromEmbassy();
  ctx.reply(r.map((x) => `→ ${x}`).join(" \n\n"));
};

const cronTerminateFn = (ctx) => () => {
  console.log("CRONT TERMINATE FUNC");
  ctx.editMessageText(
    "Please choose a subscription:",
    Markup.inlineKeyboard([
      Markup.callbackButton("🇩🇪 Embassy", "embassy_of_germany_start"),
    ]).extra()
  );
  return ctx.answerCbQuery("❌ Your subscription terminated");
};

composer.action("embassy_of_germany_start", async (ctx) => {
  const chatId = ctx.chat.id;

  if (!Object.keys(allSubscription).includes("" + chatId)) {
    registerTasks(ctx);

    allSubscription[chatId].start();

    ctx.editMessageText(
      `You have successfully subscribed to the news. Next update: ${allSubscription[
        chatId
      ]
        .nextDates()
        .calendar()}`,
      Markup.inlineKeyboard([
        Markup.callbackButton("❌ Unsubscribe", "embassy_of_germany_stop"),
      ]).extra()
    );

    return ctx.answerCbQuery(
      `⚠️ You have successfully subscribed to the news. Next update will be ${allSubscription[
        chatId
      ]
        .nextDates()
        .fromNow()}`
    );
  } else {
    return ctx.answerCbQuery(
      `⚠️ You are alredy subscribed. Next update will be ${allSubscription[
        chatId
      ]
        .nextDates()
        .fromNow()}`
    );
  }
});

composer.action("embassy_of_germany_stop", async (ctx) => {
  const chatId = ctx.chat.id;

  if (!allSubscription[chatId]) {
    return ctx.answerCbQuery(
      `There are no any active subscription with that ID ${chatId}`
    );
  }

  // Stop Cron task
  allSubscription[chatId].stop();

  // Destroy Cron task
  delete allSubscription[chatId];
});

module.exports = (bot) => {
  bot.use(composer.middleware());
};
