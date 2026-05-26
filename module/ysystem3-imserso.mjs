import { IMSERSO, defaultSkills, labelForSkill } from "/systems/ysystem3-srd/module/config.mjs";
import { ImsersoActorSheet, ImsersoItemSheet } from "/systems/ysystem3-srd/module/sheets.mjs";
import { YsystemCharacterCreator } from "/systems/ysystem3-srd/module/character-creator.mjs";

const MODULE_ID = "ysystem3-imserso";
const SYSTEM_ID = "ysystem3-srd";
const THEME_CLASS = "ysystem3-imserso-theme";
const MODULE_ROOT = `modules/${MODULE_ID}`;
const ASSET_ROOT = `${MODULE_ROOT}/assets`;
const ITEM_ICON_PATH = `${ASSET_ROOT}/icons`;
const BRANDING_PATH = `${ASSET_ROOT}/branding`;
const RANDOM_PLACES = [
  "recepcion del hotel",
  "autobus de excursion",
  "comedor del buffet",
  "salon de bingo",
  "paseo maritimo",
  "balneario",
  "mercadillo local",
  "museo municipal",
  "verbena nocturna",
  "consulta del centro de salud",
  "bar de la esquina",
  "cola del ascensor"
];

let localization = {};
let generatorTables = {};

Hooks.once("init", async () => {
  if (game.system.id !== SYSTEM_ID) {
    console.warn(`${MODULE_ID} | Este modulo solo se activa sobre ${SYSTEM_ID}. Sistema actual: ${game.system.id}`);
    return;
  }

  console.log(`${MODULE_ID} | Inicializando variante IMSERSO to the Limit`);
  [localization, generatorTables] = await Promise.all([
    loadModuleJson("lang/es.json"),
    loadModuleJson("data/imserso-generator-tables.json")
  ]);

  registerSettings();
  registerHandlebarsHelpers();
  await preloadTemplates();
  registerSheets();

  game.ysystem3Imserso = {
    id: MODULE_ID,
    themeClass: THEME_CLASS,
    localization,
    generatorTables,
    openCharacterCreator: openImsersoCreator,
    term,
    uiText,
    help
  };

  if (game.ysystem3Srd) game.ysystem3Srd.openCharacterCreator = openImsersoCreator;
  if (game.ysystem) game.ysystem.openCharacterCreator = openImsersoCreator;
});

Hooks.once("ready", () => {
  if (game.system.id !== SYSTEM_ID) return;
  applyGlobalThemeClass();
  rerenderSystemApps();
});

Hooks.on("renderActorSheet", (app, html) => applyAppTheme(app, html));
Hooks.on("renderItemSheet", (app, html) => applyAppTheme(app, html));
Hooks.on("renderChatMessage", (_message, html) => {
  if (game.system.id !== SYSTEM_ID) return;
  const root = asJQuery(html);
  if (root.find(".ims-chat-card").length) root.addClass(`ims-chat-message ${THEME_CLASS}`);
  root.find(".ims-chat-card").addClass(THEME_CLASS);
  localizeRenderedText(root[0]);
});
Hooks.on("renderDialog", (app, html) => applyAppTheme(app, html));
Hooks.on("renderApplication", (app, html) => applyAppTheme(app, html));
Hooks.on("renderActorDirectory", (_app, html) => injectDirectoryControls(html));

Hooks.on("createActor", (actor) => {
  if (game.system.id !== SYSTEM_ID) return;
  actor.sheet?.rendered && actor.sheet.render(true);
});

Hooks.on("closeApplication", () => {
  document.querySelectorAll(".ims-context-help").forEach((el) => el.remove());
});

function registerSettings() {
  game.settings.register(MODULE_ID, "forceSheets", {
    name: "Usar hojas IMSERSO",
    hint: "Registra las hojas tematizadas del modulo como hojas por defecto para PJ, PNJ e items de ysystem3-srd.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => {
      registerSheets();
      rerenderSystemApps();
    }
  });
  game.settings.register(MODULE_ID, "directoryButtons", {
    name: "Botones de generador IMSERSO",
    hint: "Muestra accesos rapidos al generador de jubilados y PNJ en el directorio de actores.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true
  });
}

