/**
 * Terrenos de "La Batalla Mas Temida". Cada uno se inspira en una batalla real
 * y trae su propio equipo: no es la batalla naval de siempre, el desierto pide
 * camiones y tanques, el cielo paracaidistas y bombarderos.
 *
 * Es la unica fuente de verdad del catalogo: la app lo pide por HTTP.
 * La huella es columnas x filas en la orientacion original (toda figura se puede girar).
 */
export type TerrainId = "DESERT" | "JUNGLE" | "SEA" | "SKY" | "ARCTIC" | "CITY";

export interface UnitType {
  id: string;
  name: string;
  emoji: string;
  width: number;
  height: number;
}

export interface Terrain {
  id: TerrainId;
  name: string;
  emoji: string;
  inspiredBy: string;
  /** Colores del suelo y de las lineas de la cuadricula (la app pinta con ellos). */
  groundHex: string;
  gridHex: string;
  units: UnitType[];
}

const unit = (id: string, name: string, emoji: string, width: number, height: number): UnitType => ({
  id,
  name,
  emoji,
  width,
  height,
});

export const BATTLE_TERRAINS: Terrain[] = [
  {
    id: "DESERT",
    name: "Desierto",
    emoji: "🏜️",
    inspiredBy: "El Alamein, 1942: tanques y camiones en arena abierta",
    groundHex: "#C8A15A",
    gridHex: "#8A6A30",
    units: [
      unit("soldier", "Soldado", "🪖", 1, 2),
      unit("jeep", "Jeep explorador", "🚙", 1, 3),
      unit("truck", "Camión de suministros", "🚚", 1, 4),
      unit("tank", "Tanque blindado", "🛡️", 2, 3),
      unit("attack-plane", "Avión de ataque", "✈️", 3, 3),
    ],
  },
  {
    id: "JUNGLE",
    name: "Selva",
    emoji: "🌴",
    inspiredBy: "Valle de Ia Drang, 1965: helicópteros y lanchas en los ríos",
    groundHex: "#2F6B3A",
    gridHex: "#1C4424",
    units: [
      unit("guerrilla", "Guerrillero", "🌿", 1, 2),
      unit("river-boat", "Lancha fluvial", "🚤", 1, 3),
      unit("crocodile", "Cocodrilo del río", "🐊", 1, 4),
      unit("helicopter", "Helicóptero", "🚁", 2, 3),
      unit("camp", "Campamento", "⛺", 3, 3),
    ],
  },
  {
    id: "SEA",
    name: "Mar",
    emoji: "🌊",
    inspiredBy: "Midway, 1942: portaaviones y submarinos",
    groundHex: "#1E5A8C",
    gridHex: "#123A5C",
    units: [
      unit("diver", "Buzo táctico", "🤿", 1, 2),
      unit("torpedo-boat", "Lancha torpedera", "🛥️", 1, 3),
      unit("submarine", "Submarino", "🔱", 1, 4),
      unit("destroyer", "Destructor", "🚢", 1, 5),
      unit("carrier", "Portaaviones", "🛳️", 2, 5),
    ],
  },
  {
    id: "SKY",
    name: "Cielo",
    emoji: "☁️",
    inspiredBy: "Market Garden, 1944: paracaidistas, planeadores y cazas",
    groundHex: "#5B8FC9",
    gridHex: "#3A6699",
    units: [
      unit("paratrooper", "Paracaidista", "🪂", 1, 2),
      unit("balloon", "Globo de observación", "🎈", 2, 2),
      unit("glider", "Planeador", "🛩️", 1, 4),
      unit("fighter", "Caza", "✈️", 2, 3),
      unit("bomber", "Bombardero", "🛫", 3, 3),
    ],
  },
  {
    id: "ARCTIC",
    name: "Ártico",
    emoji: "❄️",
    inspiredBy: "Guerra de Invierno, 1939 a 1940: esquiadores y trineos en la nieve",
    groundHex: "#DDE8F0",
    gridHex: "#9DB4C6",
    units: [
      unit("skier", "Esquiador", "⛷️", 1, 2),
      unit("dog-sled", "Trineo de perros", "🛷", 1, 3),
      unit("igloo", "Iglú búnker", "🧊", 2, 2),
      unit("snow-crawler", "Oruga de nieve", "🚜", 2, 3),
      unit("icebreaker", "Rompehielos", "🚢", 2, 4),
    ],
  },
  {
    id: "CITY",
    name: "Ciudad",
    emoji: "🏙️",
    inspiredBy: "Stalingrado, 1942 a 1943: combate casa por casa",
    groundHex: "#5E6470",
    gridHex: "#3C414B",
    units: [
      unit("sniper", "Francotirador", "🎯", 1, 2),
      unit("ambulance", "Ambulancia", "🚑", 1, 3),
      unit("barricade", "Barricada", "🧱", 1, 4),
      unit("city-tank", "Tanque urbano", "🛡️", 2, 3),
      unit("armored-train", "Tren blindado", "🚂", 1, 5),
    ],
  },
];

export function findTerrain(id: string): Terrain | undefined {
  return BATTLE_TERRAINS.find((t) => t.id === id);
}

export function findUnitType(terrain: Terrain, unitTypeId: string): UnitType | undefined {
  return terrain.units.find((u) => u.id === unitTypeId);
}
