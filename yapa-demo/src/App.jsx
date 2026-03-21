import { useState, useEffect, useRef } from "react";

// ── Datos ────────────────────────────────────────────────────────
const PROVINCIAS = {
  "La Pampa": { banco: "Banco de La Pampa", bancoCorto: "BLP", ciudades: ["General Pico", "Santa Rosa", "General Acha", "Toay", "Eduardo Castex", "Realicó"], descProv: { texto: "20% en supermercados", dia: "miércoles y sábados", tope: "$45.000", tipo: "débito" } },
  "Buenos Aires": { banco: "Banco Provincia", bancoCorto: "BAPRO", ciudades: ["La Plata", "Bahía Blanca", "Mar del Plata", "San Nicolás", "Tandil", "Olavarría", "Zárate", "Luján", "Pergamino", "Campana", "Necochea", "Junín", "Chivilcoy", "Azul", "Tres Arroyos", "9 de Julio", "Trenque Lauquen", "Chacabuco", "Bolívar", "Benito Juárez"], descProv: { texto: "25% en supermercados", dia: "miércoles", tope: "$50.000", tipo: "débito y crédito" } },
  "Córdoba": { banco: "Bancor", bancoCorto: "Bancor", ciudades: ["Córdoba capital", "Río Cuarto", "Villa María", "San Francisco", "Villa Carlos Paz", "Alta Gracia", "Río Tercero", "Bell Ville", "Jesús María", "Marcos Juárez"], descProv: { texto: "30% en farmacias adheridas", dia: "martes y jueves", tope: "$35.000", tipo: "débito" } },
  "Santa Fe": { banco: "Nuevo Banco de Santa Fe", bancoCorto: "NBSF", ciudades: ["Santa Fe capital", "Rosario", "Rafaela", "Venado Tuerto", "Reconquista", "San Lorenzo", "Esperanza", "Casilda", "Sunchales"], descProv: { texto: "20% en combustible", dia: "lunes y viernes", tope: "30 litros", tipo: "débito" } },
  "Mendoza": { banco: "Banco Nación (+ fuerte en Mendoza)", bancoCorto: "BNA", ciudades: ["Mendoza capital", "San Rafael", "San Martín", "Rivadavia", "Tunuyán", "Malargüe"], descProv: { texto: "15% en bodegas y gastronomía", dia: "viernes a domingo", tope: "$40.000", tipo: "crédito" } },
  "Entre Ríos": { banco: "Bersa", bancoCorto: "Bersa", ciudades: ["Paraná", "Concordia", "Gualeguaychú", "Concepción del Uruguay", "Gualeguay", "Villaguay", "Chajarí", "Victoria"], descProv: { texto: "20% en farmacias", dia: "miércoles", tope: "$30.000", tipo: "débito" } },
  "Tucumán": { banco: "Banco Tucumán", bancoCorto: "BT", ciudades: ["San Miguel de Tucumán", "Yerba Buena", "Concepción", "Tafí Viejo", "Aguilares", "Monteros"], descProv: { texto: "15% en gastronomía", dia: "fines de semana", tope: "$25.000", tipo: "débito y crédito" } },
  "Salta": { banco: "Macro (ex Banco de Salta)", bancoCorto: "Macro", ciudades: ["Salta capital", "San Ramón de la Nueva Orán", "Tartagal", "General Güemes", "Cafayate"], descProv: { texto: "20% en supermercados", dia: "martes", tope: "$35.000", tipo: "débito" } },
  "Misiones": { banco: "Macro (+ fuerte en Misiones)", bancoCorto: "Macro", ciudades: ["Posadas", "Oberá", "Eldorado", "Puerto Iguazú", "Apóstoles", "San Vicente"], descProv: { texto: "15% en yerba y regionales", dia: "toda la semana", tope: "$20.000", tipo: "débito" } },
  "Chaco": { banco: "Nuevo Banco del Chaco", bancoCorto: "NBCh", ciudades: ["Resistencia", "Presidencia Roque Sáenz Peña", "Villa Ángela", "Charata"], descProv: { texto: "20% en farmacias", dia: "lunes y jueves", tope: "$25.000", tipo: "débito" } },
  "Corrientes": { banco: "Banco de Corrientes", bancoCorto: "BC", ciudades: ["Corrientes capital", "Goya", "Paso de los Libres", "Curuzú Cuatiá", "Mercedes"], descProv: { texto: "15% en combustible", dia: "miércoles", tope: "25 litros", tipo: "débito" } },
  "Neuquén": { banco: "BPN (Banco Provincia del Neuquén)", bancoCorto: "BPN", ciudades: ["Neuquén capital", "Centenario", "Plottier", "Zapala", "Cutral Có", "San Martín de los Andes"], descProv: { texto: "25% en supermercados La Anónima", dia: "jueves", tope: "$55.000", tipo: "débito" } },
  "Río Negro": { banco: "Banco Patagonia", bancoCorto: "BPat", ciudades: ["San Carlos de Bariloche", "General Roca", "Cipolletti", "Viedma", "Allen"], descProv: { texto: "20% en La Anónima", dia: "martes y viernes", tope: "$45.000", tipo: "débito" } },
  "San Juan": { banco: "Banco San Juan", bancoCorto: "BSJ", ciudades: ["Gran San Juan", "Caucete", "Rawson (SJ)", "Rivadavia (SJ)", "Pocito"], descProv: { texto: "20% en supermercados", dia: "sábados", tope: "$30.000", tipo: "débito" } },
  "Jujuy": { banco: "Banco Macro (+ fuerte en Jujuy)", bancoCorto: "Macro", ciudades: ["San Salvador de Jujuy", "San Pedro de Jujuy", "Palpalá", "Libertador Gral. San Martín"], descProv: { texto: "15% en supermercados", dia: "viernes", tope: "$25.000", tipo: "débito" } },
  "Santiago del Estero": { banco: "Banco Nación (+ fuerte en SdE)", bancoCorto: "BNA", ciudades: ["Santiago del Estero capital", "La Banda", "Termas de Río Hondo", "Añatuya"], descProv: { texto: "15% en farmacias", dia: "miércoles", tope: "$20.000", tipo: "débito" } },
  "San Luis": { banco: "Banco Nación (+ fuerte en San Luis)", bancoCorto: "BNA", ciudades: ["San Luis capital", "Villa Mercedes", "Merlo", "Juana Koslay"], descProv: { texto: "15% en supermercados", dia: "miércoles", tope: "$25.000", tipo: "débito" } },
  "Chubut": { banco: "Banco del Chubut", bancoCorto: "BCh", ciudades: ["Comodoro Rivadavia", "Trelew", "Puerto Madryn", "Rawson (CH)", "Esquel"], descProv: { texto: "25% en supermercados", dia: "jueves", tope: "$50.000", tipo: "débito" } },
  "Catamarca": { banco: "Banco Nación (+ fuerte en Catamarca)", bancoCorto: "BNA", ciudades: ["San Fernando del Valle de Catamarca", "Valle Viejo"], descProv: { texto: "15% en supermercados", dia: "sábados", tope: "$20.000", tipo: "débito" } },
  "La Rioja": { banco: "Nuevo Banco de La Rioja", bancoCorto: "NBLR", ciudades: ["La Rioja capital", "Chilecito"], descProv: { texto: "20% en supermercados", dia: "miércoles", tope: "$25.000", tipo: "débito" } },
  "Formosa": { banco: "Banco de Formosa", bancoCorto: "BF", ciudades: ["Formosa capital", "Clorinda", "Pirané"], descProv: { texto: "15% en farmacias y supermercados", dia: "jueves", tope: "$20.000", tipo: "débito" } },
  "Santa Cruz": { banco: "Banco de Santa Cruz", bancoCorto: "BSC", ciudades: ["Río Gallegos", "Caleta Olivia", "El Calafate"], descProv: { texto: "25% en supermercados La Anónima", dia: "miércoles", tope: "$60.000", tipo: "débito" } },
  "Tierra del Fuego": { banco: "Banco de Tierra del Fuego", bancoCorto: "BTF", ciudades: ["Río Grande", "Ushuaia"], descProv: { texto: "20% en supermercados", dia: "viernes", tope: "$55.000", tipo: "débito" } },
};