function registerSheets() {
  const ActorsCls = foundry.documents.collections.Actors ?? globalThis.Actors;
  const ItemsCls = foundry.documents.collections.Items ?? globalThis.Items;
  if (!game.settings.get(MODULE_ID, "forceSheets")) {
    ActorsCls.unregisterSheet?.(MODULE_ID, ImsersoVariantActorSheet);
    ItemsCls.unregisterSheet?.(MODULE_ID, ImsersoVariantItemSheet);
    return;
  }

  ActorsCls.registerSheet(MODULE_ID, ImsersoVariantActorSheet, {
    types: ["personaje", "pnj"],
    makeDefault: true,
    label: "IMSERSO to the Limit"
  });
  ItemsCls.registerSheet(MODULE_ID, ImsersoVariantItemSheet, {
    makeDefault: true,
    label: "IMSERSO to the Limit"
  });
}

async function preloadTemplates() {
  const templates = [
    "templates/actor/personaje-sheet.hbs",
    "templates/actor/personaje-sheet-a4.hbs",
    "templates/actor/pnj-sheet.hbs",
    "templates/actor/pnj-sheet-a4.hbs",
    "templates/item/item-sheet.hbs",
    "templates/apps/character-creator.hbs",
    "templates/chat/roll-card.hbs",
    "templates/chat/initiative-card.hbs"
  ].map((path) => `${MODULE_ROOT}/${path}`);
  if (globalThis.loadTemplates) await loadTemplates(templates);
  else if (foundry.applications?.handlebars?.loadTemplates) await foundry.applications.handlebars.loadTemplates(templates);
}

function registerHandlebarsHelpers() {
  Handlebars.registerHelper("imsTerm", (key) => term(key));
  Handlebars.registerHelper("imsUI", (key) => uiText(key));
  Handlebars.registerHelper("imsHelpTitle", (key) => help(key).title);
  Handlebars.registerHelper("imsHelpText", (key) => help(key).text);
  Handlebars.registerHelper("imsItemIcon", (type) => iconForItemType(type));
}

