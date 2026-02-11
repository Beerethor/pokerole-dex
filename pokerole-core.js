/**
 * Pokérole Core Engine - 2026 Edition
 * Gestisce la progressione, i ranghi e il calcolo delle statistiche.
 */

const PokeroleEngine = {
    // Visualizzazione pallini (fino a 8)
    renderDots: function(val) {
        let html = '';
        for (let i = 1; i <= 8; i++) {
            let status = '';
            if (i <= val) status = i > 5 ? 'filled overcap' : 'filled';
            html += `<span class="dot ${status}"></span>`;
        }
        return html;
    },

    // Funzione di distribuzione punti rispettando i cap di rango
    distribute: function(obj, points, maxPerSlot, globalMaxMap, bonusLimit = 0) {
        let keys = Object.keys(obj);
        let attempts = 0;
        while (points > 0 && attempts < 500) {
            let k = keys[Math.floor(Math.random() * keys.length)];
            let limit = (globalMaxMap && globalMaxMap[k] ? globalMaxMap[k] : 5) + bonusLimit;
            let cap = Math.min(maxPerSlot, limit);
            
            if (obj[k] < cap) {
                obj[k]++;
                points--;
            }
            attempts++;
        }
    },

    // Calcola l'intera scheda basata sul rango scelto
    calculateRank: function(basePkmn, rankIndex) {
        let p = JSON.parse(JSON.stringify(basePkmn));
        let rank = parseInt(rankIndex);
        
        let attr = { forza: p.attributi.forza.base, destrezza: p.attributi.destrezza.base, vitalita: p.attributi.vitalita.base, special: p.attributi.special.base, insight: p.attributi.insight.base };
        let maxAttrs = { forza: p.attributi.forza.max, destrezza: p.attributi.destrezza.max, vitalita: p.attributi.vitalita.max, special: p.attributi.special.max, insight: p.attributi.insight.max };
        let skills = { Brawl:0, Channel:0, Clash:0, Evasion:0, Alert:0, Athletic:0, Nature:0, Stealth:0, Allure:0, Etiquette:0, Intimidate:0, Perform:0 };
        let social = { Tough:0, Cool:0, Beauty:0, Cute:0, Clever:0 };
        let flatBonus = 0;

        // --- APPLICAZIONE REGOLE RANGHI ---
        // Starter
        this.distribute(skills, 5, 1);
        
        if (rank >= 2) { // Beginner
            this.distribute(attr, 2, 10, maxAttrs); this.distribute(social, 2, 5); this.distribute(skills, 4, 2);
        }
        if (rank >= 3) { // Amateur
            this.distribute(attr, 2, 10, maxAttrs); this.distribute(social, 2, 5); this.distribute(skills, 3, 3);
        }
        if (rank >= 4) { // Ace
            this.distribute(attr, 2, 10, maxAttrs); this.distribute(social, 2, 5); this.distribute(skills, 2, 4);
        }
        if (rank >= 5) { // Professional
            this.distribute(attr, 2, 10, maxAttrs); this.distribute(social, 2, 5); this.distribute(skills, 1, 5);
        }
        if (rank >= 6) { // Master
            this.distribute(social, 14, 5);
            let roll = (Math.floor(Math.random()*6)+1) + (Math.floor(Math.random()*6)+1);
            this.distribute(skills, roll, 5);
            flatBonus = 2;
        }
        if (rank >= 7) { // Champion
            this.distribute(attr, 14, 10, maxAttrs, 2); 
            this.distribute(skills, 1, 5);
        }

        return {
            ...p,
            attr, skills, social,
            hp: p.vitalita_max.hp + attr.vitalita + rank + flatBonus,
            will: attr.insight + 2 + flatBonus,
            combat: {
                iniziativa: attr.destrezza + skills.Alert + flatBonus,
                evadere: attr.destrezza + skills.Evasion,
                difesa: attr.vitalita + flatBonus,
                difesa_speciale: attr.insight + flatBonus,
                parata: attr.forza + skills.Clash,
                parata_speciale: attr.special + skills.Clash
            }
        };
    }
};
