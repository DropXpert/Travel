"use client";

import { Camera } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { demoProfileFor, useDemoTravel } from "../_shared/demo-travel";
import { Dialog } from "../_shared/dialog";
import { updateSocial, useSocialEntries } from "../_shared/social-state";
import site from "../_shared/site.module.css";
import styles from "../_shared/social.module.css";

export async function preparePhoto(file: File) {
  // Some browsers omit the MIME type; decoding below still validates the actual image.
  const allowed = ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    || file.type === "" && /\.(jpe?g|png|webp)$/i.test(file.name);
  if (!allowed || file.size > 10 * 1024 * 1024) {
    throw new Error("Choose a JPG, PNG or WebP photo under 10 MB.");
  }
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40000000) throw new Error("Choose a photo smaller than 40 megapixels.");
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Photo preview isn't supported in this browser.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    // Re-encoding strips embedded metadata, including GPS; original files are never stored.
    const image = canvas.toDataURL("image/jpeg", .75);
    if (image.length > 350000) throw new Error("This photo is too detailed for local storage. Try a smaller photo.");
    return image;
  } finally { bitmap.close(); }
}

export function PhotoFeed() {
  const { state, ready } = useDemoTravel();
  return <PhotoFeedForTraveller key={state.account} account={state.account} ready={ready} />;
}

function PhotoFeedForTraveller({ account, ready }: { account: string; ready: boolean }) {
  const { entries, damaged } = useSocialEntries();
  const posts = entries.filter(e => e.kind === "photo").toReversed();
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const selection = useRef(0);
  const [image, setImage] = useState("");
  const [caption, setCaption] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  useEffect(() => () => { selection.current++; }, []);

  function clear() {
    selection.current++;
    setImage(""); setCaption(""); setConsent(false); setError(""); setBusy(false);
    form.current?.reset();
  }
  async function publish(event: FormEvent) {
    event.preventDefault();
    if (!image || !caption.trim() || !consent || busy) return;
    setBusy(true);
    const result = await updateSocial({ add: { kind: "photo", image, caption: caption.trim() } }, account);
    setBusy(false);
    if (result) { setError(result); return; }
    dialog.current?.close();
    setNotice("Photo added to this browser's community feed. It is not online.");
  }

  return <section id="traveller-photos" className={site.container + " " + styles.section} aria-labelledby="photo-feed-title">
    <div className={styles.heading}>
      <div><h2 id="photo-feed-title">From your travels</h2><p className={styles.note}>A place for your photos and little stories. Public-feed preview, visible only in this browser.</p></div>
      <button className={site.buttonOutline} disabled={!ready || damaged} onClick={() => { clear(); dialog.current?.showModal(); }}><Camera size={18} aria-hidden="true" />Share a photo</button>
    </div>
    {damaged && <p role="alert">Saved posts could not be read. Use Reset Demo Data in Switch Traveller to start again.</p>}
    <p role="status" className={styles.status}>{notice}</p>
    {!posts.length && !damaged && <p className={styles.empty}>A trail view, a chai stop, a favourite moment. Add the first photo.</p>}
    <ul className={styles.feed}>
      {posts.map(post => <li key={post.id} className={styles.card}>
        {/* Local, metadata-free data URLs cannot use the server image optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.photo} src={post.image} alt={post.caption} width={1200} height={900} loading="lazy" />
        <div className={styles.body}>
          <div className={styles.author}><strong>{demoProfileFor(post.author).displayName}</strong><span>Local post</span></div>
          <p>{post.caption}</p>
          {post.author === account && <button className={site.buttonText} onClick={async () => {
            const result = await updateSocial({ remove: post.id }, account);
            setNotice(result || "Photo removed.");
          }}>Remove photo</button>}
        </div>
      </li>)}
    </ul>
    <Dialog id="share-photo" title="Share a travel photo" dialogRef={dialog} onClose={clear}>
      <p>Preview a public post as {demoProfileFor(account).displayName}. For now, it stays in this browser. Nothing is uploaded.</p>
      <form ref={form} className={styles.form} onSubmit={publish}>
        <label>Choose photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async event => {
          const file = event.currentTarget.files?.[0];
          const current = ++selection.current;
          setImage(""); setError("");
          if (!file) { setBusy(false); return; }
          setBusy(true);
          try {
            const next = await preparePhoto(file);
            if (selection.current === current) setImage(next);
          } catch (cause) {
            if (selection.current === current) setError(cause instanceof Error ? cause.message : "This image could not be opened.");
          } finally { if (selection.current === current) setBusy(false); }
        }} /></label>
        <p className={styles.note}>JPG, PNG or WebP, up to 10 MB. Embedded location data is removed.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {image && <img className={styles.photo} src={image} alt="Your selected photo" width={1200} height={900} />}
        <label>Caption<textarea required maxLength={400} rows={3} value={caption} onChange={e => setCaption(e.target.value)} placeholder="Where did this little adventure take you?" /></label>
        <label className={styles.consent}><input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} />I have permission to share this photo and from anyone shown in it.</label>
        {error && <p role="alert">{error}</p>}
        <div className={styles.actions}><button className={site.buttonPrimary} disabled={!image || !caption.trim() || !consent || busy}>{busy ? "Preparing photo..." : "Post photo locally"}</button>
          <button type="button" className={site.buttonOutline} onClick={() => dialog.current?.close()}>Cancel</button></div>
      </form>
    </Dialog>
  </section>;
}
