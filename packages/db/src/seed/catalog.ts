import type {
  ClassificationConfig,
  RuleGroup,
} from "@color-bank-hub/contracts/color-classification";
import { classifyColor } from "@color-bank-hub/contracts/color-classification";
import { and, eq } from "drizzle-orm";
import type { Database } from "../index.js";
import {
  brands,
  classificationConfigVersions,
  productFormatItems,
  productFormats,
  products,
  type Shade,
  shadeBenchmarks,
  shades,
} from "../schema/index.js";

// Development catalog for building Shade Mapping. Safe to re-run: every insert skips existing rows.

// shortcut: equal 36° Munsell areas on LCh hue, replace with the client's cut-offs (DATABASE_COLOR_MAPPING.xlsx, column Z).
const munsellAreas = ["R", "YR", "Y", "GY", "G", "BG", "B", "PB", "P", "RP"];
const hueMunsell: RuleGroup = {
  model: "lch",
  rules: munsellAreas.map((label, i) => ({
    label,
    hue: { min: i * 36, max: (i + 1) * 36 },
  })),
};

/** Lips (docs/brief/data-input.md): undertone and season from HSL; Hue Munsell, value and chroma from LCh. */
const lipConfig: ClassificationConfig = {
  undertone: {
    model: "hsl",
    rules: [
      { label: "neutral", hue: { min: 355, max: 5 } },
      { label: "warm", hue: { min: 5, max: 90 } },
      { label: "cool" },
    ],
  },
  season: {
    model: "hsl",
    rules: [
      {
        label: "neutral",
        hue: { min: 355, max: 5 },
        lightness: { min: 40, max: 60 },
      },
      {
        label: "winter",
        hue: { min: 315, max: 360 },
        lightness: { min: 0, max: 50 },
      },
      { label: "autumn", lightness: { min: 0, max: 50 } },
      { label: "summer", hue: { min: 315, max: 360 } },
      { label: "spring" },
    ],
  },
  hueMunsell,
  // Placeholder cut-offs below: replace with the client's numbers.
  colorFamily: {
    model: "hsl",
    rules: [
      {
        label: "Brown",
        lightness: { min: 0, max: 40 },
        saturation: { min: 0, max: 55 },
      },
      { label: "Red", hue: { min: 350, max: 8 } },
      { label: "Pink", hue: { min: 290, max: 350 } },
      {
        label: "Orange",
        hue: { min: 8, max: 25 },
        saturation: { min: 70, max: 100 },
      },
      { label: "Peach", hue: { min: 8, max: 45 } },
      { label: "Brown" },
    ],
  },
  valueClass: {
    model: "lch",
    rules: [
      { label: "Low", lightness: { min: 0, max: 40 } },
      { label: "Medium", lightness: { min: 40, max: 70 } },
      { label: "High" },
    ],
  },
  chromaClass: {
    model: "lch",
    rules: [
      { label: "Muted", saturation: { min: 0, max: 25 } },
      { label: "Medium", saturation: { min: 25, max: 50 } },
      { label: "Vivid" },
    ],
  },
};

/** Blush and eyeshadow read LCh for every label. All numbers are placeholders. */
const lchConfig: ClassificationConfig = {
  undertone: {
    model: "lch",
    rules: [
      { label: "neutral", hue: { min: 15, max: 30 } },
      { label: "warm", hue: { min: 30, max: 90 } },
      { label: "cool" },
    ],
  },
  season: {
    model: "lch",
    rules: [
      {
        label: "winter",
        hue: { min: 0, max: 30 },
        lightness: { min: 0, max: 50 },
      },
      { label: "autumn", lightness: { min: 0, max: 50 } },
      { label: "summer", hue: { min: 0, max: 30 } },
      { label: "spring" },
    ],
  },
  hueMunsell,
  colorFamily: {
    model: "lch",
    rules: [
      { label: "Pink", hue: { min: 330, max: 20 } },
      {
        label: "Red",
        hue: { min: 20, max: 35 },
        saturation: { min: 45, max: 200 },
      },
      { label: "Peach", hue: { min: 35, max: 70 } },
      { label: "Brown" },
    ],
  },
  valueClass: lipConfig.valueClass,
  chromaClass: lipConfig.chromaClass,
};

