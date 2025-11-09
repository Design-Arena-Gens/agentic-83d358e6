import { z } from "zod";

export const personaSchema = z.object({
  brandName: z.string().min(1),
  mission: z.string().min(1),
  voice: z.string().min(1),
  audience: z.string().min(1),
  vibe: z.string().min(1),
  valueProp: z.string().min(1),
  keywords: z.string().min(1),
  platforms: z.array(z.string().min(1)).min(1),
  pillars: z.array(z.string().min(1)).min(1),
});

export const campaignRequestSchema = z.object({
  objective: z.string().min(1),
  primaryPlatform: z.string().min(1),
  tone: z.string().min(1),
  focusPillar: z.string().min(1),
  formatPreference: z.string().min(1),
  callToAction: z.string().min(1),
  product: z.string().min(1),
  campaignLength: z.number().int().positive().max(60),
});

export const generationRequestSchema = z.object({
  persona: personaSchema,
  request: campaignRequestSchema,
});

export const agentResponseSchema = z.object({
  statement: z.string(),
  post: z.object({
    headline: z.string(),
    caption: z.string(),
    hashtags: z.array(z.string()),
    visualDirection: z.string(),
    callToAction: z.string(),
    variations: z
      .array(
        z.object({
          platform: z.string(),
          angle: z.string(),
          caption: z.string(),
        }),
      )
      .min(1),
  }),
  calendar: z.array(
    z.object({
      dayOffset: z.number().int().nonnegative(),
      platform: z.string(),
      pillar: z.string(),
      format: z.string(),
      hook: z.string(),
      brief: z.string(),
    }),
  ),
  playbook: z.object({
    before: z.array(z.string()),
    during: z.array(z.string()),
    after: z.array(z.string()),
  }),
  metrics: z.array(
    z.object({
      kpi: z.string(),
      target: z.string(),
      rationale: z.string(),
    }),
  ),
});

export type GenerationRequest = z.infer<typeof generationRequestSchema>;
export type Persona = z.infer<typeof personaSchema>;
export type CampaignRequest = z.infer<typeof campaignRequestSchema>;
export type AgentResponse = z.infer<typeof agentResponseSchema>;

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export const agentSystemPrompt = (
  input: GenerationRequest,
): string => {
  const { persona, request } = input;
  const keywords = persona.keywords
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return `You are "Signal Thread", an elite social media marketing strategist that thinks in omnichannel launch systems.
Your job is to translate the brand briefing and campaign objective into:
1. A hero post blueprint for the primary platform
2. Derivative variations for up to 3 other platforms
3. A sequenced publishing calendar across selected channels
4. Engagement choreography outlining community touchpoints
5. KPI guardrails with targets and rationale

Strictly respond in JSON that can be parsed using JSON.parse in JavaScript. Do not add any commentary or markdown.
The JSON must follow this TypeScript shape:
{
  "statement": string;
  "post": {
    "headline": string;
    "caption": string;
    "hashtags": string[];
    "visualDirection": string;
    "callToAction": string;
    "variations": {
      "platform": string;
      "angle": string;
      "caption": string;
    }[];
  };
  "calendar": {
    "dayOffset": number;
    "platform": string;
    "pillar": string;
    "format": string;
    "hook": string;
    "brief": string;
  }[];
  "playbook": {
    "before": string[];
    "during": string[];
    "after": string[];
  };
  "metrics": {
    "kpi": string;
    "target": string;
    "rationale": string;
  }[];
}

Persona summary:
- Brand name: ${persona.brandName}
- Mission: ${persona.mission}
- Voice: ${persona.voice}
- Audience: ${persona.audience}
- Value proposition: ${persona.valueProp}
- Descriptors: ${persona.vibe}
- Content pillars: ${persona.pillars.join(", ")}
- Preferred platforms: ${persona.platforms.join(", ")}
- Keyword anchors: ${keywords.join(", ")}

Campaign briefing:
- Objective: ${request.objective}
- Product or offer: ${request.product}
- Primary platform: ${request.primaryPlatform}
- Preferred format: ${request.formatPreference}
- Tone direction: ${request.tone}
- Spotlight pillar: ${request.focusPillar}
- Call to action: ${request.callToAction}
- Campaign duration: ${request.campaignLength} days

Think in narrative arcs, respect the brand voice, and design staggered channel sequencing inside the calendar array. Include ${keywords.slice(0, 6).join(", ")} across captions and hashtags were relevant.`;
};

