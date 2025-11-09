"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CalendarCheck,
  Check,
  Compass,
  Loader2,
  MessageSquare,
  Settings2,
  Sparkles,
  Target,
} from "lucide-react";
import { addDays, format } from "date-fns";

type Persona = {
  brandName: string;
  mission: string;
  voice: string;
  audience: string;
  vibe: string;
  valueProp: string;
  keywords: string;
  platforms: string[];
  pillars: string[];
};

type CampaignRequest = {
  objective: string;
  primaryPlatform: string;
  tone: string;
  focusPillar: string;
  formatPreference: string;
  callToAction: string;
  product: string;
  campaignLength: number;
};

type CalendarMoment = {
  dayOffset: number;
  platform: string;
  pillar: string;
  format: string;
  hook: string;
  brief: string;
};

type GeneratedResponse = {
  statement: string;
  post: {
    headline: string;
    caption: string;
    hashtags: string[];
    visualDirection: string;
    callToAction: string;
    variations: {
      platform: string;
      angle: string;
      caption: string;
    }[];
  };
  calendar: CalendarMoment[];
  playbook: {
    before: string[];
    during: string[];
    after: string[];
  };
  metrics: {
    kpi: string;
    target: string;
    rationale: string;
  }[];
};

type TimelineMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

const AVAILABLE_PLATFORMS = [
  "Instagram",
  "TikTok",
  "LinkedIn",
  "X (Twitter)",
  "YouTube Shorts",
  "Threads",
];

const defaultPersona: Persona = {
  brandName: "Lumen Labs",
  mission:
    "Demystify AI for busy solo marketers through snackable playbooks and actionable workshops.",
  voice:
    "Curiously optimistic strategist that speaks like a co-founder who loves data and storytelling.",
  audience:
    "Growth-minded founders and marketing leads at seed to Series A startups who need consistent brand visibility without a full social team.",
  vibe: "Bright, resourceful, high-energy, future-forward.",
  valueProp: "Transforms raw product updates into repeatable narrative campaigns that teach and convert.",
  keywords: "AI workflows, launch systems, community flywheel, founder brand, GTM",
  platforms: ["Instagram", "LinkedIn", "YouTube Shorts"],
  pillars: ["Education", "Behind-the-scenes", "Customer Proof", "Founder POV"],
};

const defaultRequest: CampaignRequest = {
  objective: "Launch the new AI sprint planning template to existing audience and attract product-led marketers.",
  primaryPlatform: "Instagram",
  tone: "Excited mentor energy with sharp, punchy hooks.",
  focusPillar: "Education",
  formatPreference: "Carousel tutorial",
  callToAction: "Download the template and join the waitlist for the live sprint.",
  product: "AI Sprint Planning Template",
  campaignLength: 7,
};

const SectionTitle = ({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Sparkles;
  title: string;
  description?: string;
}) => (
  <div className="flex items-start gap-3">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
      <Icon className="h-5 w-5 text-indigo-300" />
    </span>
    <div>
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      {description ? (
        <p className="text-sm text-slate-400">{description}</p>
      ) : null}
    </div>
  </div>
);

