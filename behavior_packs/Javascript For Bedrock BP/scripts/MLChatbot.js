import { world, system } from "@minecraft/server";
import { INTENT_DEFS } from "./INTENT_DEFS";

const PREFIX = "!ai";
const COOLDOWN_TK = 15;
const MAX_HISTORY = 30;
const LR_POS = 0.08;
const LR_NEG = 0.02;
const CONF_THRESHOLD = 0.15;

const INTENTS = Object.keys(INTENT_DEFS);

const model = {};
const vocab = new Set();
const memory = new Map();
const cdMap = new Map();
let modelDirty = false;

const STOP_WORDS = new Set([
  "ใน",
  "หรือ",
  "ก็",
  "ที่",
  "ของ",
  "กับ",
  "ให้",
  "ได้",
  "ไป",
]);

const TOKENIZE = (text) => {
  const tokens = text
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s?!]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOP_WORDS.has(t));
  const ngrams = [...tokens];
  for (let i = 0; i < tokens.length - 1; i++) {
    ngrams.push(tokens[i] + "_" + tokens[i + 1]);
  }
  return ngrams;
};

const LEVENSHTEIN = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1),
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const FUZZY_MATCH = (token) => {
  if (vocab.has(token)) return token;
  if (token.includes("_")) return token;
  for (const v of vocab) {
    if (!v.includes("_") && Math.abs(token.length - v.length) <= 1) {
      if (LEVENSHTEIN(token, v) <= 1) return v;
    }
  }
  return token;
};

const VECTORIZE = (tokens) => {
  const vec = {};
  tokens.forEach((t) => {
    const matched = FUZZY_MATCH(t);
    vec[matched] = (vec[matched] || 0) + 1;
  });
  return vec;
};

const DOT = (vec, weights) => {
  let s = 0;
  for (const w in vec) s += (weights[w] || 0) * vec[w];
  return s;
};

const SOFTMAX = (scores) => {
  const max = Math.max(...Object.values(scores));
  const exps = {};
  let sum = 0;
  for (const k in scores) {
    exps[k] = Math.exp(scores[k] - max);
    sum += exps[k];
  }
  const probs = {};
  for (const k in exps) probs[k] = exps[k] / sum;
  return probs;
};

const INIT_MODEL = () => {
  INTENTS.forEach((intent) => {
    model[intent] = {};
    INTENT_DEFS[intent].patterns.forEach((p) =>
      TOKENIZE(p).forEach((t) => {
        vocab.add(t);
        model[intent][t] = (model[intent][t] || 0) + 0.6;
      }),
    );
  });
};

const PREDICT = (vec) => {
  const raw = {};
  INTENTS.forEach((intent) => {
    raw[intent] = DOT(vec, model[intent]);
  });

  const probs = SOFTMAX(raw);

  let best = "unknown",
    bestP = 0;
  for (const k in probs) {
    if (probs[k] > bestP) {
      bestP = probs[k];
      best = k;
    }
  }

  if (raw[best] < CONF_THRESHOLD) best = "unknown";

  return { intent: best, score: raw[best], prob: bestP, probs };
};

const TRAIN = (vec, correct) => {
  if (correct === "unknown") return;
  modelDirty = true;
  for (const w in vec) {
    vocab.add(w);
    model[correct][w] = (model[correct][w] || 0) + LR_POS * vec[w];
  }
  INTENTS.forEach((intent) => {
    if (intent === correct) return;
    for (const w in vec)
      model[intent][w] = (model[intent][w] || 0) - LR_NEG * vec[w];
  });
};

const NORMALIZE = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s]/g, "");
};

const AUTO_LABEL = (text) => {
  const normText = NORMALIZE(text);
  for (const [intent, def] of Object.entries(INTENT_DEFS)) {
    if (intent === "unknown") continue;
    if (def.patterns.some((p) => normText.includes(p))) return intent;
  }
  return "unknown";
};

const GET_MEM = (player) => {
  if (!memory.has(player.id)) {
    memory.set(player.id, {
      history: [],
      intentLog: [],
      mood: 0,
      trust: 0,
      msgCount: 0,
      lastIntent: null,
      name: player.name,
    });
  }
  return memory.get(player.id);
};

