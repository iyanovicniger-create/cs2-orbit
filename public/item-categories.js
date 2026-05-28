/**
 * Категории оружия CS2 для витрины «Купить».
 * needle — подстрока в market_hash_name / названии лота.
 * patterns — если в категории отмечено «Выбрать все», ловим и редкие ножи/скины вне списка.
 */
(function (global) {
  const CATEGORIES = [
    {
      id: "knife",
      label: "Нож",
      patterns: [
        /\bknife\b/i,
        /karambit|bayonet|butterfly|flip knife|gut knife|falchion|bowie|huntsman|shadow daggers|paracord|survival knife|ursus|navaja|stiletto|talon knife|classic knife|nomad knife|skeleton knife|kukri/i,
        /★/,
      ],
      items: [
        { name: "Karambit", needle: "Karambit" },
        { name: "Bayonet", needle: "Bayonet" },
        { name: "Butterfly Knife", needle: "Butterfly" },
        { name: "M9 Bayonet", needle: "M9 Bayonet" },
        { name: "Flip Knife", needle: "Flip Knife" },
        { name: "Gut Knife", needle: "Gut Knife" },
        { name: "Falchion Knife", needle: "Falchion" },
        { name: "Bowie Knife", needle: "Bowie Knife" },
        { name: "Huntsman Knife", needle: "Huntsman" },
        { name: "Shadow Daggers", needle: "Shadow Daggers" },
        { name: "Ursus Knife", needle: "Ursus Knife" },
        { name: "Navaja Knife", needle: "Navaja Knife" },
        { name: "Stiletto Knife", needle: "Stiletto Knife" },
        { name: "Talon Knife", needle: "Talon Knife" },
        { name: "Nomad Knife", needle: "Nomad Knife" },
        { name: "Skeleton Knife", needle: "Skeleton Knife" },
        { name: "Paracord Knife", needle: "Paracord Knife" },
        { name: "Survival Knife", needle: "Survival Knife" },
        { name: "Classic Knife", needle: "Classic Knife" },
        { name: "Kukri Knife", needle: "Kukri Knife" },
      ],
    },
    {
      id: "pistol",
      label: "Пистолет",
      patterns: [
        /glock-18|usp-s|p2000|p250|five-seve|tec-9|cz75|desert eagle|dual berettas|r8 revolver/i,
      ],
      items: [
        { name: "Glock-18", needle: "Glock-18" },
        { name: "USP-S", needle: "USP-S" },
        { name: "P2000", needle: "P2000" },
        { name: "P250", needle: "P250" },
        { name: "Five-SeveN", needle: "Five-SeveN" },
        { name: "Tec-9", needle: "Tec-9" },
        { name: "CZ75-Auto", needle: "CZ75-Auto" },
        { name: "Desert Eagle", needle: "Desert Eagle" },
        { name: "Dual Berettas", needle: "Dual Berettas" },
        { name: "R8 Revolver", needle: "R8 Revolver" },
      ],
    },
    {
      id: "rifle",
      label: "Винтовка",
      patterns: [/ak-47|m4a4|m4a1-s|famas|galil ar|aug|sg 553/i],
      items: [
        { name: "AK-47", needle: "AK-47" },
        { name: "M4A4", needle: "M4A4" },
        { name: "M4A1-S", needle: "M4A1-S" },
        { name: "FAMAS", needle: "FAMAS" },
        { name: "Galil AR", needle: "Galil AR" },
        { name: "AUG", needle: "AUG" },
        { name: "SG 553", needle: "SG 553" },
      ],
    },
    {
      id: "sniper",
      label: "Снайперская",
      patterns: [/\bawp\b|ssg 08|scar-20|g3sg1/i],
      items: [
        { name: "AWP", needle: "AWP" },
        { name: "SSG 08", needle: "SSG 08" },
        { name: "SCAR-20", needle: "SCAR-20" },
        { name: "G3SG1", needle: "G3SG1" },
      ],
    },
    {
      id: "smg",
      label: "ПП",
      patterns: [/mac-10|mp9|mp7|mp5-sd|ump-45|p90|pp-bizon/i],
      items: [
        { name: "MAC-10", needle: "MAC-10" },
        { name: "MP9", needle: "MP9" },
        { name: "MP7", needle: "MP7" },
        { name: "MP5-SD", needle: "MP5-SD" },
        { name: "UMP-45", needle: "UMP-45" },
        { name: "P90", needle: "P90" },
        { name: "PP-Bizon", needle: "PP-Bizon" },
      ],
    },
    {
      id: "shotgun",
      label: "Дробовик",
      patterns: [/nova|xm1014|sawed-off|mag-7/i],
      items: [
        { name: "Nova", needle: "Nova" },
        { name: "XM1014", needle: "XM1014" },
        { name: "Sawed-Off", needle: "Sawed-Off" },
        { name: "MAG-7", needle: "MAG-7" },
      ],
    },
    {
      id: "gloves",
      label: "Перчатки",
      patterns: [/gloves|driver gloves|sport gloves|hand wraps|moto gloves|specialist gloves|hydra gloves|broken fang gloves|bloodhound gloves/i],
      items: [
        { name: "Sport Gloves", needle: "Sport Gloves" },
        { name: "Driver Gloves", needle: "Driver Gloves" },
        { name: "Hand Wraps", needle: "Hand Wraps" },
        { name: "Moto Gloves", needle: "Moto Gloves" },
        { name: "Specialist Gloves", needle: "Specialist Gloves" },
        { name: "Hydra Gloves", needle: "Hydra Gloves" },
        { name: "Broken Fang Gloves", needle: "Broken Fang Gloves" },
        { name: "Bloodhound Gloves", needle: "Bloodhound Gloves" },
      ],
    },
    {
      id: "agent",
      label: "Агент",
      patterns: [
        /NSWC SEAL|FBI|GIGN|SAS|SWAT|IDF|KSK|Phoenix|Elite Crew|Professionals|Guerrilla|Gendarmerie|Sabre|SEAL Frogman|Terrorist/i,
        /Sir Bloody|Cmdr\.|Lt\.|Ground Rebel|Getaway Sally|Soldier|Enforcer|Slingshot|Operator|Buckshot|Osiris|Maximus|Dragomir/i,
      ],
      items: [
        { name: "SEAL / FBI", needle: "NSWC SEAL" },
        { name: "Phoenix", needle: "Phoenix" },
        { name: "The Professionals", needle: "Professionals" },
        { name: "Elite Crew", needle: "Elite Crew" },
        { name: "Guerrilla Warfare", needle: "Guerrilla" },
      ],
    },
  ];

  const ICONS = {
    Karambit:
      "IzMF03bi9WpSBq-S-ekoE33L-iLqGFHVaU25ZzQNQcXdB2ozio1RrlIWFK3UfvMYB8UsvjiMXojflsZalyxSh31CIyHz2GZ-KuFpPsrTzBG0quOfHXn1YSOKeHCLTwlsG-BfMW7RqjX24-6XQGvOR-wlR18MLqRQ9WNBO8yMN0E43JlLpWL-lEtxEQQlZ8lSeR-30ykSN-R3zCc6mJUl-Q",
    Bayonet:
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLzn4_v8ydP0POjV6BiMOCfC3Wv0eZ3o-Q6cCW6khUz_T_TydyheXmVZwYoXpR5R-YIsRe6lIazP-7h4Qzbj4hEzSyq3HgY7ix1o7FVS1Hc8lA",
    Butterfly:
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Z-ua6bbZrLOmsBn6v1ut0o95kSi26gBBp5GSEn9_8diiVbVV1CJJyReFc5kLtwYDlY-y34QDW2oJDxSX5iikf7jErvbjdpassNw",
    P250: "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhzMOwwiBJ-uavZK1-NM-SHGSYyPpzs_V8XSyMmRQguynLn974cXzGPAYgXpV4F-4NtRK6l4LkP7i35lSIgt1Nny6thnhA7SdtsPFCD_QCdWsc4g",
    "Glock-18":
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1c4_2tY5tnJOCWC2yvzOtyufRkASjklhhwtzmGyI77dCjFOAEjXsQmRuFYs0TtxNflM7u04gaI3Y1MmX_gznQeT_sZuyk",
    "USP-S":
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSIf2sCmOAwPpJoPR7XyW2qhEutDWR1N-rcHPBPFMiDZUkF-9Z4ETtxtDkYu3js1ffg94Tnn2o3yMavH0957ocEf1yWMwziKM",
    "Desert Eagle":
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7OeRbKFsJ8-DHG6e1f1iouRoQha-kBkupjDLz9_6c3mWPFBxX8N0EOMIsULpmtHjPuvq41bc2dhAzy3_2ngfvHpt5_FCD_RJLjxjaQ",
    "AK-47":
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSI_-UGm-Zz-llj-xsSyCmmFMi5GrcwtivdnnCOgd2DsNxTeIJuxbqk9XuN-_i5gKI3d1BxH35iy1P8G81tKMOXOY4",
    "M4A4":
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_3HDzaD_ux6seJicCW8gQg0jDCAnobsLGWTbQQnDsN3QuYOtELqkIazZeLm7lPYj9gQzyj72y8du31i6ulQA6Rx5OSJ2CPXrFUp",
    FAMAS:
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3n5vh7h1d7v-ve5tvIfSHHG6A_uJ_t-l9AX6xzExytWndzdj6eCrGb1MkWZB2TOBc4xK8mtHkZezrsQOPjoITyi_gznQezHhrR0c",
    "Galil AR":
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2n5rp8SNJ0OGhbZtiMvGdCWKvx-J_s-pWRyyygwRpsT-Azt2td3_EOgMoDJt0TbNftxe4wIbhMeO0tg2K3dlMynj2hyhMvzErvbgB7-03WA",
    AWP: "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_DVL0OK8Yap5M-SBC2ad_uNztOh8QmexzUt1tj7UnN-vc3KWbw8nCpJzRrJY5xa8xNHuZOLr51bYjtkXyyj5kGoXuQMtNgKM",
    G3SG1:
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2zYXnrB1Y-s2pO7dqcc-UAmaUxNF7teVgWiT9xUR36m_Wm9ioJX7FalAiD5AjRuYKsETsldW1ZOvg71eLgt8Qm33-jTQJsHiK03zX7w",
    "SCAR-20":
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLinZfyr3Jk6OGRe6dsMs-VHGaXzOt4pPJWTSWylhYYvjiBk5r0b3mXZg5xDsYmQ-NetUK7kdzkP-jh5AaNgosUmCWr3Hga7iZpsroCA6U7uvqAa4cdOU4",
    "SSG 08":
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLijZGwpR1a7s2oaaBoH_eBD3SDze94tN5lRi67gVN05G3QzI6pIn2UOAYhDJMjEeANsBbtlYC2ZbvltA2P2I5FyHmq2Hka8G81tCngBDgW",
    "MAC-10":
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1Y-s2jaac8cM-AD2ybwOVjj-xsSyCmmFMk5mnRzdeqdSnCPVN2DpV3QeELtELrlIbiPrzqsVOMjdlBnySvjH5O8G81tOTP5a5f",
    MP9: "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8js_f-jFk4uL3V7d5IeKfB2CY1dF7teVgWiT9wU0htTjWnI2qcHvEZgQlW5VyROAD50W6lYDnN-zi5QyM2YtGzir43zQJsHh8IziyOQ",
    "UMP-45":
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkk4a0qB1O4uL6PZtiLPSsDWaC1eF5vt5lRi67gVN2tWXTzI6tc3rGPQ4kWJUiQrJf4RPskIW2ZO3r4VaKi9hFyX-qhy0a8G81tA_18T9p",
    Nova: "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_kYDhwjZJ7vugV7dlIeCWHVjAkNF6ueZhW2ewkUhysW6AzIqvdH2eOFQpC5ZzQeNc5kG8wNeyNL-w4wbfjNgRzn78kGoXuS8lQPk9",
    XM1014:
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLpk8ewrHZk9___OPU5H_aBC26XyfpJvOhuRz39xkh_5DjRmYr8IHyXZlIjX8NxQrQJ4xSxk9flZL-0sgOIi4NGySishjQJsHhKqh3UFQ",
    "MAG-7":
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5G3wiFO0P-vb_NSLf-dHXOV09F1se1lcCW6khUz_WncmIz8JHmTa1JyApd5FLEMsES-kNDhM-3i5QKM2Y5AzSr9jngY6Cp1o7FV7cAHRyI",
    "Sport Gloves":
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Tk5UvzWCL2kpn2-DFk_OKherB0H-OfB2mX0uZ5pN5hSiiljFMm4WTUyN6pcC2VawEnCcElRu5Y4UPtlIDnNOvj7gTX3opHzn_5iH4a8G81tDmtA2DM",
    "Driver Gloves":
      "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5T441rsfhr9kYDl7h1I4_utY5t-NPmHDW-VxdFxouRsQRa0hxg-jDCAnobsLGXEOwR0DsElQe4LuhjqwN2xNurn5waM2t5Byn762iNPvX1u4O8HB_Is5OSJ2OhUO7vy",
  };

  function enrichCategories() {
    return CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.map((it) => ({
        ...it,
        icon: it.icon || ICONS[it.needle] || ICONS[it.name] || null,
      })),
    }));
  }

  function normalizeTitle(title) {
    return String(title || "").trim();
  }

  function matchesNeedle(title, needle) {
    if (!needle) return false;
    return normalizeTitle(title).toLowerCase().includes(String(needle).toLowerCase());
  }

  function getCategory(id) {
    return CATEGORIES.find((c) => c.id === id);
  }

  function matchesCategory(title, categoryId) {
    const cat = getCategory(categoryId);
    if (!cat) return false;
    const t = normalizeTitle(title);
    if (!t) return false;
    if (cat.items.some((it) => matchesNeedle(t, it.needle))) return true;
    return (cat.patterns || []).some((p) => p.test(t));
  }

  function listingMatchesFilters(title, filters) {
    if (!filters || !filters.length) return true;
    const t = normalizeTitle(title);
    return filters.some((f) => {
      if (f.type === "category") return matchesCategory(t, f.id);
      if (f.type === "needle") return matchesNeedle(t, f.needle);
      return false;
    });
  }

  global.CS2ItemCategories = {
    CATEGORIES: enrichCategories(),
    matchesNeedle,
    matchesCategory,
    listingMatchesFilters,
  };
})(typeof window !== "undefined" ? window : globalThis);
