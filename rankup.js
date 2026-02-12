// rankup.js - Logica di progressione Pokerole
export const RANK_ORDER = ["Starter", "Beginner", "Amateur", "Ace", "Pro", "Master", "Champion"];

export const RANK_BONUSES = {
    "Beginner": { attr: 2, social: 2, skills: 4, skillMax: 2 },
    "Amateur":  { attr: 2, social: 2, skills: 3, skillMax: 3 },
    "Ace":       { attr: 2, social: 2, skills: 2, skillMax: 4 },
    "Pro":       { attr: 2, social: 2, skills: 1, skillMax: 5 },
    "Master":    { social: 14, combatBonus: 2 }, // HP, Will, Iniz, Dif, DifSpec +2
    "Champion":  { attr: 14, attrMaxBonus: 2, skills: 1 }
};

export function getNextRank(currentRank) {
    const currentIndex = RANK_ORDER.indexOf(currentRank);
    if (currentIndex >= 0 && currentIndex < RANK_ORDER.length - 1) {
        return RANK_ORDER[currentIndex + 1];
    }
    return null;
}

export function calculateCombatStats(pk) {
    // Ricalcola le statistiche derivate dopo i cambiamenti agli attributi
    return {
        iniziativa: pk.attr.Destrezza + pk.attr.Intuizione,
        evadere: pk.attr.Destrezza + pk.skills.Allerta,
        difesa: pk.attr.Vigore + pk.skills.Rissa,
        difesa_speciale: pk.attr.Volonta + pk.skills.Allerta
    };
}
