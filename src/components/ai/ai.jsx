import { NICHE_INTEL, GENERAL_INTEL } from "./intelligence";

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const KNOWLEDGE_BASE = [
  { q: "Give me a caption for my products", intent: "caption" },
  { q: "Help me ask a customer for my money", intent: "debt_reminder" },
  { q: "How should I price my items?", intent: "pricing" },
  { q: "I need a marketing tip", intent: "marketing" },
];

export function detectIntent(text = "") {
  const t = text.toLowerCase();

  if (/\b(best|performing|top|niche|business)\b/.test(t)) return "niche_performance";
  if (/\b(advice|consultant|tips|help)\b/.test(t)) return "consultant_advice";
  if (/\b(caption|post|status|write)\b/.test(t)) return "caption";
  if (/\b(price|pricing|cost|charge)\b/.test(t)) return "pricing";
  if (/\b(marketing|ads|promote|sell)\b/.test(t)) return "marketing";
  if (/\b(hi|hello|hey|greetings|yo)\b/.test(t)) return "greeting";
  if (/\b(sales|slow|motivation)\b/.test(t)) return "motivation";

  if (/\b(debt|money|owing|remind|pay me|payment)\b/.test(t))
    return "debt_reminder";
  return "general";
}

export function generateResponse({ query = "", user = {}, stats = {} }) {
  const queryText = typeof query === "string" ? query : query.q || "";
  const intent = detectIntent(queryText);

  const history = JSON.parse(localStorage.getItem("gainly_history") || "[]");
  const lastAction =
    history.length > 0 ? history[history.length - 1].action : null;

  const category = user.category || "General Vendor";
  const niche = NICHE_INTEL[category] || {};
  const firstName = user.fullname ? user.fullname.split(" ")[0] : "CEO";
  const businessName = user.bname || "your business";

  const ctx = { firstName, businessName, category };

  switch (intent) {
    case "greeting": {
      if (lastAction === "viewed_debts") {
        return `Hi ${ctx.firstName}, I saw you checking your debt list. Do you want me to write a polite reminder message you can send to those customers?`;
      }
      if (lastAction === "cleared_debt") {
        return `Nice one ${ctx.firstName}! Marking that debt as paid is a win for your cash flow. Ready to log another sale?`;
      }
      if (lastAction === "logged_a_sale") {
        return `Boom! 🚀 Another sale logged. Your momentum is great today. Should I generate a 'Sold Out' caption for your status?`;
      }

      const greet = pickRandom(
        GENERAL_INTEL.greetings || ["Hello {firstName}!"],
      );
      return greet.replace("{firstName}", ctx.firstName);
    }
    case "niche_performance": {
    return `Looking at your records, your ${ctx.category} business is doing well, but don't forget to track your costs for ${ctx.businessName} to ensure your margins stay high!`;
}

    case "debt_reminder": {
      const templates = [
        `"Hi! Hope your day is going well. I’m just doing a quick follow-up on the balance for your ${ctx.category} order from {businessName}. Please let me know when I should expect it. Thanks!"`,
        `"Hello! Just a friendly reminder about your outstanding payment for the items picked up recently. It helps me restock so I can keep serving you better! 🙏"`,
        `"Hi there! Checking in to see if you've had a chance to look at the invoice for your last order. No rush, just keeping my records updated! 😊"`,
      ];
      return pickRandom(templates).replace("{businessName}", ctx.businessName);
    }

    case "caption": {
      const cap =
        niche.captions && niche.captions.length > 0
          ? pickRandom(niche.captions)
          : "New stock alert at {businessName}! Quality {category} available. DM to order.";
      return cap
        .replace("{businessName}", ctx.businessName)
        .replace("{category}", ctx.category);
    }

    case "marketing": {
      return (
        niche.marketing ||
        "Consistency is key! Post your products on your WhatsApp status daily."
      );
    }

    case "pricing": {
      const costMatch = queryText.match(/\d+/);
      if (costMatch) {
        const cost = parseInt(costMatch[0]);
        const price = Math.round(cost * 2.2);
        return `Since your cost is ₦${cost.toLocaleString()}, I suggest selling for ₦${price.toLocaleString()}. ${niche.pricing_advice || ""}`;
      }
      return "Standard rule for vendors: Multiply your cost by 2.2 to cover data, transport, and profit.";
    }

    case "motivation": {
      return pickRandom(GENERAL_INTEL.motivation || ["Keep pushing!"]).replace(
        "{firstName}",
        ctx.firstName,
      );
    }

    default:
      return `Hi ${ctx.firstName}, I can help you with captions for ${ctx.category}, debt reminders, or pricing advice. What do you need?`;
  }
}