export class ImsersoVariantActorSheet extends ImsersoActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["imserso", "sheet", "actor", THEME_CLASS]
    });
  }

  get template() {
    const layout = game.settings?.get?.(IMSERSO.ID, "sheetLayout") ?? "screen";
    const suffix = layout === "a4" ? "-a4" : "";
    return `${MODULE_ROOT}/templates/actor/${this.actor.type}-sheet${suffix}.hbs`;
  }

  async getData() {
    const context = await super.getData();
    context.themeClass = THEME_CLASS;
    context.logoPath = `${BRANDING_PATH}/module-icon.png`;
    context.sheetHeaderPath = `${BRANDING_PATH}/sheet-header.png`;
    context.watermarkPath = `${BRANDING_PATH}/watermark.webp`;
    context.imsHelp = localization.help ?? {};
    context.imsLabels = localization.terms ?? {};

    context.itemSections = Object.entries(context.itemsByType ?? {})
      .filter(([, items]) => items.length)
      .map(([key, items]) => ({ key, label: term(key), icon: iconForItemType(key), items }));
    context.itemCreateTypes = [
      { type: "arma", label: term("arma"), icon: "fa-gavel" },
      { type: "armadura", label: term("armadura"), icon: "fa-vest" },
      { type: "escudo", label: term("escudo"), icon: "fa-shield-halved" },
      { type: "objeto", label: term("objeto"), icon: "fa-suitcase" },
      { type: "poder", label: term("poder"), icon: "fa-wand-sparkles" },
      { type: "talento", label: term("talento"), icon: "fa-star" },
      { type: "arquetipo", label: term("arquetipo"), icon: "fa-id-card" }
    ];
    return context;
  }

  _openContextHelp(target, x, y, options = {}) {
    const entry = target.dataset.itemId
      ? this._itemHelp(target.dataset.itemId)
      : contextualHelp(target.dataset.helpType, target.dataset.helpKey);
    if (entry) return this._renderHelpPopover(entry, x, y, options);
    return super._openContextHelp(target, x, y, options);
  }

  _itemHelp(itemId) {
    const item = this.actor.items.get(itemId);
    if (!item) return null;
    const system = item.system ?? {};
    const details = [];
    if (item.type) details.push(`Tipo: ${term(item.type)}`);
    if (system.equipado !== undefined) details.push(system.equipado ? "En la maleta de mano" : "Guardado en el equipaje");
    if (system.uso) details.push(`Uso: ${system.uso}`);
    if (system.automatismo) details.push(`Atajo: ${system.automatismo}`);
    return {
      title: item.name,
      subtitle: `${term(item.type)} IMSERSO`,
      body: system.descripcion || system.uso || "Sin descripcion escrita todavia.",
      details
    };
  }

  _renderHelpPopover(entry, x, y, { hover = false } = {}) {
    document.querySelectorAll(".ims-context-help").forEach((el) => el.remove());
    const pop = document.createElement("aside");
    pop.className = `ims-context-help ${THEME_CLASS}${hover ? " hover-help" : ""}`;
    pop.innerHTML = `
      <button type="button" class="ims-help-close" aria-label="Cerrar"><i class="fas fa-xmark"></i></button>
      <header>
        <span>${escapeHtml(uiText("help"))}</span>
        <h2>${escapeHtml(entry.title)}</h2>
        ${entry.subtitle ? `<p>${escapeHtml(entry.subtitle)}</p>` : ""}
      </header>
      <div class="ims-help-body">
        <p>${escapeHtml(entry.body ?? entry.text ?? "")}</p>
        ${entry.details?.length ? `<ul>${entry.details.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>` : ""}
      </div>`;
    document.body.appendChild(pop);
    const rect = pop.getBoundingClientRect();
    const left = Math.min(window.innerWidth - rect.width - 12, Math.max(12, (Number.isFinite(x) ? x : 24) + 10));
    const top = Math.min(window.innerHeight - rect.height - 12, Math.max(12, (Number.isFinite(y) ? y : 24) + 10));
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
    pop.querySelector(".ims-help-close")?.addEventListener("click", () => pop.remove());
    if (hover) {
      pop.addEventListener("mouseenter", () => this._clearContextHelpTimer());
      pop.addEventListener("mouseleave", () => pop.remove());
    }
    const close = (ev) => {
      if (!pop.contains(ev.target)) {
        pop.remove();
        document.removeEventListener("mousedown", close, true);
      }
    };
    window.setTimeout(() => document.addEventListener("mousedown", close, true), 0);
  }
}

export class ImsersoVariantItemSheet extends ImsersoItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["imserso", "sheet", "item", THEME_CLASS]
    });
  }

  get template() {
    return `${MODULE_ROOT}/templates/item/item-sheet.hbs`;
  }

  async getData() {
    const context = await super.getData();
    context.themeClass = THEME_CLASS;
    context.itemTypeLabel = term(this.item.type);
    context.itemIcon = iconForItemType(this.item.type);
    context.logoPath = `${BRANDING_PATH}/module-icon.png`;
    return context;
  }
}