const PRIMARY_PROVS = ["La Pampa", "Buenos Aires", "Córdoba", "Santa Fe", "Mendoza", "Entre Ríos", "Tucumán", "Neuquén"];
const BANCOS_COMUNES = ["Galicia", "BBVA", "Macro", "Santander", "Nación"];
const BANCOS_OTROS = ["Brubank", "HSBC", "Credicoop", "Patagonia", "ICBC", "Supervielle", "Ciudad"];
const TIPOS_TARJETA = ["Débito", "Visa", "Mastercard", "American Express"];
const BILLETERAS_LIST = ["Mercado Pago", "Modo", "Ualá", "Naranja X", "Personal Pay", "Prex", "Bimo"];
const BILLETERAS_CON_TARJETA = {
  "Mercado Pago": "Mastercard prepaga",
  "Ualá": "Mastercard prepaga",
  "Naranja X": "Visa/Mastercard",
  "Prex": "Mastercard prepaga",
  "Personal Pay": "Visa prepaga",
};

// ── Componentes ──────────────────────────────────────────────────
const TypingDots = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 4, background: "white", padding: "10px 14px", borderRadius: 18, borderBottomLeftRadius: 3, boxShadow: "0 1px 2px rgba(0,0,0,0.15)", width: 52 }}>
    {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#aaa", animation: `td 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
  </div>
);

