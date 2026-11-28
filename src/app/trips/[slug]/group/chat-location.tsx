"use client";

import { MapPin } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { demoProfileFor, useDemoTravel } from "../../../_shared/demo-travel";
import { Dialog } from "../../../_shared/dialog";
import { updateSocial, useSocialEntries } from "../../../_shared/social-state";
import site from "../../../_shared/site.module.css";
import styles from "../../../_shared/social.module.css";

export function ChatLocation({ tripId }: { tripId: string }) {
  const { state } = useDemoTravel();
  return <LocationSharing key={tripId + state.account} tripId={tripId} account={state.account} />;
}

function LocationSharing({ tripId, account }: { tripId: string; account: string }) {
  const { entries, damaged } = useSocialEntries();
  const locations = entries.filter(e => e.kind === "location").filter(e => e.tripId === tripId);
  const dialog = useRef<HTMLDialogElement>(null);
  const attempt = useRef(0);
  const [name, setName] = useState("");
  const [point, setPoint] = useState<{ latitude: number; longitude: number }>();
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => () => { attempt.current++; }, []);
  function clear() {
    attempt.current++;
    setName(""); setPoint(undefined); setLocating(false); setError("");
  }
  function locate() {
    if (!window.isSecureContext || !navigator.geolocation) { setError("Location is unavailable here. Enter a meeting point instead, or open over HTTPS."); return; }
    const current = ++attempt.current;
    setLocating(true); setError(""); setPoint(undefined);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (current !== attempt.current) return;
      setPoint({ latitude: Number(coords.latitude.toFixed(5)), longitude: Number(coords.longitude.toFixed(5)) });
      setName("My current location"); setLocating(false);
    }, failure => {
      if (current !== attempt.current) return;
      setLocating(false);
      setError(failure.code === 1 ? "Location permission was denied. You can enter a meeting point instead." : "Couldn't find your location. Try again or enter a meeting point.");
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
  }
  async function share(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || saving || locating) return;
    setSaving(true);
    const result = await updateSocial({ add: { kind: "location", tripId, name: name.trim(), ...point } }, account);
    setSaving(false);
    if (result) { setError(result); return; }
    dialog.current?.close();
    setNotice("Location added to this browser's chat. No live tracking or message was sent.");
  }
  return <>
    <ul aria-label="Shared locations">{locations.map(location => {
      const query = location.latitude === undefined ? location.name : location.latitude + "," + location.longitude;
      return <li key={location.id} className={styles.location}>
        <div className={styles.author}><strong>{demoProfileFor(location.author).displayName}</strong><span>Location · Local only</span></div>
        <p>{location.name}</p>
        <a href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query)} target="_blank" rel="noreferrer">Open in Google Maps (new tab)</a>
        {location.author === account && <button className={site.buttonText} onClick={async () => setNotice(await updateSocial({ remove: location.id }, account) || "Location removed.")}>Remove location</button>}
      </li>;
    })}</ul>
    <button className={site.buttonOutline} disabled={damaged} onClick={() => { clear(); dialog.current?.showModal(); }}><MapPin size={18} aria-hidden="true" />Share location</button>
    {damaged && <p role="alert">Shared locations could not be read. Use Reset Demo Data to start again.</p>}
    <p role="status" className={styles.status}>{notice}</p>
    <Dialog id="chat-location" title="Share a meeting point" dialogRef={dialog} onClose={clear}>
      <p>Add a place or use your current location. Preview it before saving to this browser&apos;s group chat. This is a one-time location, never live tracking.</p>
      <form className={styles.form} onSubmit={share}>
        <button type="button" className={site.buttonOutline} disabled={locating || saving} onClick={locate}>{locating ? "Finding location..." : "Use current location"}</button>
        <label>Place or meeting point<input required maxLength={120} value={name} onChange={e => { attempt.current++; setLocating(false); setName(e.target.value); setPoint(undefined); }} placeholder="e.g. Sinhagad base village car park" /></label>
        {point && <p className={styles.note}>Coordinates: {point.latitude}, {point.longitude}. Adding this pin saves your location on this device until you remove it or reset demo data.</p>}
        <p className={styles.note}>Opening a saved pin in Google Maps shares that place with Google. No map is loaded automatically.</p>
        {error && <p role="alert">{error}</p>}
        <div className={styles.actions}><button className={site.buttonPrimary} disabled={!name.trim() || locating || saving}>{saving ? "Adding..." : "Add location to chat"}</button><button type="button" className={site.buttonOutline} onClick={() => dialog.current?.close()}>Cancel</button></div>
      </form>
    </Dialog>
  </>;
}
