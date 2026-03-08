async function fetchAITips(emissions){
    const response = await fetch("http://localhost:3000/ai-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emissions })
    });
    const data = await response.json();
    return data.tips;
}

async function calculate() {
    // Valeurs
    let car = Number(document.getElementById("car").value || 0);
    let electricity = Number(document.getElementById("electricity").value || 0);
    let gas = Number(document.getElementById("gas").value || 0);
    let fuel = Number(document.getElementById("fuel").value || 0);
    let waste = Number(document.getElementById("waste").value || 0);
    let meat = Number(document.getElementById("meat").value || 0);
    let veg = Number(document.getElementById("veg").value || 0);
    let wood = Number(document.getElementById("wood").value || 0);
    let charcoal = Number(document.getElementById("charcoal").value || 0);
    const FACTORS = {car:0.2,electricity:0.05,gas:0.2,fuel:2.6,waste:0.7,meat:7,veg:2, wood:1.8, charcoal:6.6};
    let emissions = {
        "Voiture": car*FACTORS.car,
        "Électricité": electricity*FACTORS.electricity,
        "Gaz": gas*12*FACTORS.gas,
        "Fioul": fuel*12*FACTORS.fuel,
        "Déchets": waste*12*FACTORS.waste,
        "Viande": meat*52*FACTORS.meat,
        "Végétarien":veg*52*FACTORS.veg,
        "wood":wood*12*FACTORS.wood,
        "charcoal":charcoal*12*FACTORS.charcoal
    };
    let total = Object.values(emissions).reduce((a,b)=>a+b,0);

    // ----------------- Compteur animé -----------------
    let counter = document.getElementById("result");
    counter.innerText = "";
    let current = 0, steps = 60, increment = total/steps, step=0;
    let animCounter = setInterval(()=>{
        step++;
        current+=increment;
        if(step>=steps){ current=total; clearInterval(animCounter); }
        counter.innerText = ` Empreinte totale : ${Math.round(current)} kg CO₂ / an`;
    },25);

    // Note
    let gradeEl = document.getElementById("grade");
    gradeEl.innerText = "";
    setTimeout(()=>{
        let grade = "E";
        if(total<2000) grade="A 🟢 Excellent";
        else if(total<4000) grade="B 🟡 Bien";
        else if(total<6000) grade="C 🟠 Moyen";
        else if(total<8000) grade="D 🔴 Mauvais";
        gradeEl.innerText = "Note : " + grade;
    }, 500);

    // Comparaison mondiale
    let comparisonEl = document.getElementById("comparison");
    comparisonEl.innerText = "";
    setTimeout(()=>{
        let world=4000, diff=total-world;
        comparisonEl.innerText = diff<0?
            ` ${Math.abs(Math.round(diff))} kg CO₂ de moins que la moyenne mondiale`:
            `⚠️ ${Math.round(diff)} kg CO₂ au-dessus de la moyenne mondiale`;
    }, 700);

    // ----------------- Graphiques -----------------
    let targetValues = Object.values(emissions);

   // Barres
if(window.barChartInstance) window.barChartInstance.destroy();
window.barChartInstance = new Chart(document.getElementById("barChart"), {
    type: 'bar',
    data: {
        labels: Object.keys(emissions),
        datasets: [{ label: 'kg CO₂/an', data: targetValues, backgroundColor: 'rgba(82, 183, 136, 0.7)' }]
    }
});

// Camembert
if(window.pieChartInstance) window.pieChartInstance.destroy();
window.pieChartInstance = new Chart(document.getElementById("pieChart"), {
    type: 'pie',
    data: {
        labels: Object.keys(emissions),
        datasets: [{ data: targetValues, backgroundColor: ['#52b788','#95d5b2','#74c69d','#40916c','#1b4332','#d9ed92','#ffe066'] }]
    }
});




// ----------------- IA locale -----------------
const tipsEl = document.getElementById("tips");
tipsEl.innerHTML = " Analyse IA en cours...";

setTimeout(() => {
    const aiTips = generateAITips(emissions, total);
    tipsEl.innerHTML = aiTips.map(t => "• " + t).join("<br>");
}, 800);

function generateAITips(emissions, total) {
    let tips = [];
    let sorted = Object.entries(emissions).sort((a,b)=>b[1]-a[1]);
    let biggest = sorted[0];

    tips.push(` Ton principal poste d’émission est ${biggest[0]} (${Math.round(biggest[1])} kg CO₂/an). C’est là que tu peux agir en priorité.`);

    if (emissions["Voiture"] > 1200) {
        tips.push(" Réduire l’usage de la voiture (covoiturage, marche, transports en commun) aurait un impact fort.");
    }

    if (emissions["Viande"] > emissions["Végétarien"]) {
        tips.push(" Ton alimentation est très carbonée. Remplacer 1–2 repas carnés par semaine ferait une vraie différence.");
    }

    if (emissions["Électricité"] > 900) {
        tips.push(" L’électricité pèse lourd : ampoules LED, appareils économes et réduction du gaspillage sont recommandés.");
    }

    if (total < 3000) {
        tips.push(" Ton empreinte est inférieure à la moyenne mondiale. Continue sur cette trajectoire !");
    } else if (total > 6000) {
        tips.push(" Ton empreinte est élevée. Des changements progressifs mais constants sont essentiels.");
    }

    tips.push(" Conseil IA : concentre-toi sur un seul changement à la fois. Les petites améliorations durables battent les grandes résolutions abandonnées.");

    return tips;
}
};
const toggle = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
    if (toggle) toggle.textContent = "🌞";
}

if (toggle) {
    toggle.addEventListener("click", () => {
        document.body.classList.toggle("light");
        const isLight = document.body.classList.contains("light");
        localStorage.setItem("theme", isLight ? "light" : "dark");
        toggle.textContent = isLight ? "🌞" : "🌙";
    });
}