export class ImsersoCharacterCreator extends YsystemCharacterCreator {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "ysystem3-imserso-character-creator",
      classes: ["imserso", "ims-creator-app", "ys-creator-app", THEME_CLASS],
      title: uiText("generatorTitlePJ"),
      template: `${MODULE_ROOT}/templates/apps/character-creator.hbs`
    });
  }

  get title() {
    return this.state.actorType === "pnj" ? uiText("generatorTitlePNJ") : uiText("generatorTitlePJ");
  }

  getData() {
    const context = super.getData();
    context.themeClass = THEME_CLASS;
    context.imsHelp = localization.help ?? {};
    context.imsGeneratorSummary = this._generatorSummary();
    return context;
  }

  async _randomCharacter({ announce = true } = {}) {
    this._readForm();
    const generated = await buildRandomPj(this.state);
    this.state.mode = "aleatorio";
    this.state.name = generated.name;
    this.state.atributos = generated.atributos;
    this.state.habilidades = generated.habilidades;
    this.state.healthRoll = generated.healthRoll;
    this.state.datos = { ...this.state.datos, ...generated.datos };
    this.state.defectos = generated.defectos;
    this.state.step = this.steps.findIndex((step) => step.key === "resumen");
    this._imsGeneratorSummary = generated.summary;
    if (announce) await ChatMessage.create({
      speaker: this.actor ? ChatMessage.getSpeaker({ actor: this.actor }) : { alias: uiText("generatorTitlePJ") },
      content: imsChatCard("Jubilado preparado", [
        `<strong>${escapeHtml(generated.name)}</strong> · ${escapeHtml(generated.summary.arquetipo)}.`,
        `<strong>${term("profesion")}:</strong> ${escapeHtml(generated.summary.oficio)}.`,
        `<strong>${term("achaque")}:</strong> ${escapeHtml(generated.summary.achaque)}.`,
        `<strong>Objetivo:</strong> ${escapeHtml(generated.summary.objetivo)}.`,
        `<strong>3D:</strong> ${escapeHtml(generated.selected3.map(labelForSkill).join(", "))}.`
      ])
    });
    this.render(false);
  }

  async _randomPnj() {
    this._readForm();
    const generated = await buildRandomPnj(this.state);
    this.state.name = generated.name;
    this.state.atributos = generated.atributos;
    this.state.habilidades = generated.habilidades;
    this.state.healthRoll = generated.healthRoll;
    this.state.pnj = { ...this.state.pnj, ...generated.pnj };
    this.state.step = this.steps.findIndex((step) => step.key === "resumen");
    this._imsGeneratorSummary = generated.summary;
    await ChatMessage.create({
      speaker: this.actor ? ChatMessage.getSpeaker({ actor: this.actor }) : { alias: uiText("generatorTitlePNJ") },
      content: imsChatCard("PNJ del viaje preparado", [
        `<strong>${escapeHtml(generated.name)}</strong> · ${escapeHtml(generated.summary.rol)}.`,
        `<strong>Secreto:</strong> ${escapeHtml(generated.summary.secreto)}.`,
        `<strong>Aparicion:</strong> ${escapeHtml(generated.summary.lugar)}.`
      ])
    });
    this.render(false);
  }

  _rollDefects() {
    this._readForm();
    const achaque = choice(generatorTables.achaques);
    const quirk = choice(generatorTables.quirks);
    this.state.defectos.leve = `${term("achaque")}: ${achaque}.`;
    this.state.defectos.grave = `Mania peligrosa: ${quirk}.`;
    this.render(false);
  }

  _generatorSummary() {
    return this._imsGeneratorSummary ?? null;
  }
}

function openImsersoCreator(actorOrOptions = null) {
  return new ImsersoCharacterCreator(actorOrOptions).render(true);
}

