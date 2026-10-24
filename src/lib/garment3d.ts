// Which 3D garment to show for a design: the closest of the MakeHuman garments (public/body3d/garments/<sex>/<name>.glb)
// to what the person drafted, from its kind and the details they confirmed (length, skirt, sleeves, neckline, shape,
// leg). A stand-in, not the drafted garment itself: it shows the kind of thing on the body, fitted to it.
import type { Kind } from "./data";
import type { Sex3D } from "./fitBody";

export function garment3dFor(kind: Kind, details: [string, string][] | undefined, sex: Sex3D, template?: string): string {
  const v = (k: string) => details?.find(([x]) => x === k)?.[1] ?? "";
  const length = v("Length"), sleeves = v("Sleeves"), neck = v("Neckline");

  if (kind === "dress") {
    const skirt = v("Skirt");
    if (neck === "Halter") {
      if (length === "Extra mini" || length === "Mini") return "elvs_halter_dress_mini";
      if (length === "Above the knee" || length === "Knee") return "elvs_halter_dress_knee_length";
      if (length === "Maxi") return "elvs_halter_dress_long";
      return "toigo_halter_dress_midi";
    }
    if (skirt === "Wrap" || template === "wrap") return "aethelraed_flapper_dress";
    if (sleeves === "Thin straps" || skirt === "Bias cut" || template === "slip") return "toigo_camisole_dress_with_full_skirt";
    const sleeveless = sleeves === "Sleeveless" || sleeves === "";
    if (skirt === "Straight" || skirt === "Bodycon" || skirt === "Pencil" || skirt === "Mermaid") return sleeveless ? "toigo_shift_dress" : "mindfront_f_dress_01";
    return sleeveless ? "mindfront_f_dress_02" : "mindfront_f_dress_01";
  }

  if (kind === "top") {
    if (neck === "Collar" || template === "shirt") return "elvs_male_shirt_untucked_bd1";
    if (neck === "Halter") return "punkduck_spaghetti_strap_tank_top";
    if (sleeves === "Thin straps") return neck === "V-neck" ? "punkduck_v_neck_top" : "toigo_camisole_top";
    if (sleeves === "Sleeveless") return neck === "V-neck" ? "punkduck_v_neck_top" : "punkduck_spaghetti_strap_tank_top";
    if (sleeves === "Flutter" || sleeves === "Puff" || sleeves === "Bell") return "elvs_ruffle_sleeve_peasant_blouse_1";
    if (sleeves === "Long") return "toigo_fisherman_sweater";
    return sex === "male" ? "elvs_crude_t-shirt_male" : "joepal_crude_t-shirt_female";
  }

  if (kind === "skirt") {
    const shape = v("Shape");
    const short = length === "Mini" || length === "Above the knee";
    if (shape === "Pencil" || shape === "Straight") return "elvs_pencil_skirt";
    if (shape === "Bias cut" || shape === "Wrap") return "elvs_gored_midi_skirt";
    if (shape === "A-line") return short ? "scsouza_mini_denin_skirt" : length === "Midi" || length === "Maxi" ? "elvs_gored_midi_skirt" : "toigo_skirt_with_lace_ruffle";
    if (length === "Midi" || length === "Maxi") return "toigo_long_full_skirt";
    return "toigo_skirt_with_lace_ruffle";
  }

  // trousers
  const leg = v("Leg");
  if (leg === "Wide" || leg === "Flared" || leg === "Barrel") return "elvs_gored_elephant_pants";
  if (sex === "male") return "mindfront_male_trousers_1";
  if (leg === "Slim" || leg === "Tapered") return "elvs_jeans_straight_leg";
  return "toigo_wool_pants";
}
