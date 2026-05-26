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
const LOGO_PATH = `${BRANDING_PATH}/imserso-logo.webp`;
const MODE_YSYSTEM3 = "ysystem3";
const MODE_CLASSIC = "classic";
const IMS_ATTRS_YSYSTEM3 = {
  car: { label: "Don de gentes", short: "Don", body: "Presencia, labia, simpatia y capacidad para convencer al grupo, al recepcionista o a quien haga falta." },
  des: { label: "Soltura", short: "Paso", body: "Movimiento, reflejos, sigilo, equilibrio y manejo fino de las manos cuando la excursion se complica." },
  fue: { label: "Aguante", short: "Brio", body: "Fuerza, constitucion y capacidad para seguir en pie despues de cuestas, empujones, golpes o buffet libre." },
  int: { label: "Sabiduria", short: "Saber", body: "Cabeza, memoria, cultura practica y capacidad para entender lo que esta pasando antes que los demas." },
  per: { label: "Vista", short: "Vista", body: "Sentidos, atencion al detalle, punteria y habilidad para ver venir el lio desde la otra punta del paseo maritimo." }
};
const IMS_SKILLS_YSYSTEM3 = {
  atletismo: "Paseo y escaleras",
  auxilio: "Botiquin",
  conducir: "Volante",
  conversacion: "Chachara",
  cultura: "Cultura de almanaque",
  entorno: "Callejeo turistico",
  fuerzaBruta: "Tirar de rinon",
  idiomaExtranjero1: "Chapurrear I",
  idiomaExtranjero2: "Chapurrear II",
  informacion: "Papeleo y movil",
  intimidacion: "Bronca",
  lucha: "Manotazo",
  mecanica: "Manitas",
  memoria: "Batallitas",
  observacion: "Ojo avizor",
  ocultacion: "Esconder el tupper",
  oido: "Oido fino",
  psicologia: "Calar al personal",
  punteria: "Tino",
  rastreo: "Seguir la pista",
  seduccion: "Piquito de oro",
  sigilo: "Pasar sin ruido",
  simulacion: "Disimulo",
  supervivencia: "Apañarse"
};
const IMS_FIXED_YSYSTEM3 = {
  agilidad: "Reflejos",
  aplomo: "Temple",
  perspicacia: "Ojo clinico"
};
const CLASSIC_ATTRS = {
  int: {
    label: "Cacumen",
    short: "CAC",
    body: "Lo listo que es el personaje, lo bien que piensa y razona, lo agudos que son sus sentidos y, de forma indirecta, su firmeza mental."
  },
  car: {
    label: "Gracejo",
    short: "GRA",
    body: "Carisma y capacidad para relacionarse con otros, convencerlos y venderles la moto cuando hace falta."
  },
  des: {
    label: "Presteza",
    short: "PRE",
    body: "Agilidad, sigilo, destreza manual, punteria, reflejos y equilibrio."
  },
  fue: {
    label: "Robustez",
    short: "ROB",
    body: "Fuerza fisica, capacidad para levantar pesos o romper cosas, constitucion y Salud."
  }
};
const CLASSIC_SKILLS = {
  auxilio: { label: "Ambulatorio", attr: "int", body: "Hablar con el medico, entender lo que dice, diagnosticar dolencias, recomendar medicamentos y aplicar primeros auxilios." },
  mecanica: { label: "Archiperres", attr: "des", body: "Usar, abrir, cerrar o arreglar maquinas, herramientas y mecanismos. Tambien cubre conducir, reparar cacharros y maniobrar con una silla de ruedas." },
  conversacion: { label: "Batallitas", attr: "car", body: "Dominar una conversacion contando vivencias personales, entretener a alguien o ahuyentar a gente joven." },
  supervivencia: { label: "Cosas del campo", attr: "des", body: "Trabajos de huerta, campo y pueblo: carretillas, zanjas, podas, fuegos, supervivencia, rastreo y distinguir lo comestible." },
  simulacion: { label: "Cotilleo", attr: "car", body: "Enterarse de rumores y secretos, sonsacar informacion, mentir, hacerse pasar por otra persona e interpretar intenciones." },
  intimidacion: { label: "Discusion", attr: "car", body: "Imponerse en una conversacion con argumentos racionales o emocionales, regatear y defender opiniones con vehemencia." },
  atletismo: { label: "Gimnasia", attr: "des", body: "Movimiento fisico: correr, nadar, saltar, trepar, andar con sigilo o bailar." },
  conducir: { label: "Ingesta", attr: "fue", body: "Comer, beber, atacar el buffet, detectar venenos en comida o bebida y resistirlos." },
  informacion: { label: "Internes", attr: "int", body: "Buscar informacion en la web y manejar moviles, tabletas y paneles interactivos." },
  observacion: { label: "Lentes progresivas", attr: "int", body: "Registrar habitaciones, estancias o maletas, buscar algo concreto y descubrir detalles ocultos." },
  memoria: { label: "Memoria", attr: "int", body: "Recordar cosas vistas, escuchadas o leidas, sobre todo datos personales o muy concretos." },
  fuerzaBruta: { label: "Mula parda", attr: "fue", body: "Cualquier accion que requiera fuerza bruta: levantar, romper, empujar, remar o desatascar." },
  entorno: { label: "Nietos", attr: "des", body: "Cuidar de algo o de alguien, especialmente nietos, y conocer a la juventud, sus gustos y formas de ocio." },
  punteria: { label: "Petanca", attr: "des", body: "Ganar a la petanca y resolver acciones de punteria y precision, desde tirar una piedra hasta disparar." },
  seduccion: { label: "Salero", attr: "car", body: "Caer simpatico, cantar, animar, contar chistes, coquetear y conseguir cosas gracias al carisma." },
  idiomaExtranjero1: { label: "Silbido", attr: "car", body: "Tararear melodias antiguas, imitar sonidos y soltar silbidos para llamar la atencion, indicar algo o espantar." },
  oido: { label: "Sonotone", attr: "int", body: "Escuchar susurros, identificar sonidos y calcular distancia o direccion de una fuente sonora." },
  ocultacion: { label: "Sus labores", attr: "des", body: "Tareas domesticas, ordenar, guardar cosas y ocultar objetos entre la ropa o en una habitacion." },
  cultura: { label: "Telediarios", attr: "int", body: "Saberes generales que podrian haber salido en television, salvo idiomas y cosas de jovenes." },
  lucha: { label: "Tollinas", attr: "fue", body: "Pegar con punos, cuchillos u otras armas. En pelea se tira para impactar y provocar dano." }
};
const CLASSIC_HIDDEN_SKILLS = new Set(["idiomaExtranjero2", "psicologia", "rastreo", "sigilo"]);
const CLASSIC_FIXED = {
  agilidad: "Nervio",
  aplomo: "Bemoles",
  perspicacia: "Ojo clinico"
};
const CLASSIC_RULE_HELP = {
  proezas: {
    title: "Yayopoints",
    body: "Puntos especiales de los jubilados. Permiten repetir dados de una tirada fallada, sumar 1D a una tirada de habilidad, aumentar Bemoles o Nervio durante un turno, o anadir dano a un golpe."
  },
  agilidad: {
    title: "Nervio",
    body: "Valor fijo que representa vigor fisico y capacidad para esquivar. Se calcula como 3 x dados de Gimnasia + PRE y suele ser la dificultad para impactar o superar fisicamente al personaje."
  },
  aplomo: {
    title: "Bemoles",
    body: "Valor fijo que representa fuerza de personalidad y arrestos. Se calcula como CAC + 7 y se usa como dificultad frente a varias acciones sociales y tiradas de miedo."
  },
  salud: {
    title: "Salud",
    body: "En el modo clasico engloba estado fisico y mental. Se pierde por golpes, caidas, quemaduras, disparos, sustos, estres o miedo. Si llega a 0, el PJ muere."
  },
  resistenciaFisica: {
    title: "Jamacuco",
    body: "Valor igual a 12 - ROB, salvo arquetipos. Se tira con 3D6 para igualarlo o superarlo. Si falla, el jubilado muere."
  },
  ataque: {
    title: "Peleas",
    body: "Para atacar se tira Tollinas o Petanca contra el Nervio del oponente. El dano es fijo segun el tipo de ataque y puede aumentar con ROB, PRE, criticos, apuntar o yayopoints."
  },
  defectos: {
    title: "Achaques",
    body: "Cada PJ tiene un achaque mayor y uno menor. El mayor permite forzar repeticion con 1D menos y da 1 yayopoint; el menor fuerza repeticion sin yayopoint."
  }
};
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
  game.settings.register(MODULE_ID, "rulesMode", {
    name: "Modo de reglas IMSERSO",
    hint: "YSYSTEM3 mantiene automatismos del sistema base. Clasico muestra la ficha y ayudas segun el manual original de IMSERSO to the Limit, ocultando elementos que no pertenecen a YayoSystem.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      [MODE_YSYSTEM3]: "IMSERSO para YSYSTEM3",
      [MODE_CLASSIC]: "IMSERSO to the Limit clasico"
    },
    default: MODE_CLASSIC,
    onChange: () => {
      applyGlobalThemeClass();
      rerenderSystemApps();
    }
  });
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
  Handlebars.registerHelper("imsAttr", (key) => imsersoAttr(key).short);
  Handlebars.registerHelper("imsSkill", (key) => imsersoSkill(key));
  Handlebars.registerHelper("ysFixed", (key) => fixedLabel(key));
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
    const mode = currentRulesMode();
    context.imsRulesMode = mode;
    context.imsClassic = mode === MODE_CLASSIC;
    context.themeClass = `${THEME_CLASS} ${modeClass()}`;
    context.logoPath = LOGO_PATH;
    context.imsHelp = localization.help ?? {};
    context.imsLabels = localization.terms ?? {};
    if (context.imsClassic) applyClassicDerivedContext(context, this.actor.type);
    context.atributos = (context.atributos ?? [])
      .map((row) => ({ ...row, ...imsersoAttr(row.key) }))
      .filter((row) => !row.hidden);
    context.habilidades = (context.habilidades ?? [])
      .map((row) => skillContextRow(row))
      .filter((row) => !row.hidden);
    context.skillOptions = (context.skillOptions ?? []).map((row) => ({
      ...row,
      label: imsersoSkill(row.key),
      attrLabel: skillAttributeLabel(row.key, row.atributo)
    })).filter((row) => !row.hidden);
    if (context.effectiveAttack) {
      context.effectiveAttack.skillLabel = imsersoSkill(context.effectiveAttack.skill);
      context.effectiveAttack.attrLabel = imsersoAttr(context.effectiveAttack.attr).short;
    }

    context.itemSections = Object.entries(context.itemsByType ?? {})
      .filter(([, items]) => items.length)
      .filter(([key]) => !context.imsClassic || !["poder", "arquetipo"].includes(key))
      .map(([key, items]) => ({ key, label: term(key), icon: iconForItemType(key), items }));
    const itemCreateTypes = [
      { type: "arma", label: term("arma"), icon: "fa-gavel" },
      { type: "armadura", label: term("armadura"), icon: "fa-vest" },
      { type: "escudo", label: term("escudo"), icon: "fa-shield-halved" },
      { type: "objeto", label: term("objeto"), icon: "fa-suitcase" },
      { type: "poder", label: term("poder"), icon: "fa-wand-sparkles" },
      { type: "talento", label: term("talento"), icon: "fa-star" },
      { type: "arquetipo", label: term("arquetipo"), icon: "fa-id-card" }
    ];
    context.itemCreateTypes = context.imsClassic
      ? itemCreateTypes.filter((entry) => ["arma", "objeto", "talento"].includes(entry.type))
      : itemCreateTypes;
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
    context.themeClass = `${THEME_CLASS} ${modeClass()}`;
    context.itemTypeLabel = term(this.item.type);
    context.itemIcon = iconForItemType(this.item.type);
    context.logoPath = LOGO_PATH;
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
    if (currentRulesMode() === MODE_CLASSIC && this.state.mode === "arquetipo") this.state.mode = "libre";
    const context = super.getData();
    context.imsRulesMode = currentRulesMode();
    context.imsClassic = context.imsRulesMode === MODE_CLASSIC;
    context.themeClass = `${THEME_CLASS} ${modeClass()}`;
    context.imsHelp = localization.help ?? {};
    context.imsGeneratorSummary = this._generatorSummary();
    context.atributos = (context.atributos ?? []).map((row) => ({
      ...row,
      label: imsersoAttr(row.key).label,
      short: imsersoAttr(row.key).short,
      options: context.imsClassic ? [0, 2, 4, 6].map((value) => ({ value, label: value ? `+${value}` : "0" })) : row.options
    })).filter((row) => !imsersoAttr(row.key).hidden);
    context.habilidades = (context.habilidades ?? []).map((row) => ({
      ...row,
      label: imsersoSkill(row.key),
      attr: skillAttributeLabel(row.key, IMSERSO.habilidades[row.key]?.atributo),
      hidden: isHiddenSkill(row.key)
    })).filter((row) => !row.hidden);
    context.skillTarget3 = 4;
    context.skillTarget2 = context.imsClassic ? 6 : 8;
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
        `<strong>${term("achaqueMayor")}:</strong> ${escapeHtml(generated.summary.achaque)}.`,
        `<strong>Objetivo:</strong> ${escapeHtml(generated.summary.objetivo)}.`,
        `<strong>3D:</strong> ${escapeHtml(generated.selected3.map(imsersoSkill).join(", "))}.`
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
    const achaqueMayor = choice(generatorTables.achaques);
    const achaqueMenor = choice((generatorTables.achaques ?? []).filter((entry) => entry !== achaqueMayor)) || achaqueMayor;
    const quirk = choice(generatorTables.quirks);
    this.state.defectos.leve = `${term("achaqueMenor")}: ${achaqueMenor}.`;
    this.state.defectos.grave = `${term("achaqueMayor")}: ${achaqueMayor}. Mania: ${quirk}.`;
    this.render(false);
  }

  _generatorSummary() {
    return this._imsGeneratorSummary ?? null;
  }

  _selectedSkillCounts(habilidades = this.state.habilidades) {
    if (currentRulesMode() !== MODE_CLASSIC) return super._selectedSkillCounts(habilidades);
    const rows = Object.entries(habilidades ?? {}).filter(([key]) => !isHiddenSkill(key)).map(([, value]) => value);
    return {
      d3: rows.filter((row) => Number(row?.dados ?? 1) === 3).length,
      d2: rows.filter((row) => Number(row?.dados ?? 1) === 2).length
    };
  }

  _effectiveBuild() {
    const effective = super._effectiveBuild();
    if (currentRulesMode() !== MODE_CLASSIC || this.state.actorType !== "personaje") return effective;
    const attrs = effective.attrs;
    const skills = effective.skills;
    const healthRoll = Number(this.state.healthRoll) || 0;
    const healthBase = 10 + (Number(attrs.fue) || 0) * 2;
    return {
      ...effective,
      healthBase,
      healthRoll,
      health: healthBase + healthRoll,
      agilidad: (Number(skills.atletismo?.dados) || 1) * 3 + (Number(attrs.des) || 0),
      aplomo: (Number(attrs.int) || 0) + 7,
      perspicacia: "",
      proezas: Math.floor(((Number(attrs.int) || 0) + (Number(attrs.fue) || 0)) / 2) + 2,
      rf: 12 - (Number(attrs.fue) || 0)
    };
  }

  _warnings(effective, counts) {
    if (currentRulesMode() !== MODE_CLASSIC || this.state.actorType !== "personaje") return super._warnings(effective, counts);
    const warnings = [];
    if (!this.state.name.trim()) warnings.push("Falta el nombre.");
    if (!this.state.healthRoll) warnings.push("Falta tirar o generar la Salud inicial con 1D6.");
    const values = ["int", "car", "des", "fue"].map((key) => Number(this.state.atributos?.[key]));
    if (new Set(values).size !== 4 || ![0, 2, 4, 6].every((value) => values.includes(value))) {
      warnings.push("Reparte una vez cada valor clasico de atributo: 0, +2, +4 y +6.");
    }
    if (counts.d3 !== 4) warnings.push(`Selecciona exactamente 4 habilidades a 3D. Ahora: ${counts.d3}.`);
    if (counts.d2 !== 6) warnings.push(`Selecciona exactamente 6 habilidades a 2D. Ahora: ${counts.d2}.`);
    if (!this.state.defectos.leve.trim() || !this.state.defectos.grave.trim()) warnings.push("Faltan achaque menor y achaque mayor.");
    return warnings;
  }

  _pjUpdateData(effective) {
    const data = super._pjUpdateData(effective);
    if (currentRulesMode() !== MODE_CLASSIC) return data;
    data["system.proezas.valor"] = effective.proezas;
    data["system.proezas.inicial"] = effective.proezas;
    data["system.resistenciaFisica.valor"] = effective.rf;
    data["system.datos.perfil"] = this.state.datos.perfil || "IMSERSO clasico";
    delete data["system.puntoGuion.valor"];
    delete data["system.puntoGuion.max"];
    delete data["system.estabilidad.valor"];
    delete data["system.estabilidad.max"];
    delete data["system.resistenciaMental.valor"];
    delete data["system.resistenciaMental.primeraTirada"];
    delete data["system.resistenciaMental.umbrales"];
    return data;
  }
}

