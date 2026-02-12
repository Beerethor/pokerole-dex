// rankup.js - Logica di progressione Pokerole
// rankup.js

export const RANK_ORDER = ["Starter", "Amateur", "Ace", "Pro", "Master"];

export const RANK_BONUSES = {
    "Amateur": { attr: 2, skills: 3, social: 1 },
    "Ace":     { attr: 2, skills: 4, social: 2 },
    "Pro":     { attr: 3, skills: 5, social: 2 },
    "Master":  { attr: 4, skills: 6, social: 3 }
};

export function getNextRank(currentRank) {
    const idx = RANK_ORDER.indexOf(currentRank);
    if (idx === -1 || idx === RANK_ORDER.length - 1) return null;
    return RANK_ORDER[idx + 1];
}

// Funzione opzionale se vuoi centralizzare i calcoli qui
export function calculateCombatStats(pk) {
    const getV = (obj, ...keys) => { for (let k of keys) { if (obj && obj[k] !== undefined) return obj[k]; } return 0; };
    
    const str = getV(pk.attr, 'Strength', 'Forza');
    const dex = getV(pk.attr, 'Dexterity', 'Destrezza');
    const vig = getV(pk.attr, 'Vitality', 'Vigore');
    const spe = getV(pk.attr, 'Special', 'Speciale');
    const int = getV(pk.attr, 'Insight', 'Intuito');
    const eva = getV(pk.skills, 'Evasion', 'Evasione');

    return {
        iniziativa: dex + int,
        evadere: dex + eva,
        difesaFisica: vig,
        difesaSpeciale: int,
        parataFisica: str + vig,
        parataSpeciale: spe + vig
    };
}