async function buildRandomPj(base) {
  const attrKeys = Object.keys(IMSERSO.atributos);
  const attrValues = shuffle([0, 1, 2, 4, 6]);
  const atributos = Object.fromEntries(attrKeys.map((key, index) => [key, attrValues[index]]));
  const habilidades = defaultSkills(1);
  const skillKeys = shuffle(Object.keys(IMSERSO.habilidades));
  const selected3 = skillKeys.slice(0, 4);
  const selected2 = skillKeys.slice(4, 12);
  for (const key of selected3) habilidades[key] = { dados: 3 };
  for (const key of selected2) habilidades[key] = { dados: 2 };
  const healthRoll = await rollD6();
  const first = choice(generatorTables.firstNames);
  const surname = choice(generatorTables.surnames);
  const nickname = Math.random() < 0.55 ? ` "${choice(generatorTables.nicknames)}"` : "";
  const name = keepExistingName(base.name, `${first} ${surname}${nickname}`);
  const oficio = choice(generatorTables.formerProfessions);
  const origen = choice(generatorTables.origins);
  const achaque = choice(generatorTables.achaques);
  const talante = choice(generatorTables.attitudes);
  const aficion = choice(generatorTables.hobbies);
  const objetivo = choice(generatorTables.tripGoals);
  const arquetipo = choice(generatorTables.pjArchetypes);
  const mania = choice(generatorTables.quirks);
  return {
    name,
    atributos,
    habilidades,
    healthRoll,
    selected3,
    selected2,
    datos: {
      jugador: base.datos?.jugador ?? game.user.name ?? "",
      lugarNacimiento: origen,
      edad: String(63 + Math.floor(Math.random() * 22)),
      profesion: oficio,
      perfil: arquetipo,
      motivacion: `Objetivo del viaje: ${objetivo}.`,
      descripcionFisica: `${capitalize(talante)}. Aficion: ${aficion}. Achaque visible: ${achaque}.`,
      situacionFamiliar: `Viaja desde ${origen}; ${mania}.`
    },
    defectos: {
      leve: `${term("achaque")}: ${achaque}.`,
      grave: `Orgullo de jubilado: ${talante}; ${mania}.`
    },
    summary: { oficio, origen, achaque, talante, aficion, objetivo, arquetipo }
  };
}

async function buildRandomPnj(base) {
  const attrKeys = Object.keys(IMSERSO.atributos);
  const atributos = Object.fromEntries(attrKeys.map((key) => [key, Math.floor(Math.random() * 5)]));
  const habilidades = defaultSkills(1);
  const skillKeys = shuffle(Object.keys(IMSERSO.habilidades));
  const selected3 = skillKeys.slice(0, 2);
  const selected2 = skillKeys.slice(2, 7);
  for (const key of selected3) habilidades[key] = { dados: 3 };
  for (const key of selected2) habilidades[key] = { dados: 2 };
  const healthRoll = await rollD6();
  const name = keepExistingName(base.name, `${choice(generatorTables.firstNames)} ${choice(generatorTables.surnames)}`);
  const rol = choice(generatorTables.npcRoles);
  const secreto = choice(generatorTables.npcSecrets);
  const rasgo = choice(generatorTables.quirks);
  const actitud = choice(generatorTables.attitudes);
  const lugar = choice(RANDOM_PLACES);
  const colectivo = choice(generatorTables.namesPNJCollectives);
  return {
    name,
    atributos,
    habilidades,
    healthRoll,
    pnj: {
      rol,
      bando: actitud,
      descripcion: `${capitalize(actitud)}; ${rasgo}. Suele aparecer en ${lugar}.`,
      notas: `Secreto: ${secreto}. Vinculo: ${colectivo}. Especialidades: ${selected3.concat(selected2).map(labelForSkill).join(", ")}.`
    },
    summary: { rol, secreto, rasgo, actitud, lugar, colectivo }
  };
}

async function loadModuleJson(path) {
  const response = await fetch(`${MODULE_ROOT}/${path}`);
  if (!response.ok) throw new Error(`${MODULE_ID} | No se pudo cargar ${path}`);
  return response.json();
}

async function rollD6() {
  const roll = await new Roll("1d6").evaluate({ async: true });
  return roll.total;
}

function contextualHelp(type, key) {
  if (type === "rule") {
    const mapped = {
      proezas: "yayopuntos",
      salud: "salud",
      estabilidad: "estabilidad",
      resistenciaFisica: "rf",
      resistenciaMental: "rm",
      defectos: "achaque",
      puntoGuion: "yayopuntos"
    }[key];
    if (mapped) {
      const entry = help(mapped);
      return { title: entry.title, body: entry.text, subtitle: term(mapped === "yayopuntos" ? "proezas" : mapped) };
    }
  }
  if (type === "section") {
    const mapped = { datos: "profesion", arquetipos: "achaque", pertenencias: "equipo" }[key];
    if (mapped) {
      const entry = help(mapped);
      return { title: entry.title, body: entry.text, subtitle: uiText("help") };
    }
  }
  return null;
}

