// Headless Chrome over CDP: open a browser test page, wait for PASS/FAIL in the title, print the report.
// Needs the preview server on port 4186 (npm start) and the CDP helper from the Hunt Club deck tools.
// node tools/test/run-browser.mjs tests/browser.html   (also tests/homeward.html, tests/layout.html)
// "Chrome did not start" straight after another run means the last Chrome still holds port 9361: run it again.
// layout.html never sets PASS/FAIL: it waits the full 3 minutes, then prints "Layout — …" or "OVERFLOW — …".
import { tmpdir } from "node:os";
import { join } from "node:path";
import { launch, sleep } from "file:///E:/Projects/Codex/hunt-club/docs/deck/tools/cdp.mjs";
const [path = "tests/browser.html", w = "1366", h = "900"] = process.argv.slice(2);
// A fresh profile per run: a Chrome left over from an interrupted run can keep the old one locked.
const b = await launch({ port: 9361, profile: join(tmpdir(), `mammals-test-chrome-${process.pid}`) });
const p = await b.page("suite", { width: +w, height: +h, scale: 1 });
await p.send("Emulation.setDeviceMetricsOverride", { width: +w, height: +h, deviceScaleFactor: 1, mobile: false });
await p.send("Emulation.setTouchEmulationEnabled", { enabled: false });
await p.goto(`http://127.0.0.1:4186/${path}`);
const t0 = Date.now();
let title = "";
while (Date.now() - t0 < 180000) {
  title = await p.evaluate("document.title");
  if (/^(PASS|FAIL)/.test(title)) break;
  await sleep(500);
}
console.log(title);
console.log(await p.evaluate("(document.getElementById('report')||document.body).textContent"));
await b.close?.();
process.exit(0);
