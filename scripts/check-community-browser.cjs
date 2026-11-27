/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS test runner. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium, firefox, webkit } = require("playwright");

const base = process.env.SIDETRAIL_TEST_URL || "http://127.0.0.1:3100";
const engine = process.env.SIDETRAIL_BROWSER || "chromium";
const artifacts = path.join(os.tmpdir(), "sidetrail-community-check-" + engine);
fs.mkdirSync(artifacts, { recursive: true });
const widths = [320, 375, 390, 768, 1024, 1440];
const routes = ["/", "/explore", "/trips/new", "/trips/guided-harishchandragad-trek",
  "/trips/lake-pichola-weekend", "/trips/riverside-rishikesh-weekend", "/profile",
  "/travellers/meera-wanders", "/community", "/community/pune-sunrise-hikers", "/dashboard",
  "/dashboard/requests", "/trips/sinhagad-sunrise-hike/group", "/onboarding", "/sign-in?mode=signup", "/verification"];

async function main() {
  const browser = await { chromium, firefox, webkit }[engine].launch({
    headless: true, executablePath: engine === "chromium" ? process.env.CHROMIUM_EXECUTABLE : undefined,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  const results = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text() + " (" + message.location().url + ")"); });
  async function settleBeforeNavigation() {
    // WebKit can report a retiring document's cancelled Next.js prefetch as an access-control error.
    if (engine === "webkit" && page.url().startsWith(base)) await page.waitForLoadState("networkidle");
  }
  async function reload() {
    await settleBeforeNavigation();
    await page.reload({ waitUntil: "domcontentloaded" });
  }
  const visit = async (route) => {
    await settleBeforeNavigation();
    const response = await page.goto(base + route, { waitUntil: "domcontentloaded" });
    assert.ok([200, 304].includes(response.status()), route + " responded " + response.status());
    await page.locator("main").waitFor();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };
  const visitAtWidth = (route, width) => visit(route + (route.includes("?") ? "&" : "?") + "auditWidth=" + width);
  const assertFits = async (name) => {
    const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(dimensions.scroll <= dimensions.width, name + " overflows: " + JSON.stringify(dimensions));
  };
  const assertTypography = async (route) => {
  const typography = await page.evaluate(() => {
    const visible = el => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
    const controls = [...document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), select, textarea')].filter(visible);
    return {
      smallInputs: controls.filter(el => parseFloat(getComputedStyle(el).fontSize) < 16).map(el => el.name || el.id),
      largeHeadings: [...document.querySelectorAll('h1')].filter(visible).filter(el => parseFloat(getComputedStyle(el).fontSize) > (innerWidth < 768 ? 28 : 44)).map(el => el.textContent),
    };
  });
  assert.deepEqual(typography.smallInputs, [], route + " input font must remain at least 16px");
  assert.deepEqual(typography.largeHeadings, [], route + " headings stay compact");
  };
  const switchDemo = async (id) => {
    await page.getByRole("button", { name: /^Switch Traveller/ }).click();
    const dialog = page.locator("#demo-account");
    await dialog.getByLabel("Choose traveller").selectOption(id);
    await dialog.getByText("Traveller switched.", { exact: true }).waitFor();
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
  };
  const requestToJoin = async () => {
    await page.getByRole("button", { name: "Request to Join", exact: true }).click();
    await page.getByRole("button", { name: "Send request", exact: true }).click();
    await page.getByRole("heading", { name: "Request saved" }).waitFor();
    await page.getByRole("link", { name: "View My Requests", exact: true }).click();
  };
  try {
    assert.equal((await context.request.get(base + "/favicon.ico")).status(), 200);
    for (const width of process.env.SIDETRAIL_FLOWS_ONLY ? [] : widths) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await visitAtWidth(route, width);
        await assertFits(route);
        await page.getByRole("link", { name: "Share Yarana home", exact: true }).first().waitFor();
        assert.match(await page.title(), /Share Yarana/);
        assert.doesNotMatch(await page.locator("body").innerText(), /sidetrail|commercial trip|organiser price|book now|buy ticket|checkout|pay now|estimated.*(?:budget|expense)|budget not specified|no expected expenses|\u20b9/i);
        if (route === "/") {
          await page.getByRole("navigation", { name: "Share Yarana main navigation" }).waitFor();
          await page.getByText("Free to explore, free to host, free to join. Find your people. Share the adventure.").waitFor();
          assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://shareyarana.com");
          assert.equal(await page.locator('meta[property="og:site_name"]').getAttribute("content"), "Share Yarana");
          assert.equal(await page.locator('link[rel="icon"]').getAttribute("href"), "/share-yarana-icon.png");
          const headingSize = await page.locator("#hero-title").evaluate(el => parseFloat(getComputedStyle(el).fontSize));
          assert.ok(headingSize <= (width < 768 ? 28 : 44), "compact hero heading");
          await page.getByRole("button", { name: "Everyone", exact: true }).waitFor();
          assert.equal(await page.getByRole("button", { name: "Everyone", exact: true }).getAttribute("aria-pressed"), "true");
          if ([375, 1440].includes(width)) await page.screenshot({ path: path.join(artifacts, "homepage-" + width + ".png"), fullPage: true });
        }
        await assertTypography(route);
        results.push({ width, route, status: "pass" });
        if ([375, 1440].includes(width) && route !== "/") {
          await page.screenshot({ path: path.join(artifacts, width + route.replaceAll("/", "-").replaceAll("?", "-") + ".png"), fullPage: true });
        }
        if (width === 320 && route === "/trips/riverside-rishikesh-weekend") {
          await page.screenshot({ path: path.join(artifacts, "320-community-trip.png") });
        }
      }
      console.log("Responsive routes passed at " + width + "px");
    }

    await visit("/");
    await page.getByRole("button", { name: "Everyone", exact: true }).waitFor();
    const initialCards = await page.locator("#trips article").count();
    assert.ok(initialCards >= 7, "homepage includes all sample listings");
    for (const label of ["Solo", "Couples", "Families"]) {
      await page.getByRole("button", { name: label, exact: true }).click();
      const expected = label === "Solo" ? "Solo travellers" : label;
      await page.waitForFunction((expected) => [...document.querySelectorAll("#trips article")].every(card => [...card.querySelectorAll("p")].some(p => p.textContent.startsWith("Open to ") && p.textContent.includes(expected))), expected);
      assert.ok(await page.locator("#trips article").count() > 0);
    }
    await reload();
    assert.equal(await page.getByRole("button", { name: "Families", exact: true }).getAttribute("aria-pressed"), "true");
    await page.goBack();
    await page.waitForFunction(() => new URLSearchParams(location.search).get("traveller") === "couple");
    assert.equal(await page.getByRole("button", { name: "Couples", exact: true }).getAttribute("aria-pressed"), "true");
    await page.getByRole("button", { name: "Everyone", exact: true }).click();
    assert.equal(await page.locator("#trips article").count(), initialCards);
    const bookmark = page.locator("#trips article").first().getByRole("button", { name: /^Save / });
    await bookmark.click();
    await reload();
    assert.equal(await bookmark.getAttribute("aria-pressed"), "true");
    await bookmark.click();
    const destination = page.getByRole("region", { name: "Somewhere worth sharing" }).getByRole("link").nth(1);
    await destination.click();
    await page.waitForURL(/\/explore\?destination=/);

    await page.setViewportSize({ width: 375, height: 812 });
    await visit("/trips/new");
    await page.getByRole("button", { name: "Preview listing", exact: true }).click();
    await page.waitForFunction(() => document.activeElement?.matches('input[name="title"]'));
    await page.setViewportSize({ width: 375, height: 420 });
    await page.waitForFunction(() => {
      const field = document.activeElement;
      const dock = document.querySelector('button[form="trip-editor"]')?.parentElement?.parentElement;
      if (!dock || !field?.matches('input[name="title"]')) return false;
      const { top, bottom } = field.getBoundingClientRect();
      return top >= 0 && bottom < dock.getBoundingClientRect().top;
    });
    await page.setViewportSize({ width: 375, height: 812 });
    const legacy = {
      kind: "commercial", title: "My saved weekend", destination: "Coorg", departureCity: "Bengaluru",
      startsOn: "2027-02-20", endsOn: "2027-02-21", category: "Road Trip", description: "A slow weekend",
      groups: ["solo", "couple", "family"], capacity: "8", spots: "4", preferences: "Easy pace",
      budget: "2400", included: "Shared transport", excluded: "Snacks", costNotes: "Agree together",
      itinerary: [{ id: 1, title: "Drive", note: "Breakfast stop" }], cover: "/travel/coorg.webp",
    };
    const original = JSON.stringify(legacy);
    await page.evaluate((original) => {
      localStorage.setItem("sidetrail-trip-draft-v1", original);
      localStorage.setItem("sidetrail-saved-trip-ids-v1", '["trip-harishchandragad","trip-coorg"]');
    }, original);
    await reload();
    await page.waitForFunction(() => document.querySelector('[name="title"]')?.value === "My saved weekend");
    assert.equal(await page.locator('[name="title"]').inputValue(), legacy.title);
    assert.equal(await page.locator('[name="budget"], [name="included"], [name="excluded"], [name="costNotes"]').count(), 0);
    assert.equal(await page.locator('[name="cover"]:checked').inputValue(), legacy.cover);
    assert.equal(await page.locator('[name="groups"]:checked').count(), 3);
    assert.equal(await page.locator('[name="kind"]').count(), 0);
    assert.equal(await page.evaluate(() => localStorage.getItem("sidetrail-trip-draft-v1")), original);
    await assertFits("migrated draft");
    console.log("Legacy draft restored");

    await page.getByRole("button", { name: "Preview listing", exact: true }).click();
    await page.locator("#listing-preview[open]").waitFor();
    assert.doesNotMatch(await page.locator("#listing-preview").innerText(), /budget|expense|2400|\u20b9/i);
    await assertFits("listing preview without pricing");
    await page.locator("#listing-preview").getByRole("button", { name: "Keep editing", exact: true }).click();
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    console.log("Pricing-free preview and save passed");
    const storage = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
    assert.equal(storage["sidetrail-trip-draft-v1-original"], original);
    const saved = JSON.parse(storage["sidetrail-trip-draft-v1"]);
    assert.equal(saved.schemaVersion, 2);
    assert.equal("kind" in saved, false);
    for (const key of ["title", "destination", "departureCity", "startsOn", "endsOn", "description", "itinerary", "cover", "budget", "included", "excluded", "costNotes"]) {
      assert.deepEqual(saved[key], legacy[key], key);
    }
    await reload();
    await page.waitForFunction(() => document.querySelector('[name="title"]')?.value === "My saved weekend");
    assert.equal(await page.locator('[name="budget"]').count(), 0);
    await visit("/dashboard");
    await page.getByRole("heading", { name: "My saved weekend", exact: true }).waitFor();
    assert.doesNotMatch(await page.locator("main").innerText(), /budget|expense|2400|\u20b9/i);
    await page.getByRole("tab", { name: /Saved Trips/ }).click();
    await page.getByRole("link", { name: "Harishchandragad with fellow trekkers", exact: true }).waitFor();
    await page.getByRole("link", { name: "Harishchandragad with fellow trekkers", exact: true }).click();
    await page.waitForURL("**/trips/guided-harishchandragad-trek");
    assert.ok((await page.locator("main").innerText()).includes("Meet your host"));

    await visit("/explore");
    await page.getByRole("button", { name: "Filters", exact: true }).click();
    await page.locator("#trip-filters[open]").waitFor();
    assert.equal(await page.locator('[name="minBudget"], [name="maxBudget"]').count(), 0);
    await page.locator('[name="destination"]').selectOption("Udaipur, Rajasthan");
    await page.getByRole("button", { name: "Apply filters", exact: true }).click();
    console.log("Filtered URL: " + page.url());
    await page.getByRole("button", { name: "Lakeside walks with new friends", exact: true }).waitFor();
    assert.equal(await page.locator("main article").count(), 1);
    await assertFits("filtered results");
    await page.getByRole("button", { name: "Lakeside walks with new friends", exact: true }).click();
    await page.locator("dialog[open]").getByRole("link", { name: "View trip details", exact: true }).click();
    await page.waitForURL("**/trips/lake-pichola-weekend");
    await settleBeforeNavigation();
    await page.goBack();
    await page.waitForURL(/\/explore\?destination=Udaipur/);
    await page.getByRole("heading", { name: "1 trip", exact: true }).waitFor();
    assert.equal(await page.locator("dialog[open]").count(), 0);
    await page.goForward();
    await page.waitForURL("**/trips/lake-pichola-weekend");
    await switchDemo("traveller-nairs");
    await page.getByRole("button", { name: "Request to Join", exact: true }).filter({ visible: true }).click();
    await page.locator('#join-trip [name="participants"]').fill("2");
    await page.getByRole("button", { name: "Send request", exact: true }).click();
    await page.getByRole("heading", { name: "Request saved" }).waitFor();
    assert.ok((await page.locator("#join-trip").innerText()).includes("Your request is pending"));
    await assertFits("join preview");
    await page.getByRole("button", { name: "Done", exact: true }).click();

    await switchDemo("traveller-meera");
    await visit("/dashboard/requests");
    await page.getByRole("button", { name: "Accept request from Kavya & Dev", exact: true }).click();
    await page.locator("dialog[open]").waitFor();
    await page.locator("dialog[open]").getByRole("button", { name: "Confirm acceptance", exact: true }).click();
    await assertFits("host decision");
    await page.getByText("Accepted the request.", { exact: true }).waitFor();
    assert.deepEqual(await page.locator('dl[aria-label="Trip capacity"] dd').allTextContents(), ["8", "6", "2", "1"]);
    await visit("/trips/sinhagad-sunrise-hike/group?tab=members");
    await page.getByRole("link", { name: "Ananya Rao", exact: true }).waitFor();
    await page.getByRole("link", { name: "Kavya & Dev", exact: true }).waitFor();
    assert.match(await page.locator("main").innerText(), /3 accepted participants/);

    // Start a new trip using the saved draft, without replacing it.
    await visit("/trips/new");
    await page.waitForFunction(() => document.querySelector('[name="title"]')?.value === "My saved weekend");
    const title = "Coorg together demo";
    await page.locator('[name="title"]').fill(title);
    await page.locator('[name="departureCity"]').fill("Bengaluru".repeat(8));
    await page.getByRole("textbox", { name: /Short trip description/ }).fill("A".repeat(600));
    const future = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    await page.locator('[name="startsOn"]').fill(future);
    await page.locator('[name="endsOn"]').fill(future);
    await page.locator('[name="capacity"]').fill("4");
    await page.locator('[name="spots"]').fill("3");
    await page.getByRole("button", { name: "Preview listing", exact: true }).click();
    await page.getByRole("button", { name: "Publish Trip", exact: true }).click();
    await page.waitForURL(/\/trips\/demo-[0-9a-f-]+$/);
    const tripPath = new URL(page.url()).pathname;
    const tripId = tripPath.split("/").at(-1);
    const hosting = "/dashboard?tab=hosting";
    const workspace = "/dashboard/requests?trip=" + tripId;
    const requests = "/dashboard?tab=join-requests";
    const group = tripPath + "/group";
    const demoKey = "sidetrail-travel-demo-v1";
    await page.getByRole("heading", { name: title, exact: true }).waitFor();
    assert.doesNotMatch(await page.locator("main").innerText(), /budget|expense|2400|\u20b9/i);
    assert.equal(await page.evaluate(({ demoKey, tripId }) => JSON.parse(localStorage.getItem(demoKey)).trips.find(trip => trip.id === tripId).draft.budget, { demoKey, tripId }), legacy.budget, "publishing preserves retired draft data without displaying it");
    assert.equal(await page.getByRole("button", { name: "Request to Join", exact: true }).count(), 0, "host cannot request own trip");

    await switchDemo("traveller-nairs");
    await visit("/");
    const localCard = page.locator("#trips article").filter({ has: page.getByRole("heading", { name: title, exact: true }) });
    await localCard.getByRole("link", { name: "Request to Join", exact: true }).waitFor();
    await localCard.getByRole("link", { name: "Request to Join", exact: true }).click();
    await page.waitForURL("**" + tripPath);
    await page.goBack();
    await localCard.getByRole("heading", { name: title, exact: true }).waitFor();
    await assertFits("homepage published trip with long text");
    await visit("/trips/nandi-hills-morning-hike");
    await page.getByRole("region", { name: "Trip availability and join" }).getByText(/Your traveller isn’t eligible/).waitFor();
    assert.equal(await page.getByRole("button", { name: "Request to Join", exact: true }).count(), 0, "ineligible family cannot join");
    await visit(group);
    await page.getByText(/Switch to the host or an accepted traveller/).waitFor();
    await visit("/explore?q=Coorg%20together%20demo");
    await page.getByRole("button", { name: title, exact: true }).click();
    await page.getByRole("link", { name: "View trip details", exact: true }).click();
    await page.waitForURL("**" + tripPath);
    await requestToJoin();
    await page.locator("li").filter({ has: page.getByRole("link", { name: title, exact: true }) }).getByText("Pending", { exact: true }).waitFor();
    await visit(tripPath);
    await page.getByRole("link", { name: "Request: Pending", exact: true }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Request to Join", exact: true }).count(), 0, "duplicate request blocked");

    await switchDemo("traveller-kavya-dev");
    await requestToJoin();
    await page.locator("li").filter({ has: page.getByRole("link", { name: title, exact: true }) }).getByText("Pending", { exact: true }).waitFor();
    await switchDemo("traveller-meera");
    await visit(workspace);
    const acceptCouple = page.getByRole("button", { name: "Accept request from Kavya & Dev", exact: true });
    const acceptFamily = page.getByRole("button", { name: "Accept request from The Nair family", exact: true });
    const competingTab = await context.newPage();
    await competingTab.goto(base + workspace, { waitUntil: "domcontentloaded" });
    await competingTab.getByRole("button", { name: "Accept request from The Nair family", exact: true }).click();
    await acceptCouple.click();
    await page.getByRole("button", { name: "Confirm acceptance", exact: true }).click();
    await page.getByText("Accepted the request.", { exact: true }).waitFor();
    assert.equal(await acceptFamily.isDisabled(), true, "pending family party cannot overbook");
    await competingTab.getByRole("button", { name: "Confirm acceptance", exact: true }).click();
    await competingTab.getByRole("status").getByText(/no longer fits/).waitFor();
    await competingTab.close();
    assert.match((await page.locator('dl[aria-label="Trip capacity"] dd').allTextContents()).join(","), /^4,3,1,1$/);
    await page.getByRole("button", { name: "Decline request from The Nair family", exact: true }).click();
    await page.getByRole("button", { name: "Confirm decline", exact: true }).click();
    await page.getByText("Declined the request.", { exact: true }).waitFor();

    await visit(hosting);
    const row = page.locator("li").filter({ has: page.getByRole("link", { name: title, exact: true }) });
    await row.getByRole("link", { name: "Edit trip" }).click();
    await page.locator('[name="spots"]').fill("1");
    await page.getByRole("button", { name: "Preview listing", exact: true }).click();
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await page.getByText("Keep enough offered spots and the traveller categories for all accepted parties.", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Keep editing", exact: true }).click();
    const revised = title + " revised";
    await page.locator('[name="spots"]').fill("3");
    await page.locator('[name="title"]').fill(revised);
    await page.getByRole("button", { name: "Preview listing", exact: true }).click();
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await page.waitForURL("**" + tripPath);
    await page.getByRole("heading", { name: revised, exact: true }).waitFor();
    assert.equal(await page.evaluate(({ demoKey, tripId }) => JSON.parse(localStorage.getItem(demoKey)).trips.find(trip => trip.id === tripId).draft.budget, { demoKey, tripId }), legacy.budget, "editing preserves retired draft data");
    await page.getByRole("button", { name: "View local trip link", exact: true }).click();
    await page.getByText("This link opens the trip in this browser only.", { exact: true }).waitFor();
    await page.keyboard.press("Escape");

    await visit("/travellers/meera-wanders");
    await page.getByRole("button", { name: revised, exact: true }).waitFor();

    await switchDemo("traveller-nairs");
    await visit(requests);
    await page.locator("li").filter({ has: page.getByRole("link", { name: revised, exact: true }) }).getByText("Declined", { exact: true }).waitFor();
    await switchDemo("traveller-kavya-dev");
    await reload();
    const sentRow = page.locator("li").filter({ has: page.getByRole("link", { name: revised, exact: true }) });
    await sentRow.getByText("Accepted", { exact: true }).waitFor();
    await sentRow.getByRole("link", { name: "Trip Group Space", exact: true }).click();
    await page.waitForURL("**" + group);
    await page.getByRole("tab", { name: "Members" }).click();
    await page.getByRole("link", { name: "Kavya & Dev", exact: true }).waitFor();
    assert.equal(await page.getByRole("link", { name: "The Nair family", exact: true }).count(), 0);
    assert.match(await page.locator("main").innerText(), /2 accepted participants/);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [tripPath, group + "?tab=members", requests]) {
        await visitAtWidth(route, width);
        await assertFits("connected " + route + " at " + width);
        await assertTypography(route);
        results.push({ width, route, status: "pass" });
      }
    }
    await switchDemo("traveller-meera");
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      const route = "/trips/new?edit=" + tripId;
      await visitAtWidth(route, width);
      await page.waitForFunction((title) => document.querySelector('[name="title"]')?.value === title, revised);
      await assertFits("edit demo trip at " + width);
      results.push({ width, route, status: "pass" });
    }
    await switchDemo("traveller-kavya-dev");
    await page.setViewportSize({ width: 375, height: 812 });

    // An unrelated tab sees release of accepted places without refreshing.
    const otherTab = await page.context().newPage();
    await otherTab.goto(base + tripPath, { waitUntil: "domcontentloaded" });
    await otherTab.getByText("1 spot available", { exact: true }).first().waitFor();
    const homeTab = await context.newPage();
    await homeTab.goto(base + "/", { waitUntil: "domcontentloaded" });
    const homeCard = homeTab.locator("#trips article").filter({ has: homeTab.getByRole("heading", { name: revised, exact: true }) });
    await homeCard.getByText("1 spot left", { exact: true }).waitFor();
    await homeCard.getByRole("link", { name: "Accepted request", exact: true }).waitFor();
    await visit(requests);
    await sentRow.getByRole("button", { name: "Cancel request", exact: true }).click();
    await page.getByRole("button", { name: "Confirm cancellation", exact: true }).click();
    await sentRow.getByText("Cancelled", { exact: true }).waitFor();
    await otherTab.getByText("3 spots available", { exact: true }).first().waitFor();
    await homeCard.getByText("3 spots left", { exact: true }).waitFor();
    await homeCard.getByRole("link", { name: "Request to Join", exact: true }).waitFor();
    await otherTab.close();
    await visit(group);
    await page.getByText(/Switch to the host or an accepted traveller/).waitFor();

    await switchDemo("traveller-meera");
    await visit(hosting);
    const revisedRow = page.locator("li").filter({ has: page.getByRole("link", { name: revised, exact: true }) });
    await revisedRow.getByRole("button", { name: "Cancel trip", exact: true }).click();
    await page.getByRole("button", { name: "Confirm cancellation", exact: true }).click();
    await revisedRow.getByText(/Cancelled trip/).waitFor();
    await homeCard.waitFor({ state: "detached" });
    await homeTab.close();
    await visit("/explore?q=Coorg%20together%20demo");
    await page.getByText("No trips match that search", { exact: true }).waitFor();
    await visit(tripPath);
    await page.getByText("Trip cancelled", { exact: true }).first().waitFor();

    // Corrupt only the demo key and verify reset is explicit and drafts/bookmarks survive.
    await page.evaluate((key) => localStorage.setItem(key, "{broken"), demoKey);
    await reload();
    await page.getByRole("button", { name: /^Switch Traveller/ }).click();
    await page.getByRole("alert").getByText(/Demo data could not be read/).waitFor();
    await page.getByRole("button", { name: "Reset Demo Data", exact: true }).click();
    await page.waitForFunction(() => document.activeElement?.textContent === "Keep demo data");
    await page.getByRole("button", { name: "Keep demo data", exact: true }).click();
    await page.waitForFunction(() => document.activeElement?.textContent === "Reset Demo Data");
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), demoKey), "{broken");
    await page.getByRole("button", { name: "Reset Demo Data", exact: true }).click();
    await page.getByRole("button", { name: "Confirm reset", exact: true }).click();
    await page.getByText("Demo data reset.", { exact: true }).waitFor();
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), demoKey), null);
    const afterReset = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
    for (const protectedKey of ["sidetrail-trip-draft-v1", "sidetrail-trip-draft-v1-original", "sidetrail-saved-trip-ids-v1"]) {
      assert.equal(afterReset[protectedKey], storage[protectedKey]);
    }

    await visit("/trips/new");
    await page.getByRole("button", { name: "Discard draft", exact: true }).click();
    const draftTab = await context.newPage();
    await draftTab.goto(base + "/trips/new");
    await draftTab.waitForFunction(() => document.querySelector('[name="title"]')?.value === "My saved weekend");
    await draftTab.locator('[name="title"]').fill("Newer draft in another tab");
    await draftTab.getByRole("button", { name: "Save draft", exact: true }).click();
    for (const tab of [draftTab, page]) {
      await tab.waitForFunction(() => JSON.parse(localStorage.getItem("sidetrail-trip-draft-v1"))?.title === "Newer draft in another tab");
    }
    await page.locator("#discard-draft").getByRole("button", { name: "Discard draft", exact: true }).click();
    await page.locator("#discard-draft").getByRole("alert").getByText(/changed in another tab/).waitFor();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("sidetrail-trip-draft-v1")).title), "Newer draft in another tab");

    for (const [route, heading] of [["/bad-route", "Page not found"], ["/trips/missing-trip", "Trip not found"],
      ["/trips/missing-trip/group", "Trip group not found"], ["/travellers/missing-handle", "Traveller not found"],
      ["/community/missing-crew", "Community not found"]]) {
      const response = await draftTab.goto(base + route);
      assert.equal(response.status(), 404, route);
      await draftTab.getByRole("heading", { name: heading, exact: true }).waitFor();
    }
    const localGroupResponse = await draftTab.goto(base + group + "?audit=missing");
    assert.equal(localGroupResponse.status(), 200);
    await draftTab.getByText("This group is unavailable in this browser.", { exact: true }).waitFor();
    await draftTab.close();
    const unsupported = await context.newPage();
    await unsupported.addInitScript(() => Object.defineProperty(navigator, "locks", { value: undefined }));
    await unsupported.goto(base + "/explore");
    await unsupported.getByRole("button", { name: /^Switch Traveller/ }).click();
    await unsupported.getByLabel("Choose traveller").selectOption("traveller-kavya-dev");
    await unsupported.getByText("Open Share Yarana over HTTPS or localhost to save demo changes.", { exact: true }).waitFor();
    await unsupported.close();
    console.log("Connected demo journey passed, including editing, eligibility, overbooking, cross-tab cancellation, reset and protected data.");
    assert.deepEqual(errors, [], "Browser console and runtime errors");
    console.log("Browser flows passed: migrated drafts, pricing-free previews, validation, saved trips, filters, join preview and host acceptance.");
  } finally {
    await page.screenshot({ path: path.join(artifacts, "last-flow.png"), fullPage: true });
    fs.writeFileSync(path.join(artifacts, "results.json"), JSON.stringify({ results, errors }, null, 2));
    console.log("Artifacts: " + artifacts);
    await browser.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