const FieldGroup = ({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <div className="space-y-1">
      <p className="text-sm font-medium text-slate-200">{label}</p>
      {description ? (
        <p className="text-xs text-slate-400/80">{description}</p>
      ) : null}
    </div>
    {children}
  </div>
);

const TextInput = ({
  value,
  onChange,
  placeholder,
  multiline,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) => {
  const common =
    "w-full rounded-xl border border-white/5 bg-white/5 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 transition";
  if (multiline) {
    return (
      <textarea
        className={`${common} min-h-[110px] py-3 leading-relaxed`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    );
  }

  return (
    <input
      className={`${common} h-11`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
};

export function AgentDashboard() {
  const [persona, setPersona] = useState<Persona>(defaultPersona);
  const [request, setRequest] = useState<CampaignRequest>(defaultRequest);
  const [response, setResponse] = useState<GeneratedResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelineMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const futureCalendar = useMemo(() => {
    if (!response?.calendar?.length) {
      return [];
    }

    return response.calendar.map((slot) => ({
      ...slot,
      dateLabel: format(addDays(new Date(), slot.dayOffset), "EEE, MMM d"),
    }));
  }, [response]);

  const runGeneration = async () => {
    setIsLoading(true);
    setError(null);

    const requestSummary = `Campaign boost on ${request.primaryPlatform} for ${persona.brandName}. Objective: ${request.objective}`;

    setTimeline((prev) => [
      {
        role: "user",
        content: requestSummary,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ persona, request }),
      });

      if (!res.ok) {
        throw new Error("Unable to generate campaign. Please try again.");
      }

      const payload: GeneratedResponse = await res.json();
      setResponse(payload);
      setTimeline((prev) => [
        {
          role: "assistant",
          content: payload.statement,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Unexpected error while generating.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const addPillar = () => {
    setPersona((prev) => ({
      ...prev,
      pillars: [...prev.pillars, "New narrative"],
    }));
  };

  const updatePillar = (index: number, value: string) => {
    setPersona((prev) => {
      const next = [...prev.pillars];
      next[index] = value;
      return { ...prev, pillars: next };
    });
  };

  const removePillar = (index: number) => {
    setPersona((prev) => ({
      ...prev,
      pillars:
        prev.pillars.length > 1
          ? prev.pillars.filter((_, idx) => idx !== index)
          : prev.pillars,
    }));
  };

  const togglePlatform = (platform: string) => {
    setPersona((prev) => {
      const exists = prev.platforms.includes(platform);
      return {
        ...prev,
        platforms: exists
          ? prev.platforms.length > 1
            ? prev.platforms.filter((item) => item !== platform)
            : prev.platforms
          : [...prev.platforms, platform],
      };
    });
  };

  const platformSummary = useMemo(
    () =>
      persona.platforms.length
        ? persona.platforms.join(" • ")
        : "Select platforms to focus on",
    [persona.platforms],
  );

  const suggestionBlurb = useMemo(
    () =>
      `Focus on ${request.focusPillar.toLowerCase()} stories with ${request.formatPreference.toLowerCase()} formats. Maintain ${request.tone.toLowerCase()} and weave in keywords: ${persona.keywords}.`,
    [request.focusPillar, request.formatPreference, request.tone, persona.keywords],
  );

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-20 pt-12 sm:px-6 lg:px-0">
      <div className="grid-overlay" aria-hidden="true" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <section className="glass-panel-strong relative overflow-hidden p-8 sm:p-10">
          <div className="absolute inset-y-0 right-0 w-1/2 rounded-l-full bg-gradient-to-l from-indigo-500/20 to-transparent blur-3xl" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="accent-pill">Agentic Growth Lab</span>
              <span className="accent-pill">Omni-channel ready</span>
              <span className="accent-pill">Persona-aware responses</span>
            </div>
            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl">
                Your AI social media partner for planning, publishing, and
                iterating campaigns.
              </h1>
              <p className="text-lg text-slate-300">
                Craft platform-specific narratives, spin up launch calendars, and
                generate on-brand post assets with one click. Designed for founders
                and lean teams who need a strategist, copywriter, and analyst in a
                single workspace.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-300" />
                Autonomous ideation and copy rewrites
              </div>
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-indigo-300" />
                Adaptive publishing calendar
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-300" />
                KPI guardrails baked in
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="glass-panel flex flex-col gap-6 p-6 sm:p-7">
            <SectionTitle
              icon={BrainCircuit}
              title="Brand persona blueprint"
              description="Teach the agent your brand’s DNA so responses stay on-voice across every channel."
            />

            <FieldGroup label="Brand name" description="Shown inside hooks, CTAs, and signature lines.">
              <TextInput
                value={persona.brandName}
                onChange={(value) =>
                  setPersona((prev) => ({ ...prev, brandName: value }))
                }
                placeholder="e.g. Lumen Labs"
              />
            </FieldGroup>

            <FieldGroup
              label="Mission statement"
              description="The concise elevator pitch the agent will reference."
            >
              <TextInput
                value={persona.mission}
                onChange={(value) =>
                  setPersona((prev) => ({ ...prev, mission: value }))
                }
                placeholder="Why does your offer exist?"
                multiline
              />
            </FieldGroup>

            <FieldGroup
              label="Voice & vibe"
              description="How should the agent sound when speaking for you?"
            >
              <TextInput
                value={persona.voice}
                onChange={(value) =>
                  setPersona((prev) => ({ ...prev, voice: value }))
                }
                multiline
                placeholder="Conversational yet sharp, speaks in first person..."
              />
            </FieldGroup>

            <FieldGroup
              label="Primary audience"
              description="Who are we showing up for? Mention segment details."
            >
              <TextInput
                value={persona.audience}
                onChange={(value) =>
                  setPersona((prev) => ({ ...prev, audience: value }))
                }
                multiline
              />
            </FieldGroup>

            <FieldGroup label="Value proposition" description="Keep it punchy; use real outcomes.">
              <TextInput
                value={persona.valueProp}
                onChange={(value) =>
                  setPersona((prev) => ({ ...prev, valueProp: value }))
                }
                multiline
              />
            </FieldGroup>

            <FieldGroup
              label="Signature descriptors"
              description="Weave these adjectives through hooks & transitions."
            >
              <TextInput
                value={persona.vibe}
                onChange={(value) =>
                  setPersona((prev) => ({ ...prev, vibe: value }))
                }
                placeholder="Energetic, data-backed, founder-to-founder"
              />
            </FieldGroup>

            <FieldGroup
              label="Keyword anchors"
              description="Comma-separated list appears in hashtags + SEO prompts."
            >
              <TextInput
                value={persona.keywords}
                onChange={(value) =>
                  setPersona((prev) => ({ ...prev, keywords: value }))
                }
                placeholder="AI workflows, sales narrative, product storytelling"
              />
            </FieldGroup>

            <div className="space-y-3">
              <SectionTitle
                icon={Compass}
                title="Core content pillars"
                description="The agent rotates stories across these lenses for variety."
              />
              <div className="flex flex-col gap-3">
                {persona.pillars.map((pillar, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <input
                      className="flex-1 bg-transparent text-sm text-slate-100 outline-none"
                      value={pillar}
                      onChange={(event) =>
                        updatePillar(index, event.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="rounded-full bg-white/10 p-1 text-slate-300 transition hover:bg-white/20"
                      onClick={() => removePillar(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="w-full rounded-xl border border-dashed border-indigo-300/50 py-2 text-sm font-medium text-indigo-200 transition hover:border-indigo-200 hover:text-indigo-100"
                onClick={addPillar}
              >
                Add another narrative lane
              </button>
            </div>

            <div className="space-y-3">
              <SectionTitle
                icon={Settings2}
                title="Platform focus"
                description="Toggle the channels you want included in the calendar."
              />
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_PLATFORMS.map((platform) => {
                  const isActive = persona.platforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        isActive
                          ? "border-indigo-400/60 bg-indigo-500/25 text-indigo-100 shadow-lg shadow-indigo-500/20"
                          : "border-white/10 bg-white/5 text-slate-400 hover:border-indigo-200/40 hover:text-slate-200"
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400">{platformSummary}</p>
            </div>
          </aside>

          <section className="glass-panel flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex flex-col gap-2">
              <SectionTitle
                icon={Target}
                title="Campaign mission control"
                description="Set the campaign objective, then let the agent orchestrate ready-to-post assets."
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <FieldGroup label="Primary platform" description="Anchor where the hero asset should live first.">
                <select
                  value={request.primaryPlatform}
                  onChange={(event) =>
                    setRequest((prev) => ({
                      ...prev,
                      primaryPlatform: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
                >
                  {persona.platforms.length ? (
                    persona.platforms.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))
                  ) : (
                    <option value="">Add platforms in the persona panel</option>
                  )}
                </select>
              </FieldGroup>

              <FieldGroup
                label="Campaign objective"
                description="Describe the outcome. The agent will craft copy to support it."
              >
                <TextInput
                  value={request.objective}
                  onChange={(value) =>
                    setRequest((prev) => ({ ...prev, objective: value }))
                  }
                  multiline
                />
              </FieldGroup>

              <FieldGroup label="Hero product or offer">
                <TextInput
                  value={request.product}
                  onChange={(value) =>
                    setRequest((prev) => ({ ...prev, product: value }))
                  }
                  placeholder="Which offer are we pushing?"
                />
              </FieldGroup>

              <FieldGroup
                label="Tone & creative direction"
                description="Explain how this campaign should feel."
              >
                <TextInput
                  value={request.tone}
                  onChange={(value) =>
                    setRequest((prev) => ({ ...prev, tone: value }))
                  }
                  multiline
                />
              </FieldGroup>

              <FieldGroup label="Spotlight pillar">
                <select
                  value={request.focusPillar}
                  onChange={(event) =>
                    setRequest((prev) => ({
                      ...prev,
                      focusPillar: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
                >
                  {persona.pillars.map((pillar) => (
                    <option key={pillar} value={pillar}>
                      {pillar}
                    </option>
                  ))}
                </select>
              </FieldGroup>

              <FieldGroup label="Preferred format">
                <TextInput
                  value={request.formatPreference}
                  onChange={(value) =>
                    setRequest((prev) => ({
                      ...prev,
                      formatPreference: value,
                    }))
                  }
                  placeholder="Carousel tutorial, talking-head video, punchy thread..."
                />
              </FieldGroup>

              <FieldGroup label="Call to action">
                <TextInput
                  value={request.callToAction}
                  onChange={(value) =>
                    setRequest((prev) => ({
                      ...prev,
                      callToAction: value,
                    }))
                  }
                  placeholder="Book a demo, join waitlist, read the case study"
                />
              </FieldGroup>

              <FieldGroup
                label="Campaign duration (days)"
                description="Used to time the calendar roll-out."
              >
                <input
                  type="range"
                  min={3}
                  max={30}
                  value={request.campaignLength}
                  onChange={(event) =>
                    setRequest((prev) => ({
                      ...prev,
                      campaignLength: Number(event.target.value),
                    }))
                  }
                  className="w-full"
                />
                <p className="text-xs text-slate-400">
                  {request.campaignLength} day rollout with staggered channel
                  sequencing.
                </p>
              </FieldGroup>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-indigo-200" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-indigo-100">Agent cue</p>
                  <p className="text-xs text-indigo-100/80">{suggestionBlurb}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-100">
                  Generate omni-channel sequence
                </p>
                <p className="text-xs text-slate-400">
                  The agent returns a ready-to-post hero asset, repurposed variations,
                  KPI guardrails, and a channel-specific calendar.
                </p>
              </div>
              <button
                type="button"
                onClick={runGeneration}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-indigo-500/40"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />Run the agent
                  </>
                )}
              </button>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,_1.6fr)_minmax(0,_1fr)]">
              <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-5">
                <SectionTitle
                  icon={MessageSquare}
                  title="Hero post blueprint"
                  description="Primary asset to launch the campaign. Variations adapt to other channels."
                />
                {response ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
                      <h4 className="text-sm font-semibold text-indigo-100">
                        {response.post.headline}
                      </h4>
                      <p className="mt-2 whitespace-pre-line text-sm text-slate-100">
                        {response.post.caption}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-wide text-indigo-200/80">
                        Visual direction
                      </p>
                      <p className="text-sm text-slate-200">
                        {response.post.visualDirection}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {response.post.hashtags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100"
                          >
                            #{tag.replace(/^#/, "")}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-xs text-indigo-100/80">
                        CTA: {response.post.callToAction}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Cross-channel variations
                      </p>
                      <div className="grid gap-3">
                        {response.post.variations.map((variation, index) => (
                          <div
                            key={`${variation.platform}-${index}`}
                            className="rounded-xl border border-white/10 bg-black/20 p-4"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-100">
                                {variation.platform}
                              </span>
                              <span className="text-xs text-slate-400">
                                {variation.angle}
                              </span>
                            </div>
                            <p className="mt-2 whitespace-pre-line text-sm text-slate-200">
                              {variation.caption}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <PlaceholderCard />
                )}
              </div>

              <div className="flex flex-col gap-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <SectionTitle
                    icon={CalendarCheck}
                    title="Publishing calendar"
                    description="Sequenced roll-out with platform-first hooks."
                  />
                  {futureCalendar.length ? (
                    <div className="mt-4 space-y-3">
                      {futureCalendar.map((slot, index) => (
                        <div
                          key={`${slot.platform}-${index}`}
                          className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-100">
                              {slot.dateLabel} · {slot.platform}
                            </p>
                            <span className="text-xs text-slate-400">
                              {slot.format}
                            </span>
                          </div>
                          <p className="text-xs uppercase tracking-wide text-indigo-200/80">
                            {slot.pillar}
                          </p>
                          <p className="text-sm text-slate-200">{slot.hook}</p>
                          <p className="text-xs text-slate-400">{slot.brief}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">
                      Generate a campaign to unlock the agent’s staggered channel
                      plan.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <SectionTitle
                    icon={BarChart3}
                    title="KPI guardrails"
                    description="Metrics the agent will monitor across the campaign."
                  />
                  {response?.metrics?.length ? (
                    <div className="mt-4 space-y-3">
                      {response.metrics.map((metric, index) => (
                        <div
                          key={`${metric.kpi}-${index}`}
                          className="rounded-xl border border-white/10 bg-black/20 p-3"
                        >
                          <p className="text-sm font-semibold text-slate-100">
                            {metric.kpi}
                          </p>
                          <p className="text-xs text-slate-300">Target: {metric.target}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {metric.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">
                      KPIs appear after the agent completes a run.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <SectionTitle
                    icon={ArrowRight}
                    title="Engagement choreography"
                    description="Pre-post, day-of, and follow-up moves to maximize conversations."
                  />
                  {response ? (
                    <div className="mt-4 space-y-4 text-sm text-slate-200">
                      <PlaybookBlock label="Before launch" items={response.playbook.before} />
                      <PlaybookBlock label="Day-of sequence" items={response.playbook.during} />
                      <PlaybookBlock label="Momentum loops" items={response.playbook.after} />
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">
                      The agent will choreograph touchpoints once you run a
                      campaign.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <SectionTitle
                icon={MessageSquare}
                title="Agent activity feed"
                description="Snapshot of the latest prompts and agent responses."
              />
              {timeline.length ? (
                <ul className="mt-4 space-y-4">
                  {timeline.map((entry, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${(entry.role === "assistant" ? "bg-indigo-400" : "bg-emerald-400")}`}
                      />
                      <div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="font-semibold uppercase tracking-wide text-slate-200">
                            {entry.role === "assistant" ? "Agent" : "You"}
                          </span>
                          <span>{format(new Date(entry.timestamp), "PPpp")}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-100">{entry.content}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-400">
                  Once you run the agent, the feed captures the latest strategy
                  iterations.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

const PlaybookBlock = ({
  label,
  items,
}: {
  label: string;
  items: string[];
}) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200/90">
      {label}
    </p>
    <ul className="space-y-1.5 text-sm text-slate-200">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-2">
          <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-300" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const PlaceholderCard = () => (
  <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-white/20 bg-black/20 p-6">
    <div className="rounded-full bg-white/5 p-3">
      <Sparkles className="h-5 w-5 text-indigo-300" />
    </div>
    <div className="space-y-3">
      <h4 className="text-lg font-semibold text-slate-100">
        Pulse-check your brand guides, then let the agent riff.
      </h4>
      <p className="text-sm text-slate-400">
        Define your mission, voice, and objectives to get a publish-ready hero
        post, trimmed variations, and an interactive launch plan ten seconds after
        hitting run.
      </p>
      <ul className="space-y-2 text-xs text-slate-400">
        <li>• Hooks mapped to your core narrative pillars</li>
        <li>• Post copy with platform-specific CTAs and pacing</li>
        <li>• Hashtags curated from your saved keywords</li>
        <li>• Repurposing prompts for partner channels</li>
      </ul>
    </div>
  </div>
);

export default AgentDashboard;
