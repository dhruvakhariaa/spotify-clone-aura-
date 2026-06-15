import { Link } from "react-router-dom";
import { useMyAura } from "../../state/aura";
import { GenerativeMark } from "../../components/GenerativeMark";

interface Props {
  title: string;
  blurb: string;
}

/** Designed placeholder for pillars built in later phases — keeps the shell complete. */
export default function ComingSoon({ title, blurb }: Props) {
  const aura = useMyAura();
  return (
    <div className="relative min-h-full flex items-center px-5 md:px-10 py-16 overflow-hidden">
      {aura && (
        <div className="pointer-events-none absolute -right-20 top-1/2 -translate-y-1/2 w-[60vmin] h-[60vmin] opacity-25">
          <GenerativeMark aura={aura} />
        </div>
      )}
      <div className="relative z-10 max-w-2xl">
        <span className="chip mb-6">✦ In production</span>
        <h1 className="display t-xl mb-5">{title}</h1>
        <p className="text-xl text-white/60 mb-10 leading-relaxed">{blurb}</p>
        <Link to="/app/home" className="btn-ghost">← Back to Home</Link>
      </div>
    </div>
  );
}
