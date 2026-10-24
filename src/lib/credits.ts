// The 3D garments' credits (tools/body3d/garments.json), shown in About Venty: each garment's title, its author, its
// licence and its page in the MakeHuman asset repository, as listed there (made from the asset packs' pages and each
// garment's own file, 25 Oct 2026). CC BY garments must be credited; CC0 ones are credited anyway. Every garment was
// changed for Venty: fitted to Venty's bodies, resized with every measurement, and its textures made smaller.
export type Credit = { asset: string; title: string; author: string; licence: string; source: string };
export const LICENCE_URL: Record<string, string> = {
  "CC0": "https://creativecommons.org/publicdomain/zero/1.0/",
  "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/",
  "CC BY 3.0": "https://creativecommons.org/licenses/by/3.0/"
};
export const GARMENT_CREDITS: Credit[] = [
  {
    "asset": "toigo_camisole_dress_with_full_skirt",
    "title": "Camisole dress with full skirt",
    "author": "MargaretToigo",
    "licence": "CC0",
    "source": "https://www.makehumancommunity.org/node/1730"
  },
  {
    "asset": "aethelraed_flapper_dress",
    "title": "Flapper dress",
    "author": "Aethelraed_Unraed",
    "licence": "CC0",
    "source": "https://www.makehumancommunity.org/node/581"
  },
  {
    "asset": "mindfront_f_dress_02",
    "title": "F dress 02",
    "author": "Mindfront",
    "licence": "CC BY 4.0",
    "source": "https://www.makehumancommunity.org/node/346"
  },
  {
    "asset": "mindfront_f_dress_01",
    "title": "F dress 01",
    "author": "Mindfront",
    "licence": "CC BY 4.0",
    "source": "https://www.makehumancommunity.org/node/343"
  },
  {
    "asset": "toigo_camisole_top",
    "title": "Camisole top",
    "author": "MargaretToigo",
    "licence": "CC0",
    "source": "https://www.makehumancommunity.org/node/1726"
  },
  {
    "asset": "joepal_crude_t-shirt_female",
    "title": "Crude t shirt female",
    "author": "Joel Palmius",
    "licence": "CC0",
    "source": "https://www.makehumancommunity.org/node/894"
  },
  {
    "asset": "elvs_crude_t-shirt_male",
    "title": "Crude t shirt male",
    "author": "Elvaerwyn",
    "licence": "CC0",
    "source": "https://www.makehumancommunity.org/node/1416"
  },
  {
    "asset": "elvs_male_shirt_untucked_bd1",
    "title": "Male shirt untucked bd1",
    "author": "Elvaerwyn",
    "licence": "CC BY",
    "source": "https://www.makehumancommunity.org/node/1800"
  },
  {
    "asset": "elvs_gored_elephant_pants",
    "title": "Gored elephant pants",
    "author": "Elvaerwyn",
    "licence": "CC BY",
    "source": "https://www.makehumancommunity.org/node/2577"
  },
  {
    "asset": "toigo_wool_pants",
    "title": "Wool pants",
    "author": "MargaretToigo",
    "licence": "CC0",
    "source": "https://www.makehumancommunity.org/node/1194"
  },
  {
    "asset": "elvs_gored_midi_skirt",
    "title": "Gored midi skirt",
    "author": "Elvaerwyn",
    "licence": "CC BY",
    "source": "https://www.makehumancommunity.org/node/2576"
  },
  {
    "asset": "scsouza_mini_denin_skirt",
    "title": "Mini denin skirt",
    "author": "scsouza",
    "licence": "CC BY",
    "source": "https://www.makehumancommunity.org/node/293"
  },
  {
    "asset": "elvs_halter_dress_mini",
    "title": "Halter dress mini",
    "author": "Elvaerwyn",
    "licence": "CC BY",
    "source": "https://www.makehumancommunity.org/node/1921"
  },
  {
    "asset": "elvs_halter_dress_knee_length",
    "title": "Halter dress knee length",
    "author": "Elvaerwyn",
    "licence": "CC BY",
    "source": "https://www.makehumancommunity.org/node/1922"
  },
  {
    "asset": "elvs_halter_dress_long",
    "title": "Halter dress long",
    "author": "Elvaerwyn",
    "licence": "CC BY",
    "source": "https://www.makehumancommunity.org/node/1923"
  },
  {
    "asset": "toigo_halter_dress_midi",
    "title": "Halter dress midi",
    "author": "MargaretToigo",
    "licence": "CC0",
    "source": "https://www.makehumancommunity.org/node/1854"
  },
  {
    "asset": "toigo_shift_dress",
    "title": "Shift dress",
    "author": "MargaretToigo",
    "licence": "CC0",
    "source": "https://www.makehumancommunity.org/node/1724"
  },
  {
    "asset": "toigo_long_full_skirt",
    "title": "Long full skirt",
    "author": "MargaretToigo",
    "licence": "CC0",
    "source": "https://www.makehumancommunity.org/node/1727"
  },
  {
    "asset": "toigo_skirt_with_lace_ruffle",
    "title": "Skirt with lace ruffle",
    "author": "MargaretToigo",
    "licence": "CC0",
    "source": "https://www.makehumancommunity.org/node/1731"
  },
  {
    "asset": "elvs_pencil_skirt",
    "title": "Pencil skirt",
    "author": "Elvaerwyn",
    "licence": "CC BY",
    "source": "https://www.makehumancommunity.org/node/2581"
  },
  {
    "asset": "mindfront_male_trousers_1",
    "title": "Male trousers 1",
    "author": "Mindfront",
    "licence": "CC BY 4.0",
    "source": "https://www.makehumancommunity.org/node/746"
  },
  {
    "asset": "elvs_jeans_straight_leg",
    "title": "Jeans straight leg",
    "author": "Elvaerwyn",
    "licence": "CC BY",
    "source": "https://www.makehumancommunity.org/node/1802"
  },
  {
    "asset": "punkduck_spaghetti_strap_tank_top",
    "title": "Spaghetti strap tank top",
    "author": "punkduck",
    "licence": "CC BY 3.0",
    "source": "https://www.makehumancommunity.org/node/459"
  },
  {
    "asset": "punkduck_v_neck_top",
    "title": "V neck top",
    "author": "punkduck",
    "licence": "CC BY 3.0",
    "source": "https://www.makehumancommunity.org/node/419"
  },
  {
    "asset": "elvs_ruffle_sleeve_peasant_blouse_1",
    "title": "Ruffle sleeve peasant blouse 1",
    "author": "Elvaerwyn",
    "licence": "CC BY",
    "source": "https://www.makehumancommunity.org/node/1256"
  },
  {
    "asset": "toigo_fisherman_sweater",
    "title": "Fisherman sweater",
    "author": "MargaretToigo",
    "licence": "CC0",
    "source": "https://www.makehumancommunity.org/node/1187"
  },
  {
    "asset": "mindfront_cardigan_long_open_front",
    "title": "Cardigan long open front",
    "author": "Mindfront",
    "licence": "CC BY 4.0",
    "source": "https://www.makehumancommunity.org/node/1528"
  }
];
// the body: MakeHuman's base mesh and targets
export const BODY_CREDIT = { title: "MakeHuman base mesh and body shapes", author: "The MakeHuman team", licence: "CC0", source: "https://static.makehumancommunity.org/" };
