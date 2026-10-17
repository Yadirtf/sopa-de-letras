import { describe, it, expect } from "vitest";
import { parseCoordinate, formatCoordinate } from "../../../src/games/battle/domain/battle-coordinate";
import { normalizeConfig, recommendArmy, armyCellCount } from "../../../src/games/battle/domain/battle-config";
import { findTerrain } from "../../../src/games/battle/domain/battle-terrains.catalog";
import { randomPlacement, validatePlacement } from "../../../src/games/battle/domain/battle-board";
import { findWeapon, impactCells } from "../../../src/games/battle/domain/battle-weapons";

const desert = findTerrain("DESERT")!;

describe("Coordenadas de la batalla", () => {
  it("entiende las coordenadas como se dicen en papel", () => {
    expect(parseCoordinate("H11")).toEqual([7, 10]);
    expect(parseCoordinate("11-H")).toEqual([7, 10]);
    expect(parseCoordinate(" h 11 ")).toEqual([7, 10]);
    expect(parseCoordinate("a1")).toEqual([0, 0]);
    expect(parseCoordinate("11")).toBeNull();
    expect(parseCoordinate("H0")).toBeNull();
    expect(formatCoordinate(19, 14)).toBe("T15");
  });
});

describe("Ajustes de la sala", () => {
  it("recorta la arena a sus limites y usa el terreno por defecto si no existe", () => {
    const config = normalizeConfig({ cols: 99, rows: 2, terrain: "LUNA" as any });
    expect(config.cols).toBe(26);
    expect(config.rows).toBe(6);
    expect(config.terrain).toBe("DESERT");
    expect(config.inputMode).toBe("TAP_OR_TYPE");
  });

  it("recomienda un ejercito cercano al 15 % de la arena", () => {
    const army = recommendArmy(desert, 20, 15);
    const cells = armyCellCount(desert, army);
    expect(cells).toBeGreaterThan(30);
    expect(cells).toBeLessThanOrEqual(45);
    expect(Object.values(army).filter((n) => n > 0).length).toBe(desert.units.length);
  });

  it("en una arena chica no recomienda figuras que no caben", () => {
    const sea = findTerrain("SEA")!;
    const army = recommendArmy(sea, 6, 6);
    expect(armyCellCount(sea, army)).toBeGreaterThan(0);
    expect(armyCellCount(sea, army)).toBeLessThanOrEqual(6);
  });
});

describe("Colocacion del ejercito", () => {
  const config = normalizeConfig({ cols: 10, rows: 10, terrain: "DESERT", army: { soldier: 1, tank: 1 } });

  it("acepta figuras separadas y gira las que se piden giradas", () => {
    const units = validatePlacement(config, desert, [
      { typeId: "tank", col: 0, row: 0, rotated: true },
      { typeId: "soldier", col: 5, row: 5, rotated: false },
    ]);
    expect(units[0]).toMatchObject({ width: 3, height: 2 });
  });

  it("rechaza figuras que se tocan en diagonal o se salen", () => {
    expect(() =>
      validatePlacement(config, desert, [
        { typeId: "tank", col: 0, row: 0, rotated: false },
        { typeId: "soldier", col: 2, row: 3, rotated: false },
      ])
    ).toThrow(/toca/);
    expect(() =>
      validatePlacement(config, desert, [
        { typeId: "tank", col: 9, row: 0, rotated: false },
        { typeId: "soldier", col: 5, row: 5, rotated: false },
      ])
    ).toThrow(/se sale/);
  });

  it("rechaza un ejercito distinto al de la sala", () => {
    expect(() => validatePlacement(config, desert, [{ typeId: "tank", col: 0, row: 0, rotated: false }])).toThrow(
      /exactamente/
    );
  });

  it("coloca al azar un ejercito valido", () => {
    const big = normalizeConfig({ cols: 20, rows: 15, terrain: "DESERT" });
    const layout = randomPlacement(big, desert)!;
    expect(layout).not.toBeNull();
    expect(() => validatePlacement(big, desert, layout)).not.toThrow();
  });
});

describe("Armeria", () => {
  it("el misil pega en cruz y se recorta en el borde", () => {
    expect(impactCells(findWeapon("MISSILE")!, 0, 0, 10, 10)).toHaveLength(3);
    expect(impactCells(findWeapon("BOMBING")!, 5, 5, 10, 10)).toHaveLength(9);
  });
});
