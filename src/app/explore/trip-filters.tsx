"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ChangeEvent, type ComponentProps, type FormEvent, type Ref } from "react";
import { travellerGroupLabels } from "@/domain/travel";
import { Dialog } from "../_shared/dialog";
import site from "../_shared/site.module.css";
import { categories, emptyFilters, readTripFilters, type TripFilters } from "./browse-trips";
import styles from "./explore.module.css";

export function TripSelect({ children, ...props }: ComponentProps<"select">) {
  return (
    <span className={styles.select}>
      <select {...props}>{children}</select>
      <ChevronDown size={16} aria-hidden="true" />
    </span>
  );
}

interface FilterFormProps {
  initial: TripFilters;
  cities: readonly string[];
  destinations: readonly string[];
  maxSpots: number;
  onApply: (filters: TripFilters) => void;
}

function FilterForm({ initial, cities, destinations, maxSpots, onApply }: FilterFormProps) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");

  function changeField(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.currentTarget;
    setDraft((previous) => ({ ...previous, [name]: value }));
    setError("");
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const filters = readTripFilters(new FormData(event.currentTarget));
    if (filters.minBudget && filters.maxBudget && Number(filters.minBudget) > Number(filters.maxBudget)) {
      setError("Enter a maximum budget that’s at least the minimum.");
      return;
    }
    if (filters.start && filters.end && filters.start > filters.end) {
      setError("Choose an end date on or after the start date.");
      return;
    }
    onApply(filters);
  }

  return (
    <form className={styles.filterForm} onSubmit={applyFilters}>
      <div className={styles.filterFields}>
        <label>
          Trip category
          <TripSelect name="category" value={draft.category} onChange={changeField}>
            {categories.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </TripSelect>
        </label>
        <label>
          Starting city
          <TripSelect name="city" value={draft.city} onChange={changeField}>
            <option value="">Any city</option>
            {cities.map((city) => <option key={city}>{city}</option>)}
          </TripSelect>
        </label>
        <label>
          Destination
          <TripSelect name="destination" value={draft.destination} onChange={changeField}>
            <option value="">Any destination</option>
            {destinations.map((destination) => <option key={destination}>{destination}</option>)}
          </TripSelect>
        </label>
        <label>
          Traveller compatibility
          <TripSelect name="group" value={draft.group} onChange={changeField}>
            <option value="">Any travel group</option>
            {Object.entries(travellerGroupLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </TripSelect>
        </label>
        <fieldset>
          <legend>Budget per person (₹)</legend>
          <div className={styles.fieldPair}>
            <label>
              Minimum
              <input name="minBudget" type="number" inputMode="numeric" min="0" max="9999999" placeholder="Any" value={draft.minBudget} onChange={changeField} />
            </label>
            <label>
              Maximum
              <input name="maxBudget" type="number" inputMode="numeric" min="0" max="9999999" placeholder="Any" value={draft.maxBudget} onChange={changeField} />
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Trip dates</legend>
          <div className={styles.fieldPair + " " + styles.datePair}>
            <label>
              Earliest start
              <input name="start" type="date" value={draft.start} onChange={changeField} />
            </label>
            <label>
              Latest end
              <input name="end" type="date" value={draft.end} onChange={changeField} />
            </label>
          </div>
        </fieldset>
        <label>
          Available spots
          <TripSelect name="spots" value={draft.spots} onChange={changeField}>
            <option value="">Any number</option>
            {Array.from({ length: maxSpots }, (_, index) => index + 1).map((count) => (
              <option key={count} value={count}>{count} or more</option>
            ))}
          </TripSelect>
        </label>
      </div>
      <div className={styles.filterFooter}>
        {error && <p role="alert">{error}</p>}
        <div>
          <button type="button" className={site.buttonOutline} onClick={() => { setDraft(emptyFilters); setError(""); }}>Clear all</button>
          <button type="submit" className={site.buttonPrimary}>Apply filters</button>
        </div>
      </div>
    </form>
  );
}

export function TripFilterDialog({ dialogRef, version, ...form }: FilterFormProps & {
  dialogRef: Ref<HTMLDialogElement>;
  version: number;
}) {
  return (
    <Dialog id="trip-filters" dialogRef={dialogRef} title="Filter trips" className={styles.filterDialog}>
      <FilterForm key={version} {...form} />
    </Dialog>
  );
}
