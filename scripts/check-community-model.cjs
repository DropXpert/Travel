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

const { formatTripBudget } = load("src/domain/travel.ts");
const { decodeDraft, emptyTripDraft, validateTripDraft, persistTripDraft, editTripDraft, discardTripDraft } = load("src/app/_shared/trip-draft.ts");
const { tripListings } = load("src/data/trip-listings.ts");
const { browseTrips, emptyFilters } = load("src/app/explore/browse-trips.ts");
const key = "sidetrail-trip-draft-v1";
const bookmarkKey = "sidetrail-saved-trip-ids-v1";
const validDraft = {
  ...emptyTripDraft, title: "Weekend together", destination: "Coorg", departureCity: "Bengaluru",
  startsOn: "2027-02-20", endsOn: "2027-02-21", groups: ["solo", "couple", "family"],
  capacity: "8", spots: "4", description: "A slow weekend", preferences: "Easy pace",
  cover: "/travel/coorg.webp", itinerary: [{ id: 1, title: "Drive", note: "Meet for breakfast" }],
  included: "Shared transport", excluded: "Personal snacks", costNotes: "Agree together",
};
for (const budget of ["", "0", "850.50"]) {
  assert.deepEqual(validateTripDraft({ ...validDraft, budget }, "2026-11-21"), {});
}
for (const budget of ["-1", "Infinity", "NaN", "abc"]) {
  assert.ok(validateTripDraft({ ...validDraft, budget }, "2026-11-21").budget);
}
assert.equal(formatTripBudget(), "Budget not specified");
assert.equal(formatTripBudget(0), "No expected expenses");
assert.match(formatTripBudget(850), /850/);

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

const state = { query: "", sort: "budget", filters: emptyFilters };
const sorted = browseTrips(tripListings, state);
assert.equal(sorted[0].trip.estimatedSharePerPersonInr, 0);
assert.equal(sorted.at(-1).trip.estimatedSharePerPersonInr, undefined);
assert.equal(sorted.length, tripListings.length);
const noExpenses = browseTrips(tripListings, { ...state, filters: { ...emptyFilters, maxBudget: "0" } });
assert.equal(noExpenses.length, 1);
assert.equal(noExpenses[0].trip.id, "trip-udaipur");
const range = browseTrips(tripListings, { ...state, filters: { ...emptyFilters, minBudget: "500", maxBudget: "1000" } });
assert.ok(range.length > 0);
assert.ok(range.every(({ trip }) => trip.estimatedSharePerPersonInr >= 500 && trip.estimatedSharePerPersonInr <= 1000));
assert.equal(browseTrips(tripListings, { ...state, query: "Harishchandragad" })[0].trip.slug, "guided-harishchandragad-trek");
assert.ok(tripListings.every(({ trip }) => !("kind" in trip) && !("pricePerPersonInr" in trip) && !("organizerName" in trip)));
assert.ok(tripListings.every(({ trip, host }) => trip.hostId === host.id && trip.postedOn <= trip.startsOn
  && trip.startsOn <= trip.endsOn && trip.confirmedTravellers >= 0 && trip.confirmedTravellers <= trip.capacity));
console.log("Community model checks passed: optional budgets, filters, legacy migration, backup failures, discard conflicts and bookmark preservation.");