/** Category -> sub-categories [name, code, base type]. Codes from docs/brief/color-bank.md. */
const formats: [string, ClassificationConfig, [string, string, string][]][] = [
  [
    "Lip Cream",
    lipConfig,
    [
      ["Lip Velvet", "V", "Anhydrous"],
      ["Lip Matte", "LM", "Anhydrous"],
      ["Lip Vinyl", "LV", "Anhydrous"],
    ],
  ],
  [
    "Lip Tint",
    lipConfig,
    [
      ["Lip Tint Gloss", "TG", "Emulsion"],
      ["Lip Tint Velvet", "TM", "Emulsion"],
      ["Water Lip Tint", "TW", "Emulsion"],
    ],
  ],
  [
    "Lip Stick",
    lipConfig,
    [
      ["Matte Lipstick", "SM", "Semisolid"],
      ["Gloss Lipstick", "SG", "Semisolid"],
      ["Balm", "B", "Semisolid"],
    ],
  ],
  // shortcut: the brief has no code for Lip Oil; "LO" until the client confirms one.
  ["Lip Oil", lipConfig, [["Lip Oil / Lip Gloss", "LO", "Oil-based"]]],
  [
    "Blush",
    lchConfig,
    [
      ["Powder Blush", "BP", "Powder"],
      ["Liquid Blush", "BL", "Emulsion"],
    ],
  ],
  [
    "Eyeshadow",
    lchConfig,
    [
      ["Shimmer", "ES", "Powder"],
      ["Matte", "EM", "Powder"],
    ],
  ],
];

/** [brand, own brand] */
const brandList: [string, boolean][] = [
  ["Emina", true],
  ["Wardah", true],
  ["Make Over", true],
  ["2aN", false],
  ["Dinto", false],
  ["Etude", false],
];

/** [brand, product, sub-category code, SKU prefix (own brands only), shades [name, hex]] */
const productList: [
  string,
  string,
  string,
  string | null,
  [string, string][],
][] = [
  [
    "Emina",
    "Jelly Stain",
    "TG",
    "EM-JS",
    [
      ["01 Crimson Berry", "#9e2a4a"],
      ["02 Tomato Drop", "#d9534f"],
      ["03 Gummy Pink", "#e88aa8"],
      ["04 Cream Peach", "#e9967a"],
      ["05 Bubble Pop", "#e46f96"],
      ["06 Brown Sugar", "#a0522d"],
      ["07 Cherry Lit", "#e05a5a"],
      ["08 Ube Mochi", "#aa6d78"],
    ],
  ],
  [
    "Emina",
    "Glossy Stain",
    "TG",
    "EM-GS",
    [
      ["01 Autumn Bell", "#8b3a3a"],
      ["02 Apple Shower", "#d6405a"],
      ["03 Rainy Hazelrose", "#b5737a"],
      ["04 Peach Sprinkles", "#f4a582"],
    ],
  ],
  [
    "2aN",
    "Glaze Bouncing Tint",
    "TG",
    null,
    [
      ["01 Nudy Coco", "#fc8877"],
      ["02 Rosy Mocha", "#e97f84"],
      ["03 Lazy", "#dc7785"],
      ["04 Peach Chou", "#fe8478"],
      ["05 Bubbly", "#f76873"],
      ["06 Berry Shower", "#c94f7c"],
    ],
  ],
  [
    "Dinto",
    "Blur-Glowy Tint",
    "TG",
    null,
    [
      ["201 Hestia", "#c8705c"],
      ["204 Modestia", "#a5626e"],
      ["207 Rhea", "#7d2e3d"],
    ],
  ],
  [
    "Etude",
    "Glow Fixing Tint",
    "TG",
    null,
    [
      ["02 Mauve", "#b77c8f"],
      ["05 Coral", "#f2836b"],
      ["08 Red Sangria", "#9b1b30"],
    ],
  ],
  [
    "Wardah",
    "Colorfit Velvet Matte",
    "V",
    "WD-CV",
    [
      ["01 Nude", "#c48b7c"],
      ["05 Brick", "#8e3b2e"],
      ["09 Rose", "#b85a6e"],
    ],
  ],
  [
    "Make Over",
    "Powerstay Matte Lipstick",
    "SM",
    "MO-PS",
    [
      ["220 Ambitious", "#9c4a4a"],
      ["A06 Passion", "#b0203a"],
      ["08 Cinnamon", "#8a4b38"],
    ],
  ],
  [
    "Emina",
    "Cheeklit Pressed Blush",
    "BP",
    "EM-CB",
    [
      ["Peach", "#f6a68f"],
      ["Pink", "#f2a0b5"],
      ["Coral", "#f08a72"],
    ],
  ],
  [
    "Wardah",
    "Colorfit Liquid Blush",
    "BL",
    "WD-LB",
    [
      ["Rosy", "#e7899b"],
      ["Apricot", "#f3a37e"],
    ],
  ],
];