const fmt = (text) => text.split("\n").map((line, i, arr) => {
  const html = line.replace(/\*(.*?)\*/g, "<strong>$1</strong>").replace(/_(.*?)_/g, "<em>$1</em>");
  return <span key={i}><span dangerouslySetInnerHTML={{ __html: html }} />{i < arr.length - 1 && <br />}</span>;
});

const Chip = ({ label, selected, onClick, accent }) => (
  <button onClick={onClick} style={{
    padding: "7px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
    border: selected ? "2px solid #1F3D2B" : `1.5px solid ${accent ? "#C6A75E" : "#ccc"}`,
    background: selected ? "#1F3D2B" : accent ? "#fdf8f0" : "#f0f9f4",
    color: selected ? "white" : "#1F3D2B", transition: "all 0.15s", display: "inline-block",
  }}>{selected ? "✓ " : ""}{label}</button>
);

// ── App principal ────────────────────────────────────────────────
export default function App() {
  const [msgs, setMsgs] = useState([]);
  const [opts, setOpts] = useState([]);
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [time] = useState(() => { const d = new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`; });
  const bottom = useRef(null);
  const timers = useRef([]);
  const [selected, setSelected] = useState([]);
  const [multiMode, setMultiMode] = useState(false);
  const [showExtraBanks, setShowExtraBanks] = useState(false);

  const phaseRef = useRef("idle");
  const provinciaRef = useRef(null);
  const ciudadRef = useRef(null);
  const frecuenciaRef = useRef(null);
  // Tarjetas: [{banco:"BLP", tipos:["Débito","Visa"]}, ...]
  const bancosSeleccionados = useRef([]);
  const bancoActualIdx = useRef(0);
  // Billeteras
  const billeterasSeleccionadas = useRef([]);
  const billeterasTarjetas = useRef([]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing, opts, selected, multiMode]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const delay = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); };
  const addUser = (text) => setMsgs(p => [...p, { from: "user", text }]);
  const addYapa = (text) => setMsgs(p => [...p, { from: "yapa", text }]);
  const showOptions = (options, ms = 0) => delay(() => setOpts(options), ms);
  const toggleSelect = (item) => setSelected(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item]);

  const yapaTypeThenSay = (text, delayBefore = 0) => {
    const dur = Math.min(text.length * 12, 1800);
    delay(() => setTyping(true), delayBefore);
    delay(() => { setTyping(false); addYapa(text); }, delayBefore + dur);
    return delayBefore + dur + 100;
  };

  // ── INTRO ─────────────────────────────────────────────────────
  const startIntro = () => {
    phaseRef.current = "intro";
    const d = yapaTypeThenSay("¡Hola! Soy *Yapa* 🛍️, tu asistente de ahorro de *-es+*.\n\nConozco los descuentos de todos los bancos, billeteras y comercios de tu zona. Y te los cuento en lenguaje humano, no en letra chica.\n\nEn *4 preguntas rápidas* armo tu perfil y te muestro cuánto podés ahorrar esta semana.\n\n¿Empezamos? 😊", 400);
    showOptions(["¡Sí, empecemos! 🚀", "¿Qué es -es+?", "¿Es gratis?"], d + 300);
  };

  const handleIntro = (opt) => {
    addUser(opt);
    if (opt.includes("empecemos") || opt.includes("Empecemos") || opt.includes("Dale")) startProvincia();
    else if (opt === "¿Qué es -es+?") {
      const d = yapaTypeThenSay("*-es+* es una app que cruza tus tarjetas, billeteras y obra social con todos los descuentos de tu ciudad.\n\nVos seguís comprando donde siempre — yo te aviso *cómo pagar menos*.\n\nNo vendemos nada. No somos un banco. Somos tu aliada para que la plata rinda más. 💚\n\n¿Arrancamos?", 400);
      showOptions(["¡Dale, empecemos! 🚀", "¿Es gratis?"], d + 300);
    } else if (opt === "¿Es gratis?") {
      const d = yapaTypeThenSay("¡Sí! *-es+ es 100% gratis por 6 meses.* Sin tarjeta. Sin trampa. Sin letra chica.\n\nDespués hay un plan opcional de $2.000/mes, pero con los descuentos que te encuentro *ahorrás 10 veces eso en la primera semana*.\n\nPero eso después. Ahora vamos a tus descuentos 😊", 400);
      showOptions(["¡Empecemos! 🚀"], d + 300);
    }
  };

  // ── PROVINCIA ─────────────────────────────────────────────────
  const startProvincia = () => {
    phaseRef.current = "provincia";
    const d = yapaTypeThenSay("Perfecto 🎯\n\n*Pregunta 1 de 4*\n\n¿En qué provincia vivís?\n\n_(Necesito saberlo para mostrarte los descuentos de tu zona y de tu banco provincial)_", 400);
    showOptions([...PRIMARY_PROVS, "📍 Ver más provincias..."], d + 300);
  };

  const handleProvincia = (opt) => {
    if (opt === "📍 Ver más provincias...") { setOpts(Object.keys(PROVINCIAS).filter(p => !PRIMARY_PROVS.includes(p))); return; }
    addUser(opt); provinciaRef.current = opt; phaseRef.current = "ciudad";
    const prov = PROVINCIAS[opt];
    const msg = prov.banco.includes("Nación")
      ? `¡${opt}! 💚 Hermosa provincia.\n\nYa tengo cargados los descuentos de *${prov.banco}*, que es el más fuerte en tu zona, más Galicia, BBVA, Macro y todas las billeteras digitales.`
      : `¡${opt}! 💚 Hermosa provincia.\n\nYa tengo cargados los descuentos de tu *${prov.banco}* y también de Galicia, BBVA, Macro, Santander y todas las billeteras.`;
    const d = yapaTypeThenSay(msg + `\n\n*Pregunta 2 de 4*\n\n¿En qué ciudad estás?`, 400);
    const vis = prov.ciudades.slice(0, 6);
    showOptions(prov.ciudades.length > 6 ? [...vis, "📍 Ver más ciudades..."] : vis, d + 300);
  };

  // ── CIUDAD ────────────────────────────────────────────────────
  const handleCiudad = (opt) => {
    if (opt === "📍 Ver más ciudades...") { setOpts(PROVINCIAS[provinciaRef.current].ciudades.slice(6)); return; }
    addUser(opt); ciudadRef.current = opt;
    startBancosSelect();
  };

  // ── TARJETAS PASO 1: Elegir bancos (multi-select) ─────────────
  const startBancosSelect = () => {
    phaseRef.current = "bancos_select";
    const prov = PROVINCIAS[provinciaRef.current];
    const d = yapaTypeThenSay(
      `Anotado 📝 *${ciudadRef.current}, ${provinciaRef.current}*\n\n*Pregunta 3 de 4*\n\n¿En qué bancos tenés tarjeta? *Tocá todos los que tengas* y después confirmá.\n\nTu banco provincial *${prov.bancoCorto}* tiene descuentos muy buenos en tu zona 💚`,
      400
    );
    delay(() => { setSelected([]); setMultiMode("bancos"); setShowExtraBanks(false); }, d + 200);
  };

  const confirmBancos = () => {
    const sel = [...selected];
    setSelected([]); setMultiMode(false); setShowExtraBanks(false);
    addUser(sel.join(", "));
    bancosSeleccionados.current = sel.map(b => ({ banco: b, tipos: [] }));
    bancoActualIdx.current = 0;
    askTipoTarjeta(0);
  };

  // ── TARJETAS PASO 2: Por cada banco, elegir tipo (multi-select) ─
  const askTipoTarjeta = (idx) => {
    if (idx >= bancosSeleccionados.current.length) { startBilleteras(); return; }
    phaseRef.current = "tipo_tarjeta";
    bancoActualIdx.current = idx;
    const banco = bancosSeleccionados.current[idx].banco;
    const msg = idx === 0
      ? `Perfecto 💳 Ahora por cada banco te pregunto qué tarjetas tenés.\n\n*${banco}:* ¿Qué tipo de tarjeta tenés?`
      : `*${banco}:* ¿Qué tipo de tarjeta tenés?`;
    const d = yapaTypeThenSay(msg, 400);
    delay(() => { setSelected([]); setMultiMode("tipo_tarjeta"); }, d + 200);
  };

  const confirmTipoTarjeta = () => {
    const sel = [...selected];
    setSelected([]); setMultiMode(false);
    const idx = bancoActualIdx.current;
    bancosSeleccionados.current[idx].tipos = sel;
    addUser(`${bancosSeleccionados.current[idx].banco}: ${sel.join(", ")}`);
    askTipoTarjeta(idx + 1);
  };

  // ── BILLETERAS PASO 1: Elegir billeteras (multi-select) ───────
  const startBilleteras = () => {
    phaseRef.current = "billeteras";
    const d = yapaTypeThenSay("¡Ya casi! 😄\n\n*Última pregunta*\n\n¿Usás alguna billetera digital? *Tocá todas las que tengas.*\n\nSi no usás ninguna, confirmá directamente.", 400);
    delay(() => { setSelected([]); setMultiMode("billeteras"); }, d + 200);
  };

  const confirmBilleteras = () => {
    const sel = [...selected];
    setSelected([]); setMultiMode(false);
    billeterasSeleccionadas.current = sel;
    addUser(sel.length > 0 ? sel.join(", ") : "No uso billeteras");

    // ¿Alguna billetera tiene tarjeta propia?
    const conTarjeta = sel.filter(b => BILLETERAS_CON_TARJETA[b]);
    if (conTarjeta.length > 0) {
      askBilleterasTarjetas(conTarjeta);
    } else {
      showResultados();
    }
  };

  // ── BILLETERAS PASO 2: Tarjetas de billeteras ─────────────────
  const askBilleterasTarjetas = (conTarjeta) => {
    phaseRef.current = "billeteras_tarjetas";
    const items = conTarjeta.map(b => `Tarjeta ${b} (${BILLETERAS_CON_TARJETA[b]})`);
    const d = yapaTypeThenSay(
      `Algunas de tus billeteras tienen *tarjeta propia* (física o virtual). ¿Tenés alguna de estas? Tocá las que tengas.`,
      400
    );
    delay(() => { setSelected([]); setMultiMode("billeteras_tarjetas"); }, d + 200);
  };

  const confirmBilleterasTarjetas = () => {
    const sel = [...selected];
    setSelected([]); setMultiMode(false);
    billeterasTarjetas.current = sel;
    addUser(sel.length > 0 ? sel.join(", ") : "No tengo ninguna");
    showResultados();
  };

  // ── RESULTADOS ────────────────────────────────────────────────
  const showResultados = () => {
    phaseRef.current = "frecuencia";
    const prov = PROVINCIAS[provinciaRef.current];
    const ciudad = ciudadRef.current;
    const bancos = bancosSeleccionados.current;
    const bills = billeterasSeleccionadas.current;
    const sinBilleteras = bills.length === 0;

    const bancosStr = bancos.map(b => b.banco).join(", ");
    const d1 = yapaTypeThenSay(`¡Listo! Con ${bancosStr}${sinBilleteras ? "" : " + " + bills.join(", ")} en *${ciudad}*...\n\n⏳ _Cruzando tus medios de pago con los descuentos de la zona..._`, 400);

    const provDesc = `✅ *${prov.descProv.texto}* — ${prov.banco} ${prov.descProv.tipo}, ${prov.descProv.dia} (tope ${prov.descProv.tope})`;
    let extras = [
      `✅ *25% en Changomás* — Visa, miércoles (tope $40.000)`,
      `✅ *15% nafta YPF* — Mercado Pago, martes y jueves (tope 30 litros)`,
      `✅ *30% farmacia* — débito, jueves (tope $25.000)`,
      `✅ *2x1 delivery PedidosYa* — Modo, fines de semana`,
      `✅ *6 cuotas sin interés en ropa* — Visa crédito, toda la semana`,
      `✅ *2x1 cine* — crédito, miércoles y jueves`,
      `✅ *10% nafta Shell* — Modo, toda la semana (tope 40 litros)`,
    ];
    if (sinBilleteras) extras = extras.filter(e => !e.includes("Mercado Pago") && !e.includes("Modo"));
    const descList = [provDesc, ...extras.slice(0, 6)].join("\n");
    const numDescs = 1 + Math.min(extras.length, 6);
    const ahorro = (35000 + Math.floor(Math.random() * 25000)).toLocaleString("es-AR");

    const d2 = yapaTypeThenSay(`🔥 *Esta semana tenés ${numDescs} descuentos para vos:*\n\n${descList}\n\n💰 Ahorro estimado: *$${ahorro} esta semana*\n\n_Solo con lo que me contaste. Si sumás obra social, seguros o programas de puntos, encontramos más._`, d1 + 400);
    const d3 = yapaTypeThenSay(`💡 *Tip de Yapa:* En ${ciudad} el descuento más fuerte esta semana es el de *${prov.banco}* — ${prov.descProv.texto} los ${prov.descProv.dia}. Si podés concentrar las compras grandes ese día, le sacás el jugo.\n\n¿Con qué frecuencia querés que te avise? 📅`, d2 + 400);
    showOptions(["2 veces por semana (martes y viernes) 🔔", "1 vez por semana (lunes) 📅", "Cada dos semanas 📆"], d3 + 300);
  };

  // ── FRECUENCIA → HORARIO ──────────────────────────────────────
  const handleFrecuencia = (opt) => {
    addUser(opt); frecuenciaRef.current = opt; phaseRef.current = "horario";
    const d = yapaTypeThenSay("¡Genial! Y una última cosa: *¿a qué hora te llega mejor el mensaje?*\n\n_(Para que lo leas cuando tengas un rato, no cuando estás a las corridas)_", 400);
    showOptions(["Mañana temprano (7-9am) ☀️", "Mediodía (12-13hs) 🌤️", "Noche (20-21hs) 🌙"], d + 300);
  };

  const handleHorario = (opt) => {
    addUser(opt); phaseRef.current = "cierre";
    const freq = frecuenciaRef.current;
    const h = opt.includes("Mañana") ? "a la mañana" : opt.includes("Mediodía") ? "al mediodía" : "a la noche";
    const fm = freq.includes("2 veces") ? `los *martes y viernes ${h}*` : freq.includes("1 vez") ? `los *lunes ${h}*` : `el *primer lunes de cada quincena ${h}*`;

    const d1 = yapaTypeThenSay(`¡Listo! Te aviso ${fm} 💚\n\nYa estás en *-es+* — *gratis por 6 meses*. Sin tarjeta. Sin trampa. Sin letra chica.\n\nCon los descuentos de esta semana ya ahorrás más que lo que vale la app por un año entero. 🤯`, 400);
    const d2 = yapaTypeThenSay(`Además, podés preguntarme lo que quieras (3 consultas gratis por mes):\n\n🛒 _"Tengo que comprar los guardapolvos de los chicos"_\n⛽ _"¿Dónde cargo nafta más barato?"_\n💊 _"¿Mi obra social tiene descuento en farmacia?"_\n🏖️ _"Estoy ahorrando para las vacaciones"_\n\nYo te respondo con opciones reales, no publicidades. 😊`, d1 + 400);
    const d3 = yapaTypeThenSay(`Si querés ver tu historial de ahorro, tu alcancía para metas y tus gastos organizados... podés descargarte la app.\n\nPero si preferís seguir por acá, *también podemos*. Vos decidís. 😊\n\n_Ah, y si tenés amigas que administran el hogar, compartiles Yapa. Cada referida que se suma, las dos ganan un mes gratis extra._ 💚`, d2 + 400);
    showOptions(["Quiero descargar la app 📲", "Por ahora sigo por acá 👌", "Quiero compartir con una amiga 💚"], d3 + 300);
  };

  // ── CIERRE ────────────────────────────────────────────────────
  const handleCierre = (opt) => {
    addUser(opt);
    const ciudad = ciudadRef.current;
    const prov = PROVINCIAS[provinciaRef.current];
    let t;
    if (opt.includes("app")) t = `¡Genial! 🎊\n\nDescargá *-es+* acá 👇\n🔗 _esmas.app/descargar_\n\nTu cuenta ya está lista — entrás con este número de WhatsApp, sin contraseña.\n\nBienvenida a *-es+* 💚\n_Menos ruido. Más ahorro._`;
    else if (opt.includes("amiga")) t = `¡Me encanta! 🎊\n\nCompartile este link:\n🔗 _esmas.app/yapa_\n\nCuando ella se registre, *las dos ganan un mes gratis*.\n\nBienvenida a *-es+*\n_Menos ruido. Más ahorro._`;
    else t = `¡Perfecto! Seguimos por acá 💚\n\nMañana te mando un tip personalizado con la mejor promo para tus tarjetas en *${ciudad}*.\n\nBienvenida a *-es+*\n_Menos ruido. Más ahorro._`;
    const d1 = yapaTypeThenSay(t, 400);
    const d2 = yapaTypeThenSay(`💡 _Preview de lo que recibirías mañana:_\n\nChe, acordate que mañana ${prov.descProv.dia.split(" y ")[0]} *${prov.banco}* tiene *${prov.descProv.texto}*. Con lo que comprás normalmente te ahorrarías unos $4.800. Por si te sirve 🛍️`, d1 + 600);
    delay(() => setDone(true), d2 + 800);
  };

  // ── Handler principal ─────────────────────────────────────────
  const handleOption = (opt) => {
    clearTimers(); setOpts([]); setTyping(false);
    switch (phaseRef.current) {
      case "intro": handleIntro(opt); break;
      case "provincia": handleProvincia(opt); break;
      case "ciudad": handleCiudad(opt); break;
      case "frecuencia": handleFrecuencia(opt); break;
      case "horario": handleHorario(opt); break;
      case "cierre": handleCierre(opt); break;
    }
  };

  const start = () => { setStarted(true); addUser("Hola! 👋"); startIntro(); };
  const restart = () => {
    clearTimers(); setMsgs([]); setOpts([]); setSelected([]);
    setTyping(false); setDone(false); setStarted(false); setMultiMode(false); setShowExtraBanks(false);
    phaseRef.current = "idle"; provinciaRef.current = null; ciudadRef.current = null;
    frecuenciaRef.current = null; bancosSeleccionados.current = []; bancoActualIdx.current = 0;
    billeterasSeleccionadas.current = []; billeterasTarjetas.current = [];
  };

  // ── Render multi-select areas ─────────────────────────────────
  const renderMultiSelect = () => {
    if (!multiMode) return null;

    if (multiMode === "bancos") {
      const prov = PROVINCIAS[provinciaRef.current];
      const provBank = prov?.bancoCorto || "";
      const bancos = [provBank, ...BANCOS_COMUNES.filter(b => b !== provBank)];
      return (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 10, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, paddingLeft: 4 }}>Tocá tus bancos:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {bancos.map((b, i) => <Chip key={b} label={i === 0 ? `⭐ ${b}` : b} selected={selected.includes(b)} onClick={() => toggleSelect(b)} accent={i === 0} />)}
          </div>
          {!showExtraBanks && (
            <button onClick={() => setShowExtraBanks(true)} style={{ marginTop: 6, padding: "6px 12px", borderRadius: 14, fontSize: 10, fontWeight: 600, border: "1px dashed #aaa", background: "transparent", color: "#888", cursor: "pointer" }}>
              + Ver más bancos...
            </button>
          )}
          {showExtraBanks && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
              {BANCOS_OTROS.map(b => <Chip key={b} label={b} selected={selected.includes(b)} onClick={() => toggleSelect(b)} />)}
            </div>
          )}
          <button onClick={confirmBancos} disabled={selected.length === 0} style={{
            marginTop: 8, width: "100%", padding: "10px", borderRadius: 14, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
            background: selected.length > 0 ? "#128C7E" : "#ccc", color: "white", opacity: selected.length > 0 ? 1 : 0.5, transition: "all 0.2s",
          }}>{selected.length > 0 ? `Listo — ${selected.length} banco${selected.length > 1 ? "s" : ""} ✅` : "Seleccioná al menos uno"}</button>
        </div>
      );
    }

    if (multiMode === "tipo_tarjeta") {
      const banco = bancosSeleccionados.current[bancoActualIdx.current]?.banco;
      return (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 10, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, paddingLeft: 4 }}>💳 {banco} — ¿qué tarjetas?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {TIPOS_TARJETA.map(t => <Chip key={t} label={t} selected={selected.includes(t)} onClick={() => toggleSelect(t)} />)}
          </div>
          <button onClick={confirmTipoTarjeta} disabled={selected.length === 0} style={{
            marginTop: 8, width: "100%", padding: "10px", borderRadius: 14, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
            background: selected.length > 0 ? "#128C7E" : "#ccc", color: "white", opacity: selected.length > 0 ? 1 : 0.5, transition: "all 0.2s",
          }}>{selected.length > 0 ? `Listo — ${selected.join(", ")} ✅` : "Seleccioná al menos una"}</button>
        </div>
      );
    }

    if (multiMode === "billeteras") {
      return (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 10, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, paddingLeft: 4 }}>Tocá tus billeteras:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {BILLETERAS_LIST.map(b => <Chip key={b} label={b} selected={selected.includes(b)} onClick={() => toggleSelect(b)} />)}
          </div>
          <button onClick={confirmBilleteras} style={{
            marginTop: 8, width: "100%", padding: "10px", borderRadius: 14, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
            background: selected.length > 0 ? "#128C7E" : "#888", color: "white", transition: "all 0.2s",
          }}>{selected.length > 0 ? `Listo — ${selected.length} billetera${selected.length > 1 ? "s" : ""} ✅` : "No uso billeteras"}</button>
        </div>
      );
    }

    if (multiMode === "billeteras_tarjetas") {
      const conTarjeta = billeterasSeleccionadas.current.filter(b => BILLETERAS_CON_TARJETA[b]);
      const items = conTarjeta.map(b => `Tarjeta ${b} (${BILLETERAS_CON_TARJETA[b]})`);
      return (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 10, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, paddingLeft: 4 }}>¿Tenés alguna de estas tarjetas?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {items.map(t => <Chip key={t} label={t} selected={selected.includes(t)} onClick={() => toggleSelect(t)} />)}
          </div>
          <button onClick={confirmBilleterasTarjetas} style={{
            marginTop: 8, width: "100%", padding: "10px", borderRadius: 14, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
            background: selected.length > 0 ? "#128C7E" : "#888", color: "white", transition: "all 0.2s",
          }}>{selected.length > 0 ? `Listo — ${selected.length} tarjeta${selected.length > 1 ? "s" : ""} ✅` : "No tengo ninguna"}</button>
        </div>
      );
    }

    return null;
  };

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16, background: "linear-gradient(160deg,#1F3D2B 0%,#2d5a3d 55%,#1a3325 100%)" }}>
      <style>{`
        @keyframes td{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
        @keyframes su{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        .su{animation:su 0.3s ease forwards} .fi{animation:fi 0.5s ease forwards}
        .opt-btn{text-align:left;padding:9px 13px;border-radius:14px;font-size:12px;font-weight:600;border:1.5px solid #1F3D2B;background:#f0f9f4;color:#1F3D2B;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.1);transition:all 0.15s;}
        .opt-btn:hover{background:#1F3D2B;color:white;} .opt-btn:active{transform:scale(0.97);}
      `}</style>

      <div className="fi" style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 36, fontFamily: "Georgia,serif", color: "white", letterSpacing: 6, lineHeight: 1 }}><span style={{ color: "#C6A75E" }}>-</span>es<span style={{ color: "#C6A75E" }}>+</span></div>
        <p style={{ fontSize: 10, color: "#a8c5b0", letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>Menos ruido · Más ahorro</p>
      </div>

      <div style={{ width: 320, borderRadius: 36, overflow: "hidden", background: "#1a1a1a", border: "7px solid #2a2a2a", boxShadow: "0 0 0 1.5px #555, 0 40px 80px rgba(0,0,0,0.7)" }}>
        <div style={{ position: "relative", height: 0 }}><div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 70, height: 14, background: "#1a1a1a", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, zIndex: 10 }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 18px 4px", background: "#1a1a1a", color: "white", fontSize: 10 }}><span style={{ fontWeight: 600 }}>{time}</span><span style={{ opacity: .6 }}>▲▲▲ WiFi 🔋</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#128C7E" }}>
          <span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>‹</span>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#C6A75E", color: "#1F3D2B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>Y</div>
          <div style={{ flex: 1 }}><div style={{ color: "white", fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>Yapa 🛍️</div><div style={{ color: "#a8e6cf", fontSize: 10, marginTop: 2 }}>{typing ? "escribiendo..." : "en línea"}</div></div>
          <span style={{ color: "white", opacity: .5, fontSize: 14 }}>📹 📞</span>
        </div>

        <div style={{ height: 460, overflowY: "auto", background: "#E5DDD5", padding: "10px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ textAlign: "center", marginBottom: 4 }}><span style={{ fontSize: 10, color: "#666", background: "rgba(255,255,255,0.6)", padding: "2px 10px", borderRadius: 10 }}>Hoy</span></div>

          {!started ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }} className="fi">
              <div style={{ background: "#DCF8C6", borderRadius: 18, padding: "20px 24px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", maxWidth: 220 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🛍️</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#222" }}>Yapa te escribe</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Tu asistente de ahorro de -es+</div>
                <div style={{ fontSize: 10, color: "#999", marginTop: 6 }}>🇦🇷 23 provincias · 95+ ciudades</div>
              </div>
              <button onClick={start} style={{ padding: "10px 24px", borderRadius: 24, background: "#128C7E", color: "white", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>▶ Ver cómo funciona</button>
            </div>
          ) : (
            <>
              {msgs.map((item, i) => (
                <div key={i} className="su" style={{ display: "flex", justifyContent: item.from === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 4 }}>
                  {item.from === "yapa" && <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#C6A75E", color: "#1F3D2B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>Y</div>}
                  <div style={{ maxWidth: 220, padding: "8px 11px", borderRadius: 18, fontSize: 12, lineHeight: 1.5, background: item.from === "user" ? "#DCF8C6" : "white", borderBottomRightRadius: item.from === "user" ? 3 : 18, borderBottomLeftRadius: item.from === "yapa" ? 3 : 18, boxShadow: "0 1px 2px rgba(0,0,0,0.12)", color: "#111" }}>
                    <div style={{ whiteSpace: "pre-line" }}>{fmt(item.text)}</div>
                    <div style={{ textAlign: "right", fontSize: 9, opacity: .4, marginTop: 3 }}>{time}{item.from === "user" && " ✓✓"}</div>
                  </div>
                </div>
              ))}
              {typing && <div className="su" style={{ display: "flex", alignItems: "flex-end", gap: 4 }}><div style={{ width: 22, height: 22, borderRadius: "50%", background: "#C6A75E", color: "#1F3D2B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>Y</div><TypingDots /></div>}

              {multiMode && !done && renderMultiSelect()}

              {opts.length > 0 && !done && !multiMode && (
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
                  {opts.map((o, i) => <button key={`${phaseRef.current}-${i}`} onClick={() => handleOption(o)} className="su opt-btn" style={{ animationDelay: `${i * 0.04}s` }}>{o}</button>)}
                </div>
              )}

              {done && (
                <div className="fi" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <div style={{ background: "#DCF8C6", borderRadius: 16, padding: "14px 16px", textAlign: "center", width: "100%", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>🎉</div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#222" }}>¡Así de simple es registrarse!</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>4 preguntas · Sin formularios · Sin contraseña</div>
                    <div style={{ fontSize: 10, color: "#4A7C59", marginTop: 4, fontWeight: 600 }}>Banco provincial siempre primero 💚</div>
                  </div>
                  <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 20, background: "#1F3D2B", color: "white", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>↺ Ver de nuevo</button>
                </div>
              )}
              <div ref={bottom} />
            </>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", background: "#F0F0F0" }}>
          <div style={{ flex: 1, background: "white", borderRadius: 20, padding: "7px 14px", fontSize: 11, color: "#aaa", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08)" }}>Escribí un mensaje...</div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#128C7E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>🎤</div>
        </div>
      </div>

      <p className="fi" style={{ fontSize: 10, color: "#6a9a7a", marginTop: 12, textAlign: "center" }}>Demo interactiva · Yapa by -es+ · 23 provincias · 95+ ciudades argentinas</p>
    </div>
  );
}
