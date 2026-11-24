/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser regression. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium, firefox, webkit } = require("playwright");

const base = process.env.SIDETRAIL_TEST_URL || "http://127.0.0.1:3100";
const engine = process.env.SIDETRAIL_BROWSER || "chromium";
const widths = [320, 375, 390, 768, 1024, 1440];
const artifacts = path.join(os.tmpdir(), "share-yarana-auth-check-" + engine);
fs.mkdirSync(artifacts, { recursive: true });

async function main() {
  const browser = await { chromium, firefox, webkit }[engine].launch({
    headless: true, executablePath: engine === "chromium" ? process.env.CHROMIUM_EXECUTABLE : undefined,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  const requests = [];
  const results = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("request", request => requests.push({ url: request.url(), data: request.postData() || "" }));
  const returnTo = "/explore?group=family#trips";
  async function visit(route) {
    if (engine === "webkit" && page.url().startsWith(base)) await page.waitForLoadState("networkidle");
    const response = await page.goto(base + route);
    assert.equal(response.status(), 200);
  }
  async function layout(label) {
    const metrics = await page.evaluate(() => ({
      width: innerWidth, scroll: document.documentElement.scrollWidth,
      small: [...document.querySelectorAll("button, input")].filter(el => {
        const box = el.getBoundingClientRect();
        return box.width > 0 && (box.width < 44 || box.height < 44);
      }).map(el => el.id || el.textContent),
      inputSizes: [...document.querySelectorAll("input")].map(el => parseFloat(getComputedStyle(el).fontSize)),
    }));
    assert.ok(metrics.scroll <= metrics.width, label + " horizontal overflow");
    assert.deepEqual(metrics.small, [], label + " touch targets");
    assert.ok(metrics.inputSizes.every(size => size >= 16), label + " readable input");
    results.push({ label, width: metrics.width });
  }
  const storage = () => page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
  async function methods() {
    const group = page.getByRole("group", { name: "Sign-in methods" });
    await group.waitFor();
    assert.equal(await group.getByRole("button").count(), 2);
    await group.getByRole("button", { name: "Continue with Google", exact: true }).waitFor();
    await group.getByRole("button", { name: "Continue with Phone", exact: true }).waitFor();
    assert.equal(await page.locator("input").count(), 0);
  }
  try {
    await visit("/sign-in");
    await page.evaluate(() => {
      localStorage.setItem("sidetrail-trip-draft-v1", JSON.stringify({ title: "Keep this saved plan", destination: "Coorg" }));
      localStorage.setItem("sidetrail-saved-trip-ids-v1", '["trip-coorg"]');
    });
    const before = await storage();
    for (const width of widths) {
      await page.setViewportSize({ width, height: 812 });
      for (const mode of ["login", "signup"]) {
        await visit("/sign-in?mode=" + mode + "&returnTo=" + encodeURIComponent(returnTo));
        await methods();
        await layout(mode + " choices");
        const logo = await page.locator('img[src="/brand/google-g.png"]').evaluate(el => {
          const box = el.getBoundingClientRect();
          return { width: box.width, height: box.height };
        });
        assert.ok(Math.abs(logo.width / logo.height - 200 / 204) < .01, "Google logo keeps its supplied proportions");
        if ([375, 1440].includes(width)) await page.screenshot({ path: path.join(artifacts, mode + "-" + width + ".png"), fullPage: true });
        for (const link of await page.getByRole("navigation", { name: "Account entry" }).getByRole("link").all()) {
          assert.equal(new URL(await link.getAttribute("href"), base).searchParams.get("returnTo"), returnTo);
        }
        await page.getByRole("button", { name: "Continue with Google", exact: true }).click();
        await page.getByRole("heading", { name: "Google sign-in, explained.", exact: true }).waitFor();
        assert.ok(await page.locator("#auth-title").evaluate(el => el === document.activeElement));
        assert.match(await page.locator("main").innerText(), /not connected.*not signed in/s);
        assert.equal(context.pages().length, 1, "no OAuth popup");
        assert.equal(await page.locator("input").count(), 0, "no email, password or fake OTP fields");
        assert.equal(new URL(await page.getByRole("link", { name: "Try travel preferences" }).getAttribute("href"), base).searchParams.get("returnTo"), returnTo);
        await layout(mode + " Google explanation");
        await page.getByRole("button", { name: "Back to sign-in methods" }).click();
        assert.ok(await page.getByRole("button", { name: "Continue with Google", exact: true }).evaluate(el => el === document.activeElement));
        await page.getByRole("button", { name: "Continue with Phone", exact: true }).click();
        const number = page.getByLabel("Mobile number", { exact: true });
        assert.ok(await number.evaluate(el => el === document.activeElement));
        await page.getByRole("button", { name: "Continue", exact: true }).click();
        await page.getByRole("alert").getByText("Enter a mobile number.", { exact: true }).waitFor();
        for (const invalid of ["12345", "5123456789", "98765012345", "98abc01234", "+919876501234"]) {
          await number.fill(invalid);
          await page.getByRole("button", { name: "Continue", exact: true }).click();
          assert.equal(await number.getAttribute("aria-invalid"), "true");
        }
        await number.fill("9876501234");
        await layout(mode + " phone form");
        if (width === 375) {
          await page.setViewportSize({ width, height: 420 });
          await number.focus();
          await number.scrollIntoViewIfNeeded();
          const bounds = await number.boundingBox();
          assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= 420, "phone field reachable with shortened viewport");
          await page.setViewportSize({ width, height: 812 });
        }
        await page.getByRole("button", { name: "Continue", exact: true }).click();
        await page.getByRole("heading", { name: "How SMS verification will work.", exact: true }).waitFor();
        assert.match(await page.locator("main").innerText(), /No SMS has been sent.*not been verified/s);
        assert.equal(await page.locator("input").count(), 6);
        const code = page.getByRole("group", { name: "Try entering a code" });
        const firstDigit = code.getByLabel("Digit 1 of 6", { exact: true });
        await firstDigit.focus();
        await page.keyboard.type("482615");
        assert.deepEqual(await code.locator("input").evaluateAll(fields => fields.map(field => field.value)), [..."482615"]);
        await code.getByRole("status").getByText("All six digits entered. Preview only; nothing is verified.", { exact: true }).waitFor();
        await page.keyboard.press("Backspace");
        await page.keyboard.press("Backspace");
        assert.ok(await code.getByLabel("Digit 5 of 6").evaluate(el => el === document.activeElement));
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.type("9");
        assert.equal(await code.getByLabel("Digit 4 of 6").inputValue(), "9");
        await code.getByRole("button", { name: "Clear code", exact: true }).click();
        assert.ok(await firstDigit.evaluate(el => el === document.activeElement));
        await firstDigit.evaluate(el => {
          const data = new DataTransfer();
          data.setData("text", "48 26-15");
          // Firefox removes data from untrusted ClipboardEvent constructors.
          const event = new Event("paste", { bubbles: true, cancelable: true });
          Object.defineProperty(event, "clipboardData", { value: data });
          el.dispatchEvent(event);
        });
        await page.waitForFunction(() => [...document.querySelectorAll('input[aria-label^="Digit "]')].map(field => field.value).join("") === "482615");
        assert.deepEqual(await code.locator("input").evaluateAll(fields => fields.map(field => field.value)), [..."482615"]);
        assert.deepEqual(await storage(), before, "preview code is not stored");
        await page.emulateMedia({ reducedMotion: "reduce" });
        assert.equal(await firstDigit.evaluate(el => getComputedStyle(el).animationName), "none");
        await page.emulateMedia({ reducedMotion: "no-preference" });
        if ([320, 375, 1440].includes(width)) await page.screenshot({ path: path.join(artifacts, "otp-" + mode + "-" + width + ".png"), fullPage: true });
        assert.doesNotMatch(await page.locator("main").innerText(), /9876501234/);
        await layout(mode + " SMS explanation");
        await page.getByRole("button", { name: "Back to sign-in methods" }).click();
        await page.getByRole("button", { name: "Continue with Phone", exact: true }).click();
        assert.equal(await number.inputValue(), "", "number discarded after use");
        await number.fill("9876501234");
        await page.getByRole("link", { name: mode === "login" ? "Sign Up" : "Sign In", exact: true }).click();
        await methods();
        await page.getByRole("button", { name: "Continue with Phone", exact: true }).click();
        assert.equal(await number.inputValue(), "", "mode switch clears number");
        assert.deepEqual(await storage(), before, "auth leaves existing browser data untouched");
      }
      await visit("/verification");
      await page.getByRole("heading", { name: "Phone Verification Required", exact: true }).waitFor();
      await page.getByRole("heading", { name: "Government ID Verification Separate requirement", exact: true }).waitFor();
      await layout("verification requirements");
      console.log("Authentication states passed at " + width + "px");
    }
    await visit("/sign-in?returnTo=https%3A%2F%2Fexample.com");
    assert.equal(await page.getByRole("link", { name: "Back to Share Yarana", exact: true }).getAttribute("href"), "/");
    await page.getByRole("button", { name: "Continue with Google", exact: true }).click();
    await page.getByRole("link", { name: "Try travel preferences" }).click();
    await page.getByRole("heading", { name: /find your kind of adventure/ }).waitFor();
    assert.equal(await page.getByRole("radio").count(), 3, "solo, couple and family onboarding stays available");
    assert.deepEqual(await storage(), before);
    assert.deepEqual(await context.cookies(), [], "no authentication cookies");
    await visit("/trips/new");
    await page.getByText("Real hosting will require phone verification by SMS and a separate government ID check. This local demo stays open.", { exact: true }).waitFor();
    await visit("/trips/lake-pichola-weekend");
    await page.getByRole("button", { name: "Request to Join", exact: true }).click();
    await page.locator("#join-trip").getByText("Real trips will require phone verification by SMS and a separate government ID check. This local demo stays open.", { exact: true }).waitFor();
    assert.ok(await page.getByRole("button", { name: "Send request", exact: true }).isEnabled(), "verification guidance does not gate the local demo");
    await page.keyboard.press("Escape");
    assert.ok(requests.every(({ url, data }) => !url.includes("9876501234") && !data.includes("9876501234")), "number is never transmitted");
    assert.ok(requests.every(({ url, data }) => !url.includes("482615") && !data.includes("482615")), "preview code is never transmitted");
    assert.ok(requests.every(({ url }) => new URL(url).origin === new URL(base).origin), "logo/font are local; no OAuth or SMS requests");
    assert.deepEqual(errors, [], "console/runtime errors");
    console.log("Auth checks passed: two methods, validation, explanations, navigation, focus and no data transmission/storage.");
  } finally {
    fs.writeFileSync(path.join(artifacts, "results.json"), JSON.stringify({ results, errors }, null, 2));
    await page.screenshot({ path: path.join(artifacts, "last-state.png"), fullPage: true });
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
