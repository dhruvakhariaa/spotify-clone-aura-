import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CalendarDays, Clock, Users, Sparkles, Check } from "lucide-react";
import { getConcert, auraReservedSectionIds, inr, type StadiumSection } from "../../data/concerts";
import { useMyAura } from "../../state/aura";
import { PlaceholderImage } from "../../components/app/PlaceholderImage";

type Section = StadiumSection & { reserved: boolean };

export default function ConcertDetail() {
  const { id } = useParams();
  const concert = getConcert(id);
  const aura = useMyAura();
  const [selected, setSelected] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  const seed = aura?.seed ?? 0;
  const reservedIds = useMemo(
    () => (concert ? auraReservedSectionIds(concert.sections, seed) : []),
    [concert, seed]
  );

  if (!concert) return <Navigate to="/app/concerts" replace />;

  const sections: Section[] = concert.sections.map((s) => ({ ...s, reserved: reservedIds.includes(s.id) }));
  const selectedSection = sections.find((s) => s.id === selected) ?? null;
  const archetype = aura?.archetype.name.replace("The ", "") ?? "your taste";
  const ringOf = (ring: Section["ring"]) => sections.filter((s) => s.ring === ring);

  const canPick = (s: Section) => s.reserved || s.status === "available";

  return (
    <div
      className="px-5 py-8 md:px-10 md:py-10"
      style={{ ["--accent" as string]: concert.accent, ["--accent-2" as string]: concert.accent }}
    >
      <div className="mx-auto max-w-[1200px]">
        <Link to="/app/concerts" className="kicker mb-5 inline-flex items-center gap-1.5 text-white/55 hover:text-white">
          ← All concerts
        </Link>

        {/* ---------- HERO ---------- */}
        <section className="on-dark relative mb-10 overflow-hidden rounded-3xl border border-white/10">
          <PlaceholderImage src={concert.heroImage} label={`${concert.artist} — hero (1600×900)`} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,15,.45)_0%,rgba(7,8,15,.7)_55%,#07080f_100%)]" />
          <div className="relative z-10 flex min-h-[360px] flex-col justify-end p-6 md:min-h-[440px] md:p-10">
            <p className="kicker mb-3 text-[color:var(--accent)]">
              {concert.city} · {concert.venue}
            </p>
            <h1 className="display text-5xl leading-[0.92] md:text-7xl">{concert.artist}</h1>
            <p className="mt-4 max-w-2xl text-base text-white/72 md:text-lg">{concert.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Chip icon={<CalendarDays size={14} />}>{concert.date}</Chip>
              <Chip icon={<Clock size={14} />}>Doors {concert.doors}</Chip>
              <Chip icon={<Users size={14} />}>{concert.capacity.toLocaleString("en-IN")} cap · {concert.venueType}</Chip>
            </div>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          {/* ---------- MAIN COLUMN ---------- */}
          <div className="space-y-12">
            {/* about + lineup */}
            <section>
              <h2 className="display mb-4 text-2xl md:text-3xl">The night</h2>
              <p className="max-w-2xl text-[15px] leading-7 text-white/68">{concert.about}</p>
              <div className="mt-6">
                <p className="label mb-2.5 text-white/45">Lineup</p>
                <div className="flex flex-wrap gap-2">
                  <span className="chip">{concert.artist}</span>
                  {concert.supporting.map((s) => (
                    <span key={s} className="rounded-full border border-white/14 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/70">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <p className="label mb-2.5 text-white/45">Expect to hear</p>
                <div className="flex flex-wrap gap-2">
                  {concert.setlistTease.map((t) => (
                    <span key={t} className="rounded-full bg-white/[0.05] px-3 py-1.5 text-xs text-white/65">{t}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* AURA fan-seat banner */}
            <section className="on-dark relative overflow-hidden rounded-2xl border border-white/10 bg-[#10121f] p-6">
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl"
                style={{ background: "color-mix(in srgb, var(--accent) 30%, transparent)" }}
              />
              <div className="relative flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-[color:var(--accent)]/15 text-[color:var(--accent)]">
                  <Sparkles size={18} />
                </span>
                <div>
                  <p className="kicker mb-1 text-[color:var(--accent)]">AURA Fan Seats</p>
                  <p className="max-w-2xl text-sm leading-6 text-white/72">
                    Because <span className="font-bold text-white">{concert.artist}</span> sits in your{" "}
                    <span className="font-bold text-white">{archetype}</span> rotation, AURA blocked{" "}
                    <span className="font-bold text-white">{reservedIds.length} prime seats</span> from resellers and is holding
                    them at <span className="font-bold text-white">face value</span> — scalpers can't touch them, and they're
                    only offered to fans who actually listen.
                  </p>
                </div>
              </div>
            </section>

            {/* stadium map */}
            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="display text-2xl md:text-3xl">Pick your seat</h2>
                  <p className="mt-1 max-w-md text-sm text-white/60">
                    Tap any <span className="font-bold text-white">available</span> tile to select it. The glowing{" "}
                    <span className="font-bold text-[color:var(--accent)]">✦ Fan Seats</span> are held for you at face value;
                    red tiles are blocked from resellers.
                  </p>
                </div>
              </div>

              <div className="on-dark rounded-2xl border border-white/10 bg-[#0a0c16] p-5 md:p-7">
                {/* stage */}
                <div className="mx-auto mb-6 w-[62%] rounded-md bg-[linear-gradient(180deg,color-mix(in_srgb,var(--accent)_60%,#fff),var(--accent))] py-2 text-center text-[0.62rem] font-black uppercase tracking-[0.3em] text-[#07080f] shadow-[0_0_30px_color-mix(in_srgb,var(--accent)_45%,transparent)]">
                  Stage
                </div>

                <div className="space-y-2.5">
                  <SeatRow sections={ringOf("floor")} maxW="56%" selected={selected} onPick={setSelected} canPick={canPick} />
                  <SeatRow sections={ringOf("lower")} maxW="82%" selected={selected} onPick={setSelected} canPick={canPick} />
                  <SeatRow sections={ringOf("upper")} maxW="100%" selected={selected} onPick={setSelected} canPick={canPick} />
                </div>

                {/* legend with live counts */}
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t border-white/8 pt-4 text-[0.72rem] text-white/60">
                  <Legend swatch="border-[color:var(--accent)] bg-[color:var(--accent)]/25" label="Fan Seat" count={sections.filter((s) => s.reserved).length} />
                  <Legend swatch="border-white/25 bg-white/[0.08]" label="Available" count={sections.filter((s) => !s.reserved && s.status === "available").length} />
                  <Legend swatch="border-[#ff6a6a]/45 bg-[#ff6a6a]/12" label="Resale-blocked" count={sections.filter((s) => s.status === "scalper").length} />
                  <Legend swatch="border-white/10 bg-white/[0.02]" label="Sold out" count={sections.filter((s) => s.status === "sold").length} />
                </div>
              </div>
            </section>

            {/* gallery */}
            <section>
              <h2 className="display mb-4 text-2xl md:text-3xl">From the pit</h2>
              <div className="grid grid-cols-3 gap-3">
                {concert.gallery.map((g, i) => (
                  <PlaceholderImage key={g} src={g} label={`Gallery ${i + 1}`} className="aspect-[4/5] w-full rounded-xl border border-white/10" />
                ))}
              </div>
            </section>

            {/* testimonials */}
            <section>
              <h2 className="display mb-5 text-2xl md:text-3xl">What fans said</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {concert.testimonials.map((t) => (
                  <figure key={t.handle} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                    <blockquote className="text-sm leading-6 text-white/78">“{t.quote}”</blockquote>
                    <figcaption className="mt-4 flex items-center gap-3">
                      <PlaceholderImage src={t.avatar} label="Avatar" className="size-9 shrink-0 rounded-full border border-white/10" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-white">{t.name}</p>
                        <p className="truncate text-[0.7rem] text-white/45">{t.handle}</p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          </div>

          {/* ---------- STICKY BUY SUMMARY ---------- */}
          <aside className="lg:sticky lg:top-6">
            <div className="on-dark rounded-2xl border border-white/12 bg-[#10121f] p-5 shadow-[0_24px_60px_rgba(0,0,0,.4)]">
              <p className="kicker mb-3 text-white/45">Your ticket</p>

              {selectedSection ? (
                <>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="display text-2xl">{selectedSection.label}</span>
                    <span className="display text-2xl text-[color:var(--accent)]">{inr(selectedSection.price)}</span>
                  </div>
                  {selectedSection.reserved && (
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)]/15 px-2.5 py-1 text-[0.68rem] font-bold text-[color:var(--accent)]">
                      <Check size={13} /> Fan-priced · scalpers blocked
                    </p>
                  )}
                  <div className="mt-5 space-y-1.5 border-t border-white/10 pt-4 text-sm text-white/60">
                    <Row label="Face value" value={inr(selectedSection.price)} />
                    <Row label="AURA fee" value="₹0" />
                    <Row label="Total" value={inr(selectedSection.price)} bold />
                  </div>
                  <button
                    onClick={() => setPaid(true)}
                    className="btn-blue mt-5 w-full justify-center"
                  >
                    Pay {inr(selectedSection.price)}
                  </button>
                </>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm text-white/55">Pick a seat on the map to continue.</p>
                  {reservedIds.length > 0 && (
                    <button
                      onClick={() => setSelected(reservedIds[0])}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--accent)]/50 px-3 py-2 text-xs font-bold text-[color:var(--accent)] hover:bg-[color:var(--accent)]/10"
                    >
                      <Sparkles size={14} /> Jump to my Fan Seat
                    </button>
                  )}
                </div>
              )}

              <p className="mt-5 border-t border-white/10 pt-4 text-[0.7rem] leading-5 text-white/40">
                AURA holds a slice of every show off the resale market and prices it for real fans. No dynamic pricing, no 3× markup.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* ---------- PAY → MEME ---------- */}
      {paid && selectedSection && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/85 p-5 backdrop-blur-md">
          <div className="w-full max-w-lg text-center">
            <PlaceholderImage
              src="/memes/pay.png"
              fit="contain"
              label="Your celebration meme (shown in full)"
              className="mx-auto max-h-[72vh] max-w-[min(90vw,640px)] rounded-2xl border border-white/12"
            />
            <p className="display mt-6 text-3xl text-white">You're in. 🎟️</p>
            <p className="mt-2 text-white/65">
              {selectedSection.label} · {concert.artist} · {concert.city}
            </p>
            <p className="mt-1 text-xs text-white/40">(Drop your meme at <code>public/memes/pay.png</code> to replace this.)</p>
            <button onClick={() => setPaid(false)} className="btn-ghost mt-6">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/16 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-white/78 backdrop-blur-sm">
      {icon}
      {children}
    </span>
  );
}

function Legend({ swatch, label, count }: { swatch: string; label: string; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-3.5 rounded-[4px] border ${swatch}`} />
      <span className="font-bold">{label}</span>
      {typeof count === "number" && <span className="text-white/40">({count})</span>}
    </span>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold text-white" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function SeatRow({
  sections,
  maxW,
  selected,
  onPick,
  canPick,
}: {
  sections: Section[];
  maxW: string;
  selected: string | null;
  onPick: (id: string) => void;
  canPick: (s: Section) => boolean;
}) {
  return (
    <div className="mx-auto flex flex-wrap justify-center gap-2" style={{ maxWidth: maxW }}>
      {sections.map((s) => {
        const isSel = selected === s.id;
        const base =
          "relative flex min-w-[78px] flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center transition-all";
        let tone: string;
        let status: string;
        let statusTone: string;
        if (s.reserved) {
          tone = "border-[color:var(--accent)] bg-[color:var(--accent)]/15 text-white hover:bg-[color:var(--accent)]/25";
          status = "Fan price";
          statusTone = "text-[color:var(--accent)]";
        } else if (s.status === "available") {
          tone = "border-white/20 bg-white/[0.06] text-white hover:border-[color:var(--accent)] hover:bg-white/[0.1]";
          status = "Available";
          statusTone = "text-emerald-300/80";
        } else if (s.status === "scalper") {
          tone = "border-[#ff6a6a]/40 bg-[#ff6a6a]/10 text-[#ffc4c4] cursor-not-allowed";
          status = `Resale ${s.resaleMultiplier}×`;
          statusTone = "text-[#ff8e8e]";
        } else {
          tone = "border-white/8 bg-white/[0.015] text-white/35 cursor-not-allowed";
          status = "Sold out";
          statusTone = "text-white/30";
        }
        const ring = isSel ? "ring-2 ring-[color:var(--accent)] ring-offset-2 ring-offset-[#0a0c16] scale-[1.03]" : "";
        return (
          <button
            key={s.id}
            disabled={!canPick(s)}
            onClick={() => canPick(s) && onPick(s.id)}
            className={`${base} ${tone} ${ring}`}
            title={s.status === "scalper" ? `Held by resellers at ${s.resaleMultiplier}× — blocked` : `${s.label} · ${status}`}
          >
            {s.reserved && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-[color:var(--accent)] px-1.5 py-0.5 text-[0.5rem] font-black uppercase tracking-wide text-[#07080f] shadow-[0_0_10px_color-mix(in_srgb,var(--accent)_60%,transparent)]">
                ✦ Fan
              </span>
            )}
            {isSel && (
              <span className="absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full bg-[color:var(--accent)] text-[#07080f]">
                <Check size={11} strokeWidth={3.5} />
              </span>
            )}
            <span className="block text-[0.74rem] font-black leading-tight">{s.label}</span>
            <span className={`block text-[0.56rem] font-bold uppercase tracking-wide leading-none ${statusTone}`}>{status}</span>
            <span className="block text-[0.66rem] font-bold leading-none opacity-90">
              {s.status === "sold" ? "—" : inr(s.price)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
