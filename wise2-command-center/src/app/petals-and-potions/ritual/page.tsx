"use client";

import { useState } from "react";

export default function RitualPage() {
  const [result, setResult] = useState("");
  return <main className="petals-page petals-ritual-page"><section className="petals-builder petals-builder-static"><a className="petals-builder-back" href="/petals-and-potions">← BACK TO PETALS &amp; POTIONS</a><p className="petals-kicker">YOUR RITUAL, YOUR WAY</p><h1>Build my ritual.</h1>{result ? <div className="petals-builder-result"><p className="petals-kicker">YOUR FIRST DIRECTION</p><h2>{result}</h2><p>That gives us a starting point for your personalized Petals &amp; Potions blend.</p><a className="petals-button" href="/petals-and-potions#apothecary">EXPLORE THE APOTHECARY <span>↗</span></a></div> : <form onSubmit={(event) => { event.preventDefault(); setResult(String(new FormData(event.currentTarget).get("focus"))); }}><label>What do you want more of?<select name="focus" defaultValue="Rest & reset"><option>Rest &amp; reset</option><option>Energy &amp; focus</option><option>Glow &amp; nourish</option><option>Clarity &amp; peace</option></select></label><label>Where should we begin?<select name="world" defaultValue="SIP"><option>SIP · Custom tea</option><option>SOAK · Ritual baths</option><option>GLOW · Body care</option><option>SOUND &amp; SOUL · Soundscapes</option></select></label><button className="petals-button" type="submit">CREATE MY STARTING POINT <span>↗</span></button></form>}</section></main>;
}
