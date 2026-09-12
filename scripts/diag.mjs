import { chromium } from "playwright";
import { resolve } from "node:path";
const b = await chromium.launch({ args:[
 "--use-fake-ui-for-media-stream","--use-fake-device-for-media-capture",
 `--use-file-for-fake-audio-capture=${resolve("demo-recording/caller_mic.wav")}`,
 "--autoplay-policy=no-user-gesture-required"]});
const p = await (await b.newContext({ viewport:{width:1920,height:1080}, permissions:["microphone"] })).newPage();
await p.goto("https://sankatmochan.rohitdarekar.dpdns.org", { waitUntil:"domcontentloaded" });
await p.waitForSelector("text=QUEUE");
let ok=false;
for(let i=0;i<6&&!ok;i++){ await p.getByRole("button",{name:/Voice/}).click({force:true}); await new Promise(r=>setTimeout(r,1500)); ok = await p.locator("text=Start 112 Call").count()>0; }
await p.getByRole("button",{name:/Start 112 Call/i}).click({force:true});
await new Promise(r=>setTimeout(r,15000));
const t = await p.locator("body").innerText();
const i = t.indexOf("112 VOICE AGENT");
console.log("─── voice panel ───");
console.log(t.slice(i, i+700));
await b.close();