/** [own product, own shade] benchmarked to [external product, external shade] */
const benchmarkList: [string, string, string, string][] = [
  ["Jelly Stain", "08 Ube Mochi", "Blur-Glowy Tint", "204 Modestia"],
  ["Jelly Stain", "05 Bubble Pop", "Glaze Bouncing Tint", "06 Berry Shower"],
  [
    "Glossy Stain",
    "03 Rainy Hazelrose",
    "Glaze Bouncing Tint",
    "02 Rosy Mocha",
  ],
];

export async function seedCatalog(db: Database) {
  // Categories, sub-categories and one active config per category.
  for (const [sortOrder, [name, config, items]] of formats.entries()) {
    await db
      .insert(productFormats)
      .values({ name, sortOrder })
      .onConflictDoNothing();
    const [format] = await db
      .select()
      .from(productFormats)
      .where(eq(productFormats.name, name));
    await db
      .insert(productFormatItems)
      .values(
        items.map(([item, code, baseType], index) => ({
          productFormatId: format.id,
          name: item,
          code,
          baseType,
          sortOrder: index,
        })),
      )
      .onConflictDoNothing();
    await db
      .insert(classificationConfigVersions)
      .values({
        productFormatId: format.id,
        version: 1,
        config,
        isActive: true,
        note: "dummy – replace with client cut-offs",
      })
      .onConflictDoNothing();
  }

  await db
    .insert(brands)
    .values(brandList.map(([name, isOwn]) => ({ name, isOwn })))
    .onConflictDoNothing();
  const brandIds = new Map(
    (await db.select().from(brands)).map((row) => [row.name, row.id]),
  );

  // Sub-category code -> its id and the active config of its category.
  const itemRows = await db
    .select({
      id: productFormatItems.id,
      code: productFormatItems.code,
      configId: classificationConfigVersions.id,
      config: classificationConfigVersions.config,
    })
    .from(productFormatItems)
    .innerJoin(
      classificationConfigVersions,
      and(
        eq(
          classificationConfigVersions.productFormatId,
          productFormatItems.productFormatId,
        ),
        eq(classificationConfigVersions.isActive, true),
      ),
    );
  const itemsByCode = new Map(itemRows.map((row) => [row.code, row]));

  const shadeIds = new Map<string, string>();
  for (const [brand, name, code, skuPrefix, shadeList] of productList) {
    const item = itemsByCode.get(code);
    const brandId = brandIds.get(brand);
    if (!item || !brandId)
      throw new Error(`Missing format ${code} or brand ${brand}`);

    await db
      .insert(products)
      .values({
        brandId,
        productFormatItemId: item.id,
        name,
        ingredientsInci: "Aqua, Glycerin, Dimethicone, Isododecane",
      })
      .onConflictDoNothing();
    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.brandId, brandId), eq(products.name, name)));

    const config = item.config as ClassificationConfig;
    await db
      .insert(shades)
      .values(
        shadeList.map(([shade, hex], index) => {
          const color = classifyColor(hex, config);
          return {
            ...color,
            undertone: color.undertone as Shade["undertone"],
            season: color.season as Shade["season"],
            productId: product.id,
            name: shade,
            hex,
            sku:
              skuPrefix && `${skuPrefix}-${String(index + 1).padStart(2, "0")}`,
            classificationConfigVersionId: item.configId,
          };
        }),
      )
      .onConflictDoNothing();

    const rows = await db
      .select({ id: shades.id, name: shades.name })
      .from(shades)
      .where(eq(shades.productId, product.id));
    for (const row of rows) shadeIds.set(`${name}|${row.name}`, row.id);
  }

  await db
    .insert(shadeBenchmarks)
    .values(
      benchmarkList.map(
        ([product, shade, benchmarkProduct, benchmarkShade]) => ({
          shadeId: shadeIds.get(`${product}|${shade}`) ?? "",
          benchmarkShadeId:
            shadeIds.get(`${benchmarkProduct}|${benchmarkShade}`) ?? "",
        }),
      ),
    )
    .onConflictDoNothing();

  console.log(
    `ok: catalog (${formats.length} categories, ${productList.length} products, ${shadeIds.size} shades)`,
  );
}
