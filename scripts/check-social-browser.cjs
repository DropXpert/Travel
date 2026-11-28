/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser regression. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { chromium, firefox, webkit } = require("playwright");
const base = process.env.SIDETRAIL_TEST_URL || "http://127.0.0.1:3100";
const engine = process.env.SIDETRAIL_BROWSER || "chromium";
const artifacts = path.join(os.tmpdir(), "share-yarana-social-" + engine);
const key = "share-yarana-social-demo-v1";
const trip = "/trips/sinhagad-sunrise-hike";
fs.mkdirSync(artifacts, { recursive: true });

async function main() {
  const browser = await { chromium, firefox, webkit }[engine].launch({ headless: true, executablePath: engine === "chromium" ? process.env.CHROMIUM_EXECUTABLE : undefined });
  const context = await browser.newContext({ geolocation: { latitude: 18.366, longitude: 73.755 }, permissions: ["geolocation"] });
  const page = await context.newPage();
  const errors = [], requests = [], layouts = [];
  let visitNumber = 0;
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  page.on("request", r => requests.push(r.url()));
  async function visit(url) {
    if (engine !== "chromium" && page.url().startsWith(base)) await page.waitForLoadState("networkidle");
    const target = new URL(base + url);
    target.searchParams.set("socialCheck", String(++visitNumber));
    assert.equal((await page.goto(target.href)).status(), 200);
  }
  async function switchTo(id) {
    await page.getByRole("button", { name: /^Switch Traveller/ }).click();
    await page.getByLabel("Choose traveller").selectOption(id);
    await page.getByText("Traveller switched.", { exact: true }).waitFor();
    await page.locator("#demo-account").getByRole("button", { name: "Close", exact: true }).click();
  }
  async function fits(label) {
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), label + " overflow");
    const dialog = page.locator("dialog[open]");
    if (await dialog.count()) {
      assert.ok(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth), label + " dialog overflow");
      assert.ok(await dialog.evaluate(el => [...el.querySelectorAll('input:not([type="checkbox"]),textarea,select')].every(field => parseFloat(getComputedStyle(field).fontSize) >= 16)), "readable mobile inputs");
    }
    layouts.push(label);
  }
  try {
    await visit("/community");
    await page.evaluate(() => { localStorage.setItem("sidetrail-trip-draft-v1", '{"title":"Protected draft"}'); localStorage.setItem("sidetrail-saved-trip-ids-v1", '["trip-coorg"]'); });
    for (const width of [320, 375, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 850 });
      await visit("/community");
      await page.getByRole("button", { name: "Share a photo", exact: true }).click();
      await fits("photo dialog " + width);
      await page.locator("#share-photo").getByRole("button", { name: "Cancel", exact: true }).click();
      await visit(trip + "/group?tab=chat");
      await page.getByRole("button", { name: "Share location", exact: true }).click();
      await fits("location dialog " + width);
      await page.locator("#chat-location").getByRole("button", { name: "Cancel", exact: true }).click();
    }
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole("button", { name: "Share location", exact: true }).click();
    await page.getByRole("button", { name: "Use current location", exact: true }).click();
    await page.getByText(/Coordinates: 18.366, 73.755/).waitFor();
    assert.equal(await page.evaluate(key => localStorage.getItem(key), key), null, "GPS preview is not saved automatically");
    await page.getByRole("button", { name: "Add location to chat", exact: true }).click();
    const pins = page.getByRole("list", { name: "Shared locations" });
    await pins.getByText("My current location", { exact: true }).waitFor();
    assert.match(await pins.getByRole("link").getAttribute("href"), /18.366%2C73.755/);
    await page.reload();
    await pins.getByText("My current location", { exact: true }).waitFor();
    await page.screenshot({ path: path.join(artifacts, "location-375.png"), fullPage: true });
    // A deterministic permission-denied callback tests the manual fallback without real device access.
    await page.evaluate(() => { navigator.geolocation.getCurrentPosition = (_ok, failure) => failure({ code: 1 }); });
    await page.getByRole("button", { name: "Share location", exact: true }).click();
    await page.getByRole("button", { name: "Use current location", exact: true }).click();
    await page.getByText(/Location permission was denied/).waitFor();
    await page.getByLabel("Place or meeting point").fill("Base village car park");
    await page.getByRole("button", { name: "Add location to chat", exact: true }).click();
    await pins.getByText("Base village car park", { exact: true }).waitFor();
    await pins.getByRole("button", { name: "Remove location" }).last().click();
    await pins.getByText("Base village car park", { exact: true }).waitFor({ state: "detached" });

    await visit("/community");
    await page.getByRole("button", { name: "Share a photo", exact: true }).click();
    await page.getByLabel("Choose photo").setInputFiles({ name: "bad.svg", mimeType: "image/svg+xml", buffer: Buffer.from('<svg/>') });
    await page.getByRole("alert").getByText(/Choose a JPG/).waitFor();
    await page.getByLabel("Choose photo").setInputFiles({ name: "broken.png", mimeType: "image/png", buffer: Buffer.from("not an image") });
    await page.locator("#share-photo").getByRole("alert").waitFor();
    assert.equal(await page.getByAltText("Your selected photo", { exact: true }).count(), 0, "invalid image bytes cannot become a post");
    await page.getByLabel("Choose photo").setInputFiles(path.resolve("public/travel/coorg.webp"));
    await page.getByAltText("Your selected photo", { exact: true }).waitFor();
    await page.getByLabel("Caption", { exact: true }).fill("A quiet morning with the crew");
    assert.equal(await page.getByRole("button", { name: "Post photo locally" }).isDisabled(), true);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Post photo locally" }).click();
    await page.getByRole("status").getByText(/Photo added/).waitFor();
    await page.reload();
    const feed = page.getByRole("region", { name: "From your travels" });
    await feed.getByText("A quiet morning with the crew", { exact: true }).waitFor();
    assert.match(await feed.getByRole("img").getAttribute("src"), /^data:image\/jpeg;base64,/);
    await page.screenshot({ path: path.join(artifacts, "photo-375.png"), fullPage: true });
    await switchTo("traveller-kavya-dev");
    assert.equal(await feed.getByRole("button", { name: "Remove photo" }).count(), 0);
    await visit(trip);
    assert.equal(await page.getByRole("button", { name: "Leave feedback", exact: true }).count(), 0, "pending members cannot review");
    await switchTo("traveller-meera");
    await visit("/dashboard/requests?trip=trip-sinhagad");
    await page.getByRole("button", { name: "Accept request from Kavya & Dev", exact: true }).click();
    await page.getByRole("button", { name: "Confirm acceptance", exact: true }).click();
    await page.getByText("Accepted the request.", { exact: true }).waitFor();
    await switchTo("traveller-kavya-dev");
    await visit(trip);
    for (const width of [320, 375, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 850 });
      await page.getByRole("button", { name: "Leave feedback", exact: true }).click();
      await fits("feedback dialog " + width);
      await page.getByLabel("Your rating").selectOption("5");
      await page.getByLabel("Your feedback").fill("Clear meeting plan and friendly group");
      if (width === 1440) break;
      await page.locator("#trip-feedback").getByRole("button", { name: "Cancel" }).click();
    }
    await page.getByRole("button", { name: "Save feedback locally" }).click();
    await page.getByRole("status").getByText(/Trip feedback saved/).waitFor();
    await page.getByRole("button", { name: "Edit feedback" }).click();
    await page.getByLabel("Your rating").selectOption("4");
    await page.getByRole("button", { name: "Save feedback locally" }).click();
    const reviewSection = page.getByRole("region", { name: "Traveller feedback" });
    await reviewSection.getByLabel("4 out of 5 stars").waitFor();
    assert.equal(await reviewSection.locator("li").count(), 1);
    await page.screenshot({ path: path.join(artifacts, "review-1440.png"), fullPage: true });
    const tab = await context.newPage();
    await tab.goto(base + trip);
    await tab.getByRole("button", { name: "Remove feedback" }).click();
    await reviewSection.locator("li").getByText("Clear meeting plan and friendly group").waitFor({ state: "detached" });
    await tab.close();
    await page.getByRole("button", { name: /^Switch Traveller/ }).click();
    await page.getByRole("button", { name: "Reset Demo Data", exact: true }).click();
    await page.getByRole("button", { name: "Confirm reset", exact: true }).click();
    await page.getByText("Demo data reset.", { exact: true }).waitFor();
    assert.equal(await page.evaluate(key => localStorage.getItem(key), key), null);
    assert.equal(await page.evaluate(() => localStorage.getItem("sidetrail-trip-draft-v1")), '{"title":"Protected draft"}');
    assert.equal(await page.evaluate(() => localStorage.getItem("sidetrail-saved-trip-ids-v1")), '["trip-coorg"]');
    assert.ok(requests.every(url => url.startsWith(base) || url.startsWith("data:") || url.startsWith("blob:")), "no uploads, geolocation pins or reviews sent to third parties");
    assert.deepEqual(errors, [], "console errors");
    console.log("Social browser checks passed: " + layouts.length + " responsive dialogs, photo validation/consent/persistence, location preview/denial/removal, review eligibility/edit/delete, cross-tab updates and reset protection.");
  } finally {
    fs.writeFileSync(path.join(artifacts, "results.json"), JSON.stringify({ layouts, errors }, null, 2));
    await page.screenshot({ path: path.join(artifacts, "last-state.png"), fullPage: true });
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
