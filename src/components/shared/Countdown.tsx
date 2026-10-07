import { useEffect, useState, useMemo } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useAppSettings } from "@/hooks/useAppSettings";
import { Timer } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function getTimeLeft(target: Date): TimeLeft {
  const now = new Date().getTime();
  const distance = target.getTime() - now;

  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
    expired: false,
  };
}

interface CountdownProps {
  target?: Date;
  className?: string;
  compact?: boolean;
  showIcon?: boolean;
}

export function Countdown({
  target,
  className = "",
  compact = false,
  showIcon = true,
}: CountdownProps) {
  const { lang } = useI18n();
  const { freeAccessUntil } = useAppSettings();
  const effectiveTarget = target ?? freeAccessUntil;
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(target));

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const labels = useMemo(
    () => ({
      days: lang === "fr" ? "jours" : "days",
      hours: lang === "fr" ? "heures" : "hours",
      minutes: lang === "fr" ? "min" : "min",
      seconds: lang === "fr" ? "sec" : "sec",
    }),
    [lang]
  );

  const units = compact
    ? [
        { value: timeLeft.days, label: labels.days },
        { value: timeLeft.hours, label: labels.hours },
        { value: timeLeft.minutes, label: labels.minutes },
      ]
    : [
        { value: timeLeft.days, label: labels.days },
        { value: timeLeft.hours, label: labels.hours },
        { value: timeLeft.minutes, label: labels.minutes },
        { value: timeLeft.seconds, label: labels.seconds },
      ];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold-dim px-3 py-2 ${className}`}
      aria-label={
        lang === "fr"
          ? "Compte à rebours avant la fin de l'accès gratuit"
          : "Countdown until free access ends"
      }
    >
      {showIcon && <Timer className="w-3.5 h-3.5 text-gold" aria-hidden="true" />}
      <div className="flex items-center gap-1.5">
        {units.map((unit, idx) => (
          <div key={unit.label} className="flex items-baseline gap-0.5">
            <span className="font-display text-sm font-bold text-gold-light tabular-nums">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[0.6rem] font-semibold text-muted-foreground uppercase">
              {unit.label}
            </span>
            {idx < units.length - 1 && (
              <span className="text-[0.6rem] text-muted-foreground/60 mx-0.5">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CountdownBanner({
  target = FREE_ACCESS_UNTIL,
  className = "",
}: Omit<CountdownProps, "compact" | "showIcon">) {
  const { t, lang } = useI18n();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(target));

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (timeLeft.expired) return null;

  return (
    <div
      className={`w-full bg-gradient-to-r from-gold-dim via-gold-dim/50 to-gold-dim border-b border-gold/20 ${className}`}
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-12 py-2.5 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="font-semibold text-gold-light">
          {t("countdown.banner")}
        </span>
        <Countdown target={target} compact showIcon={false} />
        <span className="text-muted-foreground">
          {lang === "fr" ? "avant le passage aux tarifs" : "before pricing takes effect"}
        </span>
      </div>
    </div>
  );
}
