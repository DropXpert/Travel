/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS test runner. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

// Run focused TypeScript checks with the project's compiler, without a test dependency.
const modules = new Map();
function load(file) {
  const filename = path.resolve(__dirname, "..", file);
  if (modules.has(filename)) return modules.get(filename).exports;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const nativeRequire = mod.require.bind(mod);
  mod.require = (id) => id.startsWith("@/")
    ? load("src/" + id.slice(2) + ".ts")
    : id.startsWith(".") ? load(path.resolve(path.dirname(filename), id + ".ts")) : nativeRequire(id);
  modules.set(filename, mod);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
  return mod.exports;
}

const { decodeDraft, emptyTripDraft, validateTripDraft, persistTripDraft, editTripDraft, discardTripDraft } = load("src/app/_shared/trip-draft.ts");
const { tripListings } = load("src/data/trip-listings.ts");
const { browseTrips, emptyFilters, readExploreState, exploreQuery } = load("src/app/explore/browse-trips.ts");
const key = "sidetrail-trip-draft-v1";
const bookmarkKey = "sidetrail-saved-trip-ids-v1";
const validDraft = {
  ...emptyTripDraft, title: "Weekend together", destination: "Coorg", departureCity: "Bengaluru",
  startsOn: "2027-02-20", endsOn: "2027-02-21", groups: ["solo", "couple", "family"],
  capacity: "8", spots: "4", description: "A slow weekend", preferences: "Easy pace",
  cover: "/travel/coorg.webp", itinerary: [{ id: 1, title: "Drive", note: "Meet for breakfast" }],
  included: "Shared transport", excluded: "Personal snacks", costNotes: "Agree together",
};
// Retired amounts must not block editing or publishing an otherwise valid legacy draft.
for (const budget of ["", "0", "850.50", "-1", "Infinity", "NaN", "abc"]) {
  assert.deepEqual(validateTripDraft({ ...validDraft, budget }, "2026-11-21"), {});
}

for (const kind of ["personal", "commercial"]) {
  const legacy = JSON.stringify({ ...validDraft, budget: "2400", kind, organizerName: "Fictional old host" });
  assert.deepEqual(decodeDraft(legacy), { ...validDraft, budget: "2400" });
}
assert.equal(decodeDraft("{broken"), null);
assert.equal(decodeDraft("null"), null);
assert.equal(decodeDraft("[]"), null);

const storage = new Map();
let failKey;
const events = new EventTarget();
global.window = {
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => {
      if (key === failKey) throw new Error("Storage unavailable");
      storage.set(key, value);
    },
    removeItem: (key) => storage.delete(key),
  },
  addEventListener: events.addEventListener.bind(events),
  removeEventListener: events.removeEventListener.bind(events),
  dispatchEvent: events.dispatchEvent.bind(events),
};
const original = JSON.stringify({ ...validDraft, kind: "commercial", budget: "2400", extraLegacyField: "preserved in backup" });
storage.set(key, original);
storage.set(bookmarkKey, '["trip-harishchandragad","trip-coorg"]');
const migrated = decodeDraft(original);
assert.equal(storage.get(key), original, "Reading must not write to storage");
assert.ok(persistTripDraft(migrated));
assert.equal(storage.get(key + "-original"), original);
assert.equal(JSON.parse(storage.get(key)).schemaVersion, 2);
assert.equal("kind" in JSON.parse(storage.get(key)), false);
assert.deepEqual(decodeDraft(storage.get(key)), migrated);
assert.ok(persistTripDraft({ ...migrated, title: "Edited plan" }));
assert.equal(storage.get(key + "-original"), original, "Never replace the backup");
assert.equal(storage.get(bookmarkKey), '["trip-harishchandragad","trip-coorg"]');

storage.delete(key + "-original");
storage.set(key, original);
failKey = key + "-original";
assert.equal(persistTripDraft(migrated), false);
assert.equal(storage.get(key), original, "Failed backup must leave the original intact");
failKey = key;
assert.equal(persistTripDraft(migrated), false);
assert.equal(storage.get(key), original, "Failed save must leave the original intact");
failKey = undefined;
storage.delete(key + "-original");
storage.set(key, "{broken");
assert.ok(persistTripDraft(validDraft));
assert.equal(storage.get(key + "-original"), "{broken");
const savedText = storage.get(key);
editTripDraft(validDraft);
assert.equal(discardTripDraft({ savedText: "stale", working: validDraft }), "changed");
assert.equal(discardTripDraft({ savedText, working: validDraft }), "discarded");
assert.ok(storage.has(bookmarkKey));