const UPDATE_MEM = (mem, intent, input) => {
  mem.history.push(input);
  mem.intentLog.push(intent);
  if (mem.history.length > MAX_HISTORY) mem.history.shift();
  if (mem.intentLog.length > MAX_HISTORY) mem.intentLog.shift();

  mem.msgCount++;
  mem.lastIntent = intent;

  if (intent === "greet") mem.trust = Math.min(mem.trust + 1, 25);
  if (intent === "emotion_sad") mem.mood = Math.max(mem.mood - 2, -10);
  if (intent === "emotion_angry") mem.mood = Math.max(mem.mood - 1, -10);
  if (intent === "emotion_happy") mem.mood = Math.min(mem.mood + 2, 10);
};

const ANALYZE_CONTEXT = (mem, intent, input) => {
  const log = mem.intentLog;
  const last = mem.lastIntent;
  const count = mem.msgCount;

  if (count === 0) return "first_time";
  if (intent === "emotion_happy" && last === "emotion_sad") return "recovery";

  const recentSame = log.slice(-4).filter((i) => i === intent).length;
  if (recentSame >= 3) return "repeated_topic";

  if (count >= 15) return "long_session";

  return "normal";
};

const BUILD_RESPONSE = (intent, score, mem, input, player) => {
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const pLoc = player.location;
  const coordsStr = `${Math.floor(pLoc.x)}, ${Math.floor(pLoc.y)}, ${Math.floor(pLoc.z)}`;

  let timeStr = "เช้า/กลางวัน";
  try {
    const timeOfDay = system.currentTick % 24000;
    timeStr = timeOfDay < 12000 ? "กลางวัน" : "กลางคืน";
  } catch (_) {}

  const fill = (str) =>
    str
      .replace(/{name}/g, mem.name)
      .replace(/{input}/g, input.slice(0, 25))
      .replace(/{coords}/g, coordsStr)
      .replace(/{time}/g, timeStr);

  const def = INTENT_DEFS[intent];
  const context = ANALYZE_CONTEXT(mem, intent, input);

  if (def.contextFn) {
    const dynamic = def.contextFn(mem, input);
    if (dynamic) return fill(dynamic);
  }

  if (context === "first_time" && intent === "greet")
    return fill(`ยินดีที่ได้รู้จัก {name}! ฉันชื่อ AI นะ คุยกันได้เลย`);

  if (context === "recovery") return fill(`ดีใจที่ {name} รู้สึกดีขึ้นนะ`);

  if (context === "repeated_topic")
    return fill(`{name} ดูสนใจเรื่องนี้มากเลยนะ บอกมาเพิ่มได้เลย`);

  if (context === "long_session" && intent !== "bye")
    return fill(`คุยมาหลายเรื่องแล้วนะ {name} มีอะไรอยากสรุปหรือถามเพิ่มไหม?`);

  if (mem.mood <= -5 && intent !== "emotion_sad")
    return fill(`{name} ดูไม่ค่อยสบายใจเลย มีอะไรให้ช่วยไหม?`);

  if (mem.trust === 5)
    return fill(`คุยด้วยบ่อยเลยนะ {name} เป็นเพื่อนที่ดีมาก`);

  return fill(rand(def.replies));
};

INIT_MODEL();

