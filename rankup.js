export const RANK_BONUSES = {
    "Starter": { attr: 0, social: 0, skill: 5, skillMax: 1, perSkillMax: 1, hp: 0, will: 0 },
    "Beginner": { attr: 2, social: 2, skill: 4, skillMax: 2, perSkillMax: 99, hp: 1, will: 1 },
    "Amateur": { attr: 2, social: 2, skill: 3, skillMax: 3, perSkillMax: 99, hp: 1, will: 1 },
    "Ace": { attr: 2, social: 2, skill: 2, skillMax: 4, perSkillMax: 99, hp: 1, will: 1 },
    "Professional": { attr: 2, social: 2, skill: 1, skillMax: 5, perSkillMax: 99, hp: 1, will: 1 },
    "Master": { attr: 0, social: 14, skill: 0, skillMax: 5, perSkillMax: 99, hp: 2, will: 2 },
    "Champion": { attr: 14, social: 0, skill: 1, skillMax: 6, perSkillMax: 99, hp: 1, will: 1 } 
};

export function getNextRank(current) {
    const ranks = ["Starter", "Beginner", "Amateur", "Ace", "Professional", "Master", "Champion"];
    const idx = ranks.indexOf(current);
    return (idx !== -1 && idx < ranks.length - 1) ? ranks[idx + 1] : null;
}

/**
 * Calcola i massimali attuali del Pokémon.
 * Se è Champion, aggiunge +2 ai limiti del database.
 */
export function getStatLimits(pokemon, dbBase) {
    const isChampion = pokemon.rank === "Champion";
    const bonus = isChampion ? 2 : 0;
    
    // Se dbBase non è passato, proviamo a usare i limiti standard (5)
    const baseLimits = dbBase?.attrMax || dbBase?.maxStats || {};
    
    return {
        Strength: (baseLimits.Strength || baseLimits.Forza || 5) + bonus,
        Dexterity: (baseLimits.Dexterity || baseLimits.Destrezza || 5) + bonus,
        Vitality: (baseLimits.Vitality || baseLimits.Vigore || 5) + bonus,
        Special: (baseLimits.Special || 5) + bonus,
        Insight: (baseLimits.Insight || baseLimits.Intuito || 5) + bonus
    };
}

export function calculateDerivedStats(pk) {
    const attr = pk.attr || {};
    const skills = pk.skills || {};
    const getV = (obj, ...keys) => {
        for (let k of keys) if (obj[k] !== undefined) return parseInt(obj[k]);
        return 0;
    };

    const str = getV(attr, 'Strength', 'Forza');
    const dex = getV(attr, 'Dexterity', 'Destrezza');
    const vig = getV(attr, 'Vitality', 'Vigore');
    const spe = getV(attr, 'Special');
    const ins = getV(attr, 'Insight', 'Intuito');
    const eva = getV(skills, 'Evasion', 'Evasione');

    return {
        iniziativa: dex + ins,
        evadere: dex + eva,
        difesaFisica: vig,
        difesaSpeciale: ins,
        parataFisica: str + vig,
        parataSpeciale: spe + vig
    };
}

export function finalizeRankUp(pokemon, choices, dbBase) {
    const nextRank = getNextRank(pokemon.rank);
    const bonus = RANK_BONUSES[nextRank];
    const limits = getStatLimits({rank: nextRank}, dbBase);
    
    let p = JSON.parse(JSON.stringify(pokemon));

    p.rank = nextRank;
    p.hp = (parseInt(p.hp) || 0) + bonus.hp;
    p.will = (parseInt(p.will) || 0) + bonus.will;

    // Controllo e applicazione Attributi con limite da database
    for (let s in choices.attr) {
        let currentVal = (p.attr[s] || 0);
        let added = choices.attr[s];
        // Non superiamo il limite del database (+ eventuale bonus champion)
        p.attr[s] = Math.min(currentVal + added, limits[s] || 5);
    }

    // Applicazione Skill (limite dato dal rango)
    for (let s in choices.skills) {
        let currentVal = (p.skills[s] || 0);
        p.skills[s] = Math.min(currentVal + choices.skills[s], bonus.skillMax);
    }

    // Social (max 10 sempre)
    for (let s in choices.social) {
        p.social[s] = Math.min((p.social[s] || 0) + choices.social[s], 10);
    }

    p.combat = calculateDerivedStats(p);
    return p;
}