function term(key) {
  const direct = localization.terms?.[key];
  if (direct) return direct;
  const aliases = {
    resource: "proezas",
    resistancePhysical: "rf",
    resistanceMental: "rm",
    logoMark: "pj",
    logoScript: "moduleTitle"
  };
  if (aliases[key] === "moduleTitle") return uiText("moduleTitle");
  return localization.terms?.[aliases[key]] ?? key;
}

function uiText(key) {
  return localization.ui?.[key] ?? key;
}

function help(key) {
  return localization.help?.[key] ?? { title: key, text: "" };
}

function iconForItemType(type) {
  const mapped = {
    arma: "arma",
    armadura: "armadura",
    escudo: "escudo",
    objeto: "objeto",
    poder: "poder",
    talento: "talento",
    arquetipo: "arquetipo",
    equipo: "equipo"
  }[type];
  return mapped ? `${ITEM_ICON_PATH}/${mapped}.webp` : "";
}

function applyGlobalThemeClass() {
  document.body?.classList.add(THEME_CLASS);
  document.body?.classList.add("ys-imserso-module-active");
}

function applyAppTheme(app, html) {
  if (game.system.id !== SYSTEM_ID) return;
  const jq = asJQuery(html);
  const root = jq.closest(".window-app")[0] ?? app?.element?.[0] ?? jq[0];
  root?.classList?.add(THEME_CLASS);
  jq.find(".ims-sheet, .ys-screen-sheet, .ys-a4-sheet, .ims-item, .ims-creator, .ims-chat-card").addClass(THEME_CLASS);
}

function injectDirectoryControls(html) {
  if (game.system.id !== SYSTEM_ID) return;
  if (!game.user.isGM || !game.settings.get(MODULE_ID, "directoryButtons")) return;
  const jq = asJQuery(html);
  jq.find("[data-ys3-imserso-directory]").remove();
  const controls = $(`
    <div class="ys-directory-create ysystem3-imserso-directory" data-ys3-imserso-directory>
      <button type="button" data-ims-create-personaje><i class="fas fa-id-card"></i> ${escapeHtml(uiText("createCharacter"))}</button>
      <button type="button" data-ims-create-pnj><i class="fas fa-user-shield"></i> ${escapeHtml(uiText("createNPC"))}</button>
    </div>
  `);
  const target = jq.find(".directory-header .header-actions, .directory-header, .directory-footer").first();
  if (target.length) target.append(controls);
  else jq.prepend(controls);
  controls.find("[data-ims-create-personaje]").on("click", () => openImsersoCreator({ type: "personaje" }));
  controls.find("[data-ims-create-pnj]").on("click", () => openImsersoCreator({ type: "pnj" }));
}

function rerenderSystemApps() {
  for (const app of Object.values(ui.windows ?? {})) {
    if ((app?.actor?.type || app?.item?.type) && app.render) app.render(true);
  }
}

function localizeRenderedText(root) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const replacements = [
    [/proezas/gi, term("proezas")],
    [/proeza/gi, term("proezas").replace(/s$/, "")],
    [/armadura/gi, term("armadura")],
    [/escudo/gi, term("escudo")],
    [/poder/gi, term("poder")]
  ];
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    let value = node.nodeValue;
    for (const [pattern, replacement] of replacements) value = value.replace(pattern, replacement);
    node.nodeValue = value;
  }
}

function imsChatCard(title, lines) {
  return `
    <div class="ims-chat-card ims-imserso-card ${THEME_CLASS}">
      <header><img src="${BRANDING_PATH}/module-icon.png" alt=""><h3>${escapeHtml(title)}</h3></header>
      ${lines.map((line) => `<p>${line}</p>`).join("")}
    </div>`;
}

function keepExistingName(name, fallback) {
  const value = String(name ?? "").trim();
  if (!value || /^(nuevo|nueva|actor|personaje|pj|pnj)\b/i.test(value)) return fallback;
  return value;
}

function asJQuery(html) {
  if (html?.find) return html;
  return $(html);
}

function choice(array = []) {
  if (!array.length) return "";
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function capitalize(value) {
  const text = String(value ?? "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