const state = { query: "", sort: "upcoming", filters: emptyFilters };
const retiredFilters = readExploreState(new URLSearchParams("sort=budget&minBudget=500&maxBudget=1000&group=family"));
assert.equal(retiredFilters.sort, "upcoming");
assert.equal(exploreQuery(retiredFilters), "group=family");
assert.deepEqual(browseTrips(tripListings, retiredFilters), browseTrips(tripListings, { ...state, filters: { ...emptyFilters, group: "family" } }));
assert.equal(browseTrips(tripListings, state).length, tripListings.length);
assert.ok(tripListings.every(listing => !("cost" in listing) && !("estimatedSharePerPersonInr" in listing.trip)));
assert.equal(browseTrips(tripListings, { ...state, query: "Harishchandragad" })[0].trip.slug, "guided-harishchandragad-trek");
assert.ok(tripListings.every(({ trip }) => !("kind" in trip) && !("pricePerPersonInr" in trip) && !("organizerName" in trip)));
assert.ok(tripListings.every(({ trip, host }) => trip.hostId === host.id && trip.postedOn <= trip.startsOn
  && trip.startsOn <= trip.endsOn && trip.confirmedTravellers >= 0 && trip.confirmedTravellers <= trip.capacity));
console.log("Community model checks passed: pricing-free listings, retired filters, legacy migration, backup failures, discard conflicts and bookmark preservation.");

async function socialChecks() {
  const { decodeSocial, updateSocial } = load("src/app/_shared/social-state.ts");
  const { updateDemo, demoStorageKey } = load("src/app/_shared/demo-travel.ts");
  const { socialStorageKey } = load("src/app/_shared/local-storage.ts");
  global.localStorage = window.localStorage;
  Object.defineProperty(global, "navigator", { configurable: true, value: { locks: { request: async (_key, callback) => callback() } } });
  const author = "traveller-meera";
  const photo = { kind: "photo", image: "data:image/jpeg;base64,AA==", caption: "Trail together" };
  const base = { id: "test", author, createdAt: "2026-11-28T10:00:00Z" };
  for (const raw of ["{broken", JSON.stringify({ version: 2, entries: [] }), JSON.stringify({ version: 1, entries: [{ ...base, ...photo, image: "javascript:alert(1)" }] })]) assert.equal(decodeSocial(raw), null);
  for (const coordinates of [{ latitude: 91, longitude: 0 }, { latitude: 1 }, { latitude: 0, longitude: -181 }]) {
    assert.equal(decodeSocial(JSON.stringify({ version: 1, entries: [{ ...base, kind: "location", tripId: "trip-sinhagad", name: "Meet here", ...coordinates }] })), null);
  }
  assert.notEqual(await updateSocial({ add: photo }, "traveller-nairs"), "", "stale account cannot post");
  assert.equal(await updateSocial({ add: photo }, author), "");
  const originalPhoto = decodeSocial(storage.get(socialStorageKey))[0];
  assert.ok((await updateDemo({ type: "switch", account: "traveller-kavya-dev" })).ok);
  assert.notEqual(await updateSocial({ remove: originalPhoto.id }, "traveller-kavya-dev"), "", "other account cannot delete a post");
  const review = { kind: "review", tripId: "trip-sinhagad", rating: 4, text: "Helpful planning" };
  assert.notEqual(await updateSocial({ add: review }, "traveller-kavya-dev"), "", "pending travellers cannot review");
  assert.notEqual(await updateSocial({ add: { kind: "location", tripId: "trip-sinhagad", name: "Meet here" } }, "traveller-kavya-dev"), "", "pending travellers cannot share pins");
  await updateDemo({ type: "switch", account: author });
  assert.ok((await updateDemo({ type: "decision", id: "request-sinhagad", status: "accepted" }, author)).ok);
  await updateDemo({ type: "switch", account: "traveller-kavya-dev" });
  assert.equal(await updateSocial({ add: review }, "traveller-kavya-dev"), "");
  assert.equal(await updateSocial({ add: { ...review, rating: 5 } }, "traveller-kavya-dev"), "");
  assert.equal(decodeSocial(storage.get(socialStorageKey)).filter(e => e.kind === "review").length, 1, "editing replaces own review");
  await updateDemo({ type: "switch", account: author });
  for (let i = 1; i < 6; i++) assert.equal(await updateSocial({ add: photo }, author), "");
  assert.match(await updateSocial({ add: photo }, author), /full/);
  const beforeFailure = storage.get(socialStorageKey);
  failKey = socialStorageKey;
  assert.notEqual(await updateSocial({ remove: originalPhoto.id }, author), "");
  assert.equal(storage.get(socialStorageKey), beforeFailure, "failed writes preserve posts");
  failKey = undefined;
  storage.set(socialStorageKey, "{broken");
  assert.notEqual(await updateSocial({ add: photo }, author), "");
  assert.equal(storage.get(socialStorageKey), "{broken", "corruption is not silently overwritten");
  const draftBefore = storage.get(key), bookmarksBefore = storage.get(bookmarkKey);
  assert.ok((await updateDemo({ type: "reset" })).ok);
  assert.equal(storage.has(socialStorageKey), false);
  assert.equal(storage.has(demoStorageKey), false);
  assert.equal(storage.get(key), draftBefore);
  assert.equal(storage.get(bookmarkKey), bookmarksBefore);
  console.log("Social model checks passed: validation, permissions, capacity, review edits, storage failures, corruption and reset protection.");
}
socialChecks().catch(error => { console.error(error); process.exitCode = 1; });
