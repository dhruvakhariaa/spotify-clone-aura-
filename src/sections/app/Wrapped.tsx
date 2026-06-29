import { Link } from "react-router-dom";
import { Clock, Disc3, Sparkles, type LucideIcon } from "lucide-react";
import { WRAPPED_SEEDS } from "../../data/editorial";
import { getListenHistory, liveWrappedSummary } from "../../state/wrapped";

export default function Wrapped() {
  const history = getListenHistory();
  const summary = liveWrappedSummary(history);
  const topArtist = summary.topArtists[0]?.name ?? "Start Aura Radio";
  const topGenre = summary.topGenres[0]?.name ?? "your next genre";

  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-[1400px]">
        <header className="on-dark mb-8 rounded-lg border border-white/10 bg-[#10121f] p-6 md:p-10">
          <p className="kicker mb-3 text-[#e8ff3a]">Live Wrapped</p>
          <h1 className="display t-lg max-w-4xl">Not once a year. Every session has a story.</h1>
          <p className="mt-5 max-w-2xl text-white/62">
            Until Spotify auth arrives, this reads your in-app listening history and turns it into a living recap.
          </p>
        </header>

        <section className="mb-8 grid gap-4 lg:grid-cols-3">
          <Metric icon={Sparkles} label="Signals captured" value={String(summary.total)} />
          <Metric icon={Disc3} label="Current lead artist" value={topArtist} />
          <Metric icon={Clock} label="Listening hour" value={summary.daypart} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_.9fr]">
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-6">
            <h2 className="display mb-6 text-3xl">Top artists right now</h2>
            <div className="space-y-3">
              {(summary.topArtists.length ? summary.topArtists : WRAPPED_SEEDS.map((s, i) => ({ name: s.value, count: 3 - i }))).map((item, index) => (
                <div key={String(item.name)} className="grid grid-cols-[40px_1fr_auto] items-center gap-4 rounded-lg bg-black/20 p-3">
                  <span className="display text-2xl text-white/35">{index + 1}</span>
                  <span className="font-bold">{String(item.name)}</span>
                  <span className="text-sm text-white/42">{item.count} plays</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-6">
            <h2 className="display mb-6 text-3xl">Your current thesis</h2>
            <p className="text-2xl font-bold leading-9">
              You are orbiting <span className="text-[#1db954]">{topArtist}</span>, drifting toward{" "}
              <span className="text-[#e8ff3a]">{topGenre}</span>, and listening most in the {summary.daypart}.
            </p>
            <p className="mt-6 text-white/56">
              This is intentionally local and simulated for the concept phase. Spotify history can replace the source later.
            </p>
            <Link to="/app/home" className="btn-ghost mt-8 inline-block">Play more music</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-6">
      <Icon className="mb-8 text-[#1db954]" size={26} />
      <p className="kicker mb-2 text-white/42">{label}</p>
      <p className="display text-3xl leading-none">{value}</p>
    </div>
  );
}