world.beforeEvents.chatSend.subscribe((ev) => {
  const player = ev.sender;
  const raw = ev.message;

  if (!raw.startsWith(PREFIX)) return;
  ev.cancel = true;

  if (raw === "!ai-debug") {
    const mem = GET_MEM(player);
    player.sendMessage("§e════════ AI DEBUG ════════");
    player.sendMessage(`§7Player : §f${mem.name}`);
    player.sendMessage(
      `§7Msgs   : §f${mem.msgCount}   Trust: §f${mem.trust}   Mood: §f${mem.mood}`,
    );
    player.sendMessage(`§7Vocab  : §f${vocab.size} tokens`);
    player.sendMessage(
      `§7Last 5 intents: §f${mem.intentLog.slice(-5).join(" → ")}`,
    );
    player.sendMessage("§e── Top weights per intent ──");
    INTENTS.forEach((intent) => {
      const top = Object.entries(model[intent])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([w, v]) => `${w}:${v.toFixed(2)}`)
        .join("  ");
      player.sendMessage(`§b${intent.padEnd(14)} §f${top || "(empty)"}`);
      console.log(`§b${intent.padEnd(14)} §f${top || "(empty)"}`);
    });
    player.sendMessage("§e══════════════════════════");
    return;
  }

  if (raw === "!ai-reset") {
    memory.delete(player.id);
    player.sendMessage("§aMemory reset สำเร็จ! เริ่มต้นใหม่ได้เลย");
    return;
  }

  if (raw === "!ai-json") {
    const mem = GET_MEM(player);
    const data = {
      player: mem.name,
      history: mem.history,
      intentLog: mem.intentLog,
      mood: mem.mood,
      trust: mem.trust,
    };
    console.warn(`[AI-JSON: ${mem.name}] \n` + JSON.stringify(data, null, 2));
    player.sendMessage(
      "§aส่งข้อมูลประวัติการคุยไปยัง Server Console เรียบร้อยแล้ว!",
    );
    return;
  }

  const now = system.currentTick;
  if ((cdMap.get(player.id) || 0) > now) {
    player.sendMessage("§c⏳ รอแป๊บนึงก่อนนะ");
    return;
  }
  cdMap.set(player.id, now + COOLDOWN_TK);

  const input = raw.slice(PREFIX.length).trim();
  if (!input) {
    player.sendMessage("§7พิมพ์ข้อความหลัง !ai ได้เลย เช่น  !ai สวัสดี");
    return;
  }

  const tokens = TOKENIZE(input);
  if (tokens.length === 0) {
    player.sendMessage("§7💬 ไม่เจอคำที่ระบบโฟกัสได้ ลองเปลี่ยนคำถามใหม่นะ");
    return;
  }

  const vec = VECTORIZE(tokens);
  const { intent, score, prob } = PREDICT(vec);
  const mem = GET_MEM(player);

  const reply = BUILD_RESPONSE(intent, score, mem, input, player);

  const intentColor = {
    greet: "§a",
    help: "§b",
    question: "§e",
    emotion_sad: "§9",
    emotion_angry: "§c",
    emotion_happy: "§6",
    weather: "§3",
    craft: "§d",
    status: "§2",
    joke: "§d",
    compliment: "§a",
    insult: "§c",
    time: "§3",
    location: "§e",
    combat: "§4",
    general_chat: "§b",
    food_chat: "§6",
    hobby_chat: "§d",
    bedrock_knowledge: "§d",
    gameplay_tips: "§a",
    love_chat: "§d",
    tired_chat: "§7",
    work_study_chat: "§b",
    server_chat: "§e",
    life_chat: "§a",
    health: "§c",
    money: "§6",
    relationship: "§d",
    stress: "§5",
    daily: "§e",
    learning: "§b",
    ai_meta: "§3",
    suggest_place: "§a",
    daily_planning: "§e",
    opinion: "§d",
    preference: "§6",
    activity_status: "§b",
    thank_you: "§a",
    apology: "§e",
    agreement: "§a",
    disagreement: "§c",
    laughing: "§e",
    encouragement: "§d",
    bot_identity: "§3",
    lonely_chat: "§9",
    complaint: "§7",
    goodnight: "§8",
    toxic: "§4",
    pets_chat: "§6",
    bye: "§7",
    unknown: "§8",
  };
  const col = intentColor[intent] || "§f";
  const accuracy = prob ? (prob * 100).toFixed(1) : "0.0";
  player.sendMessage(`[AI ${col}${intent} §6${accuracy}%§f] §f${reply}`);

  const label = AUTO_LABEL(input);
  TRAIN(vec, label);

  UPDATE_MEM(mem, intent, input);
});

world.afterEvents.playerLeave.subscribe((ev) => {
  memory.delete(ev.playerId);
  cdMap.delete(ev.playerId);
});
