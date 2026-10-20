import type { ShadeProfile } from "@/components/shared/product-detail-panel";

export const tableRows = [
  {
    brand: "2aN",
    product: "Glaze Bouncing Tint",
    shade: "01 Nudy Coco",
    hex: "#fc8877",
    undertone: "Warm",
    season: "Spring",
  },
  {
    brand: "2aN",
    product: "Glaze Bouncing Tint",
    shade: "02 Rosy Mocha",
    hex: "#ce7185",
    undertone: "Neutral",
    season: "Summer",
  },
  {
    brand: "2aN",
    product: "Glaze Bouncing Tint",
    shade: "03 Lazy",
    hex: "#b9677a",
    undertone: "Cool",
    season: "Summer",
  },
  {
    brand: "2aN",
    product: "Glaze Bouncing Tint",
    shade: "04 Peach Chou",
    hex: "#ed8c79",
    undertone: "Warm",
    season: "Spring",
  },
  {
    brand: "Emina",
    product: "Jelly Stain",
    shade: "08 Ube Mochi",
    hex: "#aa6d78",
    undertone: "Cool",
    season: "Winter",
  },
  {
    brand: "Emina",
    product: "Glossy Stain",
    shade: "01 Autumn Bell",
    hex: "#84364b",
    undertone: "Cool",
    season: "Winter",
  },
  {
    brand: "Emina",
    product: "Jelly Stain",
    shade: "02 Tomato Drop",
    hex: "#d45865",
    undertone: "Warm",
    season: "Spring",
  },
  {
    brand: "2aN",
    product: "Glaze Bouncing Tint",
    shade: "06 Berry Shower",
    hex: "#de5583",
    undertone: "Cool",
    season: "Summer",
  },
] satisfies Omit<ShadeProfile, "format" | "ingredients">[];

export const sampleProfile: ShadeProfile = {
  ...tableRows[4],
  format: "Lip Tint · Lip Tint Gloss",
  benchmark: "Dinto Blur-Glowy Tint #204 Modestia",
  ingredients:
    "Aqua, Phytosteryl/Isostearyl/Cetyl/Stearyl/Behenyl Dimer Dilinoleate, Octyldodecanol, Glycerin, PEG-8 Beeswax, Ethylcellulose, Hydroxyethylcellulose, Silica, Phenoxyethanol. May contain: CI 77891, CI 16035, CI 77492, CI 77499, CI 77491, CI 17200, CI 19140, CI 45380, CI 15510, CI 45410, CI 42090.",
  composition: [
    { name: "Red 7057", percentage: 43 },
    { name: "Red 7008", percentage: 29.7 },
    { name: "Orange 205", percentage: 23.7 },
    { name: "Blue pigment", percentage: 3.6 },
  ],
};