export const buildFallbackResponse = (input: GenerationRequest): AgentResponse => {
  const { persona, request } = input;
  const keywords = persona.keywords
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  const sanitizedPillars = persona.pillars.length ? persona.pillars : ["Updates"];
  const sanitizedPlatforms = persona.platforms.length
    ? persona.platforms
    : [request.primaryPlatform || "Instagram"];

  const heroTags = keywords.slice(0, 6).map((keyword) => keyword.replace(/\s+/g, ""));
  const restPlatforms = sanitizedPlatforms.filter(
    (platform) => platform !== request.primaryPlatform,
  );

  const variations = (restPlatforms.length ? restPlatforms : sanitizedPlatforms)
    .slice(0, 3)
    .map((platform, index) => ({
      platform,
      angle: index === 0 ? "Proof" : index === 1 ? "Story" : "Action",
      caption: `Hook: ${request.product} for ${persona.audience} -> show ${sanitizedPillars[index % sanitizedPillars.length].toLowerCase()} angle. CTA: ${request.callToAction}`,
    }));

  const totalDays = Math.max(3, Math.min(21, request.campaignLength));
  const cadence = Math.max(1, Math.floor(totalDays / Math.max(1, sanitizedPlatforms.length)));

  const calendar = sanitizedPlatforms.flatMap((platform, platformIndex) => {
    return sanitizedPillars.slice(0, 3).map((pillar, pillarIndex) => {
      const offset = Math.min(totalDays - 1, platformIndex * cadence + pillarIndex * 2);
      return {
        dayOffset: Math.max(0, offset),
        platform,
        pillar,
        format: platform === "LinkedIn" ? "Long-form post" : platform === "TikTok" ? "Vertical video" : platform === "Instagram" ? "Carousel" : "Story post",
        hook: `${pillar} · ${request.product} insight for ${persona.audience.split(" ")[0] ?? "audience"}`,
        brief: `Expand on ${pillar.toLowerCase()} with ${request.tone.toLowerCase()} tone and push ${request.callToAction.toLowerCase()}.`,
      };
    });
  }).slice(0, 6);

  return {
    statement: `${persona.brandName} campaign ready. Hero asset anchors on ${request.primaryPlatform} with ${request.formatPreference.toLowerCase()}. Variations mapped to ${sanitizedPlatforms.join(", ")} keeping ${request.tone.toLowerCase()}.`,
    post: {
      headline: `${request.product} launch for ${persona.brandName}`,
      caption: `Opening hook about ${request.focusPillar.toLowerCase()} pain → teach key shift → spotlight ${request.product} → invite to ${request.callToAction}. Maintain ${request.tone.toLowerCase()} voice that matches ${persona.voice.toLowerCase()}.`,
      hashtags: heroTags.length ? heroTags : ["socialgrowth", "brandstory"],
      visualDirection: `Design a ${request.formatPreference.toLowerCase()} featuring ${persona.vibe.toLowerCase()} aesthetic. Include bold typography and proof moments.`,
      callToAction: request.callToAction,
      variations,
    },
    calendar,
    playbook: {
      before: [
        "Warm audience via teaser story highlighting the problem.",
        "Queue partner shoutouts requesting co-distribution.",
        `Publish waitlist reminder with ${request.product} sneak peek.`,
      ],
      during: [
        `Host live Q&A on ${request.primaryPlatform} diving into the ${request.focusPillar.toLowerCase()} angle.`,
        "Pin hero post and reply to top comments with micro-case studies.",
        "Trigger email + SMS nudge referencing social proof quotes.",
      ],
      after: [
        "Share analytics recap carousel showing momentum.",
        "Clip best moments into 30s highlight reel for TikTok/YT Shorts.",
        "Collect testimonials and roll into nurture sequence.",
      ],
    },
    metrics: [
      {
        kpi: "Hero post saves",
        target: "3% save rate on launch carousel",
        rationale: "Signals educational resonance for top-of-funnel growth.",
      },
      {
        kpi: "Waitlist conversions",
        target: "15% of warm audience joins template waitlist",
        rationale: "Primary CTA measuring launch effectiveness.",
      },
      {
        kpi: "Cross-channel completion",
        target: "Publish 5/6 recommended touchpoints",
        rationale: "Ensures omni-channel sequencing stays on track.",
      },
    ],
  };
};

export const parseOrFallback = (
  raw: string,
  fallback: AgentResponse,
): AgentResponse => {
  try {
    const parsed = JSON.parse(raw);
    const output = agentResponseSchema.parse(parsed);
    return output;
  } catch (error) {
    console.warn("Failed to parse model output, reverting to fallback", error);
    return fallback;
  }
};

export const modelName = MODEL;