function openImsersoCreator(actorOrOptions = null) {
  return new ImsersoCharacterCreator(actorOrOptions).render(true);
}

async function buildRandomPj(base) {
  const attrKeys = Object.keys(IMSERSO.atributos);
  const classic = currentRulesMode() === MODE_CLASSIC;
  const attrValues = shuffle([0, 1, 2, 4, 6]);
  const atributos = classic
    ? { int: 0, car: 0, des: 0, fue: 0, per: 0 }
    : Object.fromEntries(attrKeys.map((key, index) => [key, attrValues[index]]));
  if (classic) {
    const values = shuffle([0, 2, 4, 6]);
    for (const [index, key] of ["int", "car", "des", "fue"].entries()) atributos[key] = values[index];
  }
  const habilidades = defaultSkills(1);
  const skillKeys = shuffle(Object.keys(IMSERSO.habilidades).filter((key) => !isHiddenSkill(key)));
  const selected3 = skillKeys.slice(0, 4);
  const selected2 = skillKeys.slice(4, classic ? 10 : 12);
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
  const achaqueMenor = choice((generatorTables.achaques ?? []).filter((entry) => entry !== achaque)) || achaque;
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
      leve: `${term("achaqueMenor")}: ${achaqueMenor}.`,
      grave: `${term("achaqueMayor")}: ${achaque}. Mania: ${talante}; ${mania}.`
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
      notas: `Secreto: ${secreto}. Vinculo: ${colectivo}. Especialidades: ${selected3.concat(selected2).map(imsersoSkill).join(", ")}.`
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
  if (type === "attribute") {
    const entry = imsersoAttr(key);
    if (entry?.body) return { title: `${entry.label} (${entry.short})`, body: entry.body, subtitle: "Atributo" };
  }
  if (type === "skill") {
    const entry = skillHelp(key);
    if (entry) return { title: entry.label, body: entry.body, subtitle: skillAttributeLabel(key, IMSERSO.habilidades[key]?.atributo) };
  }
  if (type === "rule") {
    const classic = currentRulesMode() === MODE_CLASSIC ? CLASSIC_RULE_HELP[key] : null;
    if (classic) return { title: classic.title, body: classic.body, subtitle: "YayoSystem" };
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
  if (currentRulesMode() === MODE_CLASSIC) {
    const classicTerms = {
      proezas: "Yayopoints",
      rf: "Jamacuco",
      rm: "Resistencia mental",
      achaque: "Achaques",
      achaqueMayor: "Achaque mayor",
      achaqueMenor: "Achaque menor",
      recuerdo: "Recuerdo",
      arquetipo: "Arquetipo de jubilado",
      talento: "Talento",
      equipo: "Pertenencias",
      arma: "Arma",
      armadura: "Proteccion",
      escudo: "Cobertura",
      objeto: "Archiperre",
      poder: "Rareza",
      salud: "Salud"
    };
    if (classicTerms[key]) return classicTerms[key];
  }
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

function imsersoAttr(key) {
  if (currentRulesMode() === MODE_CLASSIC) {
    const entry = CLASSIC_ATTRS[key];
    if (entry) return entry;
    return { label: key, short: key, hidden: true };
  }
  return IMS_ATTRS_YSYSTEM3[key] ?? { label: key, short: key };
}

function imsersoSkill(key) {
  if (currentRulesMode() === MODE_CLASSIC) return CLASSIC_SKILLS[key]?.label ?? labelForSkill(key);
  return IMS_SKILLS_YSYSTEM3[key] ?? labelForSkill(key);
}

function skillHelp(key) {
  if (currentRulesMode() === MODE_CLASSIC) return CLASSIC_SKILLS[key] ?? null;
  return {
    label: imsersoSkill(key),
    body: `Habilidad de IMSERSO para YSYSTEM3. Usa la mecanica base del sistema y conserva automatismos de tirada, pero se presenta con terminologia de viaje.`,
  };
}

function skillAttributeLabel(skillKey, fallbackAttr) {
  const attr = currentRulesMode() === MODE_CLASSIC ? CLASSIC_SKILLS[skillKey]?.attr : fallbackAttr;
  return imsersoAttr(attr ?? fallbackAttr).short;
}

function isHiddenSkill(key) {
  return currentRulesMode() === MODE_CLASSIC && (!CLASSIC_SKILLS[key] || CLASSIC_HIDDEN_SKILLS.has(key));
}

function skillContextRow(row) {
  return {
    ...row,
    label: imsersoSkill(row.key),
    attrLabel: skillAttributeLabel(row.key, row.atributo),
    hidden: isHiddenSkill(row.key)
  };
}

function fixedLabel(key) {
  return currentRulesMode() === MODE_CLASSIC ? (CLASSIC_FIXED[key] ?? key) : (IMS_FIXED_YSYSTEM3[key] ?? key);
}

function currentRulesMode() {
  try {
    return game.settings?.get?.(MODULE_ID, "rulesMode") ?? MODE_CLASSIC;
  } catch (err) {
    return MODE_CLASSIC;
  }
}

function modeClass() {
  return currentRulesMode() === MODE_CLASSIC ? "ys-imserso-classic" : "ys-imserso-ysystem3";
}

function applyClassicDerivedContext(context, actorType = context.actor?.type) {
  const system = foundry.utils.deepClone(context.system ?? {});
  const attrs = system.atributos ?? {};
  const skills = system.habilidades ?? {};
  const cac = Number(attrs.int) || 0;
  const pre = Number(attrs.des) || 0;
  const rob = Number(attrs.fue) || 0;
  const gimnasia = Number(skills.atletismo?.dados) || 1;
  const bemoles = cac + 7;
  const nervio = (gimnasia * 3) + pre;
  const jamacuco = 12 - rob;
  if (actorType === "pnj") {
    system.aplomo = { ...(system.aplomo ?? {}), valor: bemoles };
    system.agilidad = { ...(system.agilidad ?? {}), valor: nervio };
    system.perspicacia = { ...(system.perspicacia ?? {}), valor: "" };
  } else {
    system.aplomo = bemoles;
    system.agilidad = nervio;
    system.perspicacia = "";
  }
  system.resistenciaFisica = { ...(system.resistenciaFisica ?? {}), valor: jamacuco };
  context.system = system;
  const classicThresholds = new Set([15, 10, 6, 3, 1]);
  context.healthTrack = (context.healthTrack ?? []).map((point) => ({
    ...point,
    threshold: classicThresholds.has(point.value),
    thresholdLabel: classicThresholds.has(point.value) ? "J" : "",
    crossed: !!system.resistenciaFisica?.umbrales?.[point.value]
  }));
  context.healthZones = [
    { label: "UCI", class: "zone-uci", style: "grid-column: 1 / 2;" },
    { label: "-3D", class: "zone-minus3", style: "grid-column: 2 / 4;" },
    { label: "-2D", class: "zone-minus2", style: "grid-column: 4 / 7;" },
    { label: "-1D", class: "zone-minus1", style: "grid-column: 7 / 11;" },
    { label: "Sin penalizador", class: "zone-safe", style: "grid-column: 11 / 29;" }
  ];
}

function applyGlobalThemeClass() {
  document.body?.classList.add(THEME_CLASS);
  document.body?.classList.add("ys-imserso-module-active");
  document.body?.classList.remove("ys-imserso-classic", "ys-imserso-ysystem3");
  document.body?.classList.add(modeClass());
}

function applyAppTheme(app, html) {
  if (game.system.id !== SYSTEM_ID) return;
  const jq = asJQuery(html);
  if (!shouldThemeApp(app, jq)) return;
  const root = jq.closest(".window-app")[0] ?? app?.element?.[0] ?? jq[0];
  root?.classList?.add(THEME_CLASS);
  root?.classList?.remove("ys-imserso-classic", "ys-imserso-ysystem3");
  root?.classList?.add(modeClass());
  jq.find(".ims-sheet, .ys-screen-sheet, .ys-a4-sheet, .ims-item, .ims-creator, .ims-chat-card").addClass(`${THEME_CLASS} ${modeClass()}`);
}

function shouldThemeApp(app, jq) {
  if (app instanceof ImsersoVariantActorSheet || app instanceof ImsersoVariantItemSheet || app instanceof ImsersoCharacterCreator) return true;
  if (app?.actor?.type || app?.item?.type) return true;
  const appName = app?.constructor?.name ?? "";
  if (/Ysystem|Imserso/i.test(appName)) return true;
  return !!jq.find(".ims-sheet, .ys-screen-sheet, .ys-a4-sheet, .ims-item, .ims-creator, .ims-chat-card, [data-roll-skill], [data-roll-attack]").length;
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
      <header><img src="${LOGO_PATH}" alt=""><h3>${escapeHtml(title)}</h3></header>
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
