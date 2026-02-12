const PokeroleEngine = {
    renderDots: function(val) {
        let html = '';
        for (let i = 1; i <= 8; i++) {
            let status = '';
            if (i <= val) status = i > 5 ? 'filled overcap' : 'filled';
            html += `<span class="dot ${status}"></span>`;
        }
        return html;
    },

    /**
     * Distribuisce i punti in modo randomizzato rispettando i limiti
     * @param {Object} obj - L'oggetto da modificare (attr, skills, social)
     * @param {Number} points - Punti da distribuire
     * @param {Number} maxPerSlot - Il limite massimo per questo rango (es. max 2 per Beginner)
     * @param {Object} globalMaxMap - La mappa dei massimali naturali del Pokémon
     * @param {Number} bonusLimit - Bonus extra oltre il limite naturale (usato per Champion)
     */
    distribute: function(obj, points, maxPerSlot, globalMaxMap, bonusLimit = 0) {
        let keys = Object.keys(obj);
        let attempts = 0;
        while (points > 0 && attempts < 500) {
            let k = keys[Math.floor(Math.random() * keys.length)];
            
            // Il limite è il minimo tra il "cap del rango" e il "massimale della specie (+ eventuale bonus)"
            let limitSpecies = (globalMaxMap && globalMaxMap[k] ? globalMaxMap[k] : 5) + bonusLimit;
            let cap = Math.min(maxPerSlot, limitSpecies);
            
            if (obj[k] < cap) { 
                obj[k]++; 
                points--; 
            }
            attempts++;
        }
    },

    calculateRank: function(basePkmn, rankIndex) {
        let p = JSON.parse(JSON.stringify(basePkmn));
        let rank = parseInt(rankIndex); // 1:Starter, 2:Beginner, 3:Amateur, 4:Ace, 5:Pro, 6:Master, 7:Champion
        
        let attr = { 
            forza: p.attributi.forza.base, 
            destrezza: p.attributi.destrezza.base, 
            vitalita: p.attributi.vitalita.base, 
            special: p.attributi.special.base, 
            insight: p.attributi.insight.base 
        };
        
        let maxAttrs = { 
            forza: p.attributi.forza.max, 
            destrezza: p.attributi.destrezza.max, 
            vitalita: p.attributi.vitalita.max, 
            special: p.attributi.special.max, 
            insight: p.attributi.insight.max 
        };

        let skills = { Brawl:0, Channel:0, Clash:0, Evasion:0, Alert:0, Athletic:0, Nature:0, Stealth:0, Allure:0, Etiquette:0, Intimidate:0, Perform:0 };
        let social = { Tough:0, Cool:0, Beauty:0, Cute:0, Clever:0 };
        let flatBonus = 0;

        // --- APPLICAZIONE LOGICA CUMULATIVA ---

        // RANGO 1: STARTER (Sempre applicato)
        this.distribute(skills, 5, 1);

        // RANGO 2: BEGINNER
        if (rank >= 2) { 
            this.distribute(attr, 2, 10, maxAttrs); 
            this.distribute(social, 2, 5); 
            this.distribute(skills, 4, 2); 
        }

        // RANGO 3: AMATEUR
        if (rank >= 3) { 
            this.distribute(attr, 2, 10, maxAttrs); 
            this.distribute(social, 2, 5); 
            this.distribute(skills, 3, 3); 
        }

        // RANGO 4: ACE
        if (rank >= 4) { 
            this.distribute(attr, 2, 10, maxAttrs); 
            this.distribute(social, 2, 5); 
            this.distribute(skills, 2, 4); 
        }

        // RANGO 5: PRO
        if (rank >= 5) { 
            this.distribute(attr, 2, 10, maxAttrs); 
            this.distribute(social, 2, 5); 
            this.distribute(skills, 1, 5); 
        }

        // RANGO 6: MASTER
        if (rank >= 6) { 
            this.distribute(social, 14, 5);
            // HP, Will, Iniziativa, Difese ricevono +2
            flatBonus = 2; 
        }

        // RANGO 7: CHAMPION
        if (rank >= 7) { 
            // 14 punti attributi, possono superare il max di 2
            this.distribute(attr, 14, 10, maxAttrs, 2); 
            this.distribute(skills, 1, 5); 
        }

        // Ricalcolo statistiche finali
        return {
            ...p, 
            attr, 
            skills, 
            social,
            rango: ["Starter", "Starter", "Beginner", "Amateur", "Ace", "Pro", "Master", "Champion"][rank],
            hp: p.vitalita_max.hp + attr.vitalita + (rank - 1) + flatBonus,
            will: attr.insight + 2 + flatBonus,
            combat: {
                iniziativa: attr.destrezza + attr.insight + flatBonus,
                evadere: attr.destrezza + skills.Evasion,
                difesa: attr.vitalita + skills.Brawl + flatBonus,
                difesa_speciale: attr.insight + skills.Alert + flatBonus,
                // Statistiche opzionali Pokerole
                parata: attr.forza + skills.Clash,
                parata_speciale: attr.special + skills.Clash
            }
        };
    }
};

export default PokeroleEngine;
