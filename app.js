import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    deleteDoc,
    collection, 
    addDoc, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔥 SUBSTITUA PELAS SUAS CREDENCIAIS DO FIREBASE CONSOLE
const firebaseConfig = {
    apiKey: "AIzaSyCYXq-EEJBMW3iN8hX8uGAAZIaV86o1lRc", 
    authDomain: "bolao-worlds.firebaseapp.com", 
    projectId: "bolao-worlds", 
    storageBucket: "bolao-worlds.firebasestorage.app", 
    messagingSenderId: "971372632235", 
    appId: "1:971372632235:web:f4d03717b563aabfd77fee", 
    measurementId: "G-QL13HGRWF1"
};

// INICIALIZAÇÃO FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ESTADO GLOBAL
let currentUserData = null;
let allMatches = [];
let allPredictions = [];
let allUsers = [];
let countdownInterval = null;
let isPredictionsLocked = false;

// OBSERVADOR DE AUTENTICAÇÃO
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            currentUserData = { id: user.uid, ...userDoc.data() };
        } else {
            currentUserData = { id: user.uid, nick: user.email.split('@')[0], isAdmin: false };
        }
        setupUserSession();
        initRealtimeListeners();
    } else {
        document.getElementById('authSection').classList.remove('hidden');
        document.getElementById('appDashboard').classList.add('hidden');
    }
});

// LISTENERS EM TEMPO REAL
function initRealtimeListeners() {
    onSnapshot(collection(db, 'matches'), (snapshot) => {
        allMatches = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        allMatches.sort((a, b) => new Date(a.dateTimeISO) - new Date(b.dateTimeISO));

        updateRoundDropdown();
        setupCountdownTimer();

        renderMatchesForUser();
        renderAdminMatchesList();
        renderGroupGuessesView();
        renderRanking();
    });

    onSnapshot(collection(db, 'predictions'), (snapshot) => {
        allPredictions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        renderGroupGuessesView();
        renderRanking();
    });

    onSnapshot(collection(db, 'users'), (snapshot) => {
        allUsers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        renderRanking();
    });
}

// ATUALIZAR O SELETOR DE RODADAS EXIBINDO A ÚLTIMA RODADA CADASTRADA PRIMEIRO
function updateRoundDropdown() {
    const roundSelect = document.getElementById('roundSelect');
    if (!roundSelect) return;

    // Obtém as rodadas únicas cadastradas
    const uniqueRounds = [...new Set(allMatches.map(m => m.roundId))];

    if (uniqueRounds.length === 0) {
        roundSelect.innerHTML = `<option value="">Nenhuma Rodada</option>`;
        return;
    }

    // 🚀 INVERTE A ORDEM: A última rodada cadastrada fica no topo do array
    const reversedRounds = [...uniqueRounds].reverse();

    // Guarda a seleção atual do usuário para não perder caso ele esteja navegando
    const previousSelection = roundSelect.value;

    roundSelect.innerHTML = '';

    reversedRounds.forEach(rId => {
        let label = rId;
        const cleanId = rId.toLowerCase().trim();

        if (cleanId === 'rodada_1' || cleanId === 'r1' || cleanId === 'suica_r1') label = 'Fase Suíça - Rodada 1';
        else if (cleanId === 'rodada_2' || cleanId === 'r2' || cleanId === 'suica_r2') label = 'Fase Suíça - Rodada 2';
        else if (cleanId === 'rodada_3' || cleanId === 'r3' || cleanId === 'suica_r3') label = 'Fase Suíça - Rodada 3';
        else if (cleanId === 'rodada_4' || cleanId === 'r4' || cleanId === 'suica_r4') label = 'Fase Suíça - Rodada 4';
        else if (cleanId === 'rodada_5' || cleanId === 'r5' || cleanId === 'suica_r5') label = 'Fase Suíça - Rodada 5';
        else if (cleanId === 'quartas') label = 'Knockouts - Quartas de Final';
        else if (cleanId === 'semi') label = 'Knockouts - Semifinais';
        else if (cleanId === 'final') label = 'Grande Final';

        const opt = document.createElement('option');
        opt.value = rId;
        opt.textContent = label;
        roundSelect.appendChild(opt);
    });

    // Se o usuário já tiver escolhido uma rodada válida no menu, mantém.
    // Caso contrário (primeiro carregamento), seleciona a ÚLTIMA rodada cadastrada (topo da lista).
    if (previousSelection && uniqueRounds.includes(previousSelection)) {
        roundSelect.value = previousSelection;
    } else {
        roundSelect.value = reversedRounds[0]; 
    }



    uniqueRounds.forEach(rId => {
        let label = rId;
        const cleanId = rId.toLowerCase().trim();

        if (cleanId === 'rodada_1' || cleanId === 'r1' || cleanId === 'suica_r1') label = 'Fase Suíça - Rodada 1';
        else if (cleanId === 'rodada_2' || cleanId === 'r2' || cleanId === 'suica_r2') label = 'Fase Suíça - Rodada 2';
        else if (cleanId === 'rodada_3' || cleanId === 'r3' || cleanId === 'suica_r3') label = 'Fase Suíça - Rodada 3';
        else if (cleanId === 'rodada_4' || cleanId === 'r4' || cleanId === 'suica_r4') label = 'Fase Suíça - Rodada 4';
        else if (cleanId === 'rodada_5' || cleanId === 'r5' || cleanId === 'suica_r5') label = 'Fase Suíça - Rodada 5';
        else if (cleanId === 'quartas') label = 'Knockouts - Quartas de Final';
        else if (cleanId === 'semi') label = 'Knockouts - Semifinais';
        else if (cleanId === 'final') label = 'Grande Final';

        const opt = document.createElement('option');
        opt.value = rId;
        opt.textContent = label;
        roundSelect.appendChild(opt);
    });

    if (!roundSelect.value || !uniqueRounds.includes(roundSelect.value)) {
        roundSelect.value = autoSelectedRound;
    }
}

// CRONÔMETRO DE BLOQUEIO
function setupCountdownTimer() {
    if (countdownInterval) clearInterval(countdownInterval);

    const roundSelect = document.getElementById('roundSelect');
    const timerElement = document.getElementById('countdownTimer');
    const badgeElement = document.getElementById('lockStatusBadge');

    const selectedRound = roundSelect ? roundSelect.value : null;
    const currentRoundMatches = allMatches.filter(m => m.roundId === selectedRound);

    if (currentRoundMatches.length === 0) {
        if (timerElement) timerElement.textContent = "--:--:--";
        if (badgeElement) {
            badgeElement.className = "lock-status-badge";
            badgeElement.innerHTML = `<i class="fa-solid fa-lock"></i> Sem Jogos`;
        }
        isPredictionsLocked = true;
        return;
    }

    const firstMatchTime = new Date(currentRoundMatches[0].dateTimeISO).getTime();

    function updateTimer() {
        const now = new Date().getTime();
        const distance = firstMatchTime - now;

        if (distance <= 0) {
            clearInterval(countdownInterval);
            if (timerElement) timerElement.textContent = "00:00:00";
            if (badgeElement) {
                badgeElement.className = "lock-status-badge locked";
                badgeElement.innerHTML = `<i class="fa-solid fa-lock"></i> Palpites Encerrados`;
            }
            isPredictionsLocked = true;
            renderMatchesForUser();
        } else {
            isPredictionsLocked = false;
            if (badgeElement) {
                badgeElement.className = "lock-status-badge";
                badgeElement.innerHTML = `<i class="fa-solid fa-lock-open"></i> Palpites Abertos`;
            }

            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const format = (n) => n.toString().padStart(2, '0');
            if (timerElement) {
                timerElement.textContent = `${format(hours)}:${format(minutes)}:${format(seconds)}`;
            }
        }
    }

    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

// RENDERIZAR MEUS PALPITES (SUPORTE MD1, MD3 E MD5)
function renderMatchesForUser() {
    const container = document.getElementById('matchesContainer');
    const roundSelect = document.getElementById('roundSelect');
    if (!container) return;

    const selectedRound = roundSelect ? roundSelect.value : null;
    const matchesOfRound = allMatches.filter(m => m.roundId === selectedRound);

    container.innerHTML = '';

    if (matchesOfRound.length === 0) {
        container.innerHTML = `<p style="text-align:center; color: var(--hextech-text-muted); grid-column: 1/-1;">Nenhum confronto cadastrado nesta rodada.</p>`;
        return;
    }

    matchesOfRound.forEach(match => {
        const myPred = allPredictions.find(p => p.userId === currentUserData.id && p.matchId === match.id);
        const selWinner = myPred ? myPred.winner : null;
        const blueScore = myPred && myPred.blueScore !== undefined ? myPred.blueScore : '';
        const redScore = myPred && myPred.redScore !== undefined ? myPred.redScore : '';

        const blueLogo = match.teamBlueLogo || `https://via.placeholder.com/48/0a192f/c8aa6e?text=${match.teamBlue}`;
        const redLogo = match.teamRedLogo || `https://via.placeholder.com/48/0a192f/c8aa6e?text=${match.teamRed}`;

        const dateObj = new Date(match.dateTimeISO);
        const formattedDate = dateObj.toLocaleString('pt-BR', {
            weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        const disabledClass = isPredictionsLocked ? 'disabled' : '';
        const isBlueSelected = (selWinner && selWinner.trim().toUpperCase() === match.teamBlue.trim().toUpperCase()) ? 'selected' : '';
        const isRedSelected = (selWinner && selWinner.trim().toUpperCase() === match.teamRed.trim().toUpperCase()) ? 'selected' : '';

        const isSeries = (match.format === 'MD3' || match.format === 'MD5');
        
        // Opções válidas de placar para MD3 e MD5
        let scoreOptions = [];
        if (match.format === 'MD3') scoreOptions = [0, 1, 2];
        else if (match.format === 'MD5') scoreOptions = [0, 1, 2, 3];

        let scoreSelectorHTML = '';
        if (isSeries) {
            let blueOptionsHTML = `<option value="">-</option>`;
            let redOptionsHTML = `<option value="">-</option>`;

            scoreOptions.forEach(num => {
                blueOptionsHTML += `<option value="${num}" ${blueScore === num ? 'selected' : ''}>${num}</option>`;
                redOptionsHTML += `<option value="${num}" ${redScore === num ? 'selected' : ''}>${num}</option>`;
            });

            const disabledAttr = isPredictionsLocked ? 'disabled' : '';

            scoreSelectorHTML = `
                <div class="score-picker-wrapper">
                    <select class="score-select" ${disabledAttr} onchange="selectSeriesScore('${match.id}', 'blue', this.value)">
                        ${blueOptionsHTML}
                    </select>
                    <span class="score-vs-divider">X</span>
                    <select class="score-select" ${disabledAttr} onchange="selectSeriesScore('${match.id}', 'red', this.value)">
                        ${redOptionsHTML}
                    </select>
                </div>
            `;
        }

        container.innerHTML += `
            <div class="match-card">
                <div class="match-header-info">
                    <span><i class="fa-solid fa-trophy"></i> ${match.format}</span>
                    <span><i class="fa-regular fa-clock"></i> ${formattedDate}</span>
                </div>
                <div class="match-teams-wrapper">
                    <div class="team-box ${isBlueSelected} ${disabledClass}" onclick="${isSeries ? '' : `selectTeam('${match.id}', '${match.teamBlue}')`}">
                        <img src="${blueLogo}" class="team-logo-img" alt="${match.teamBlue}" onerror="this.src='https://via.placeholder.com/48?text=${match.teamBlue}'">
                        <span class="team-name">${match.teamBlue}</span>
                    </div>

                    <span class="match-vs">VS</span>

                    <div class="team-box ${isRedSelected} ${disabledClass}" onclick="${isSeries ? '' : `selectTeam('${match.id}', '${match.teamRed}')`}">
                        <img src="${redLogo}" class="team-logo-img" alt="${match.teamRed}" onerror="this.src='https://via.placeholder.com/48?text=${match.teamRed}'">
                        <span class="team-name">${match.teamRed}</span>
                    </div>
                </div>
                ${scoreSelectorHTML}
            </div>
        `;
    });
}

// SELEÇÃO DE PALPITE MD1
window.selectTeam = async function(matchId, team) {
    if (isPredictionsLocked) {
        showToast('Palpites encerrados! O prazo para esta rodada expirou.');
        return;
    }

    const existingIndex = allPredictions.findIndex(p => p.userId === currentUserData.id && p.matchId === matchId);

    if (existingIndex !== -1) {
        allPredictions[existingIndex].winner = team;
        await updateDoc(doc(db, 'predictions', allPredictions[existingIndex].id), { winner: team });
    } else {
        const docRef = await addDoc(collection(db, 'predictions'), {
            userId: currentUserData.id,
            matchId: matchId,
            winner: team
        });
        
        allPredictions.push({
            id: docRef.id,
            userId: currentUserData.id,
            matchId: matchId,
            winner: team
        });
    }

    showToast(`Palpite salvo: ${team}`);
    renderMatchesForUser();
};

// SELEÇÃO DE PLACAR EM SÉRIES (MD3 / MD5)
window.selectSeriesScore = async function(matchId, side, scoreVal) {
    if (isPredictionsLocked) {
        showToast('Palpites encerrados! O prazo para esta rodada expirou.');
        return;
    }

    const match = allMatches.find(m => m.id === matchId);
    if (!match) return;

    let existingIndex = allPredictions.findIndex(p => p.userId === currentUserData.id && p.matchId === matchId);
    
    let currentPred = existingIndex !== -1 ? allPredictions[existingIndex] : {
        userId: currentUserData.id,
        matchId: matchId,
        blueScore: null,
        redScore: null,
        winner: null
    };

    const val = scoreVal === '' ? null : parseInt(scoreVal, 10);

    if (side === 'blue') currentPred.blueScore = val;
    if (side === 'red') currentPred.redScore = val;

    // Calcula automaticamente o vencedor se ambos os placares estiverem preenchidos
    if (currentPred.blueScore !== null && currentPred.redScore !== null) {
        if (currentPred.blueScore > currentPred.redScore) {
            currentPred.winner = match.teamBlue;
        } else if (currentPred.redScore > currentPred.blueScore) {
            currentPred.winner = match.teamRed;
        } else {
            currentPred.winner = null; // Empates não são válidos no LoL
        }
    }

    if (existingIndex !== -1) {
        allPredictions[existingIndex] = currentPred;
        await updateDoc(doc(db, 'predictions', currentPred.id), {
            blueScore: currentPred.blueScore,
            redScore: currentPred.redScore,
            winner: currentPred.winner
        });
    } else {
        const docRef = await addDoc(collection(db, 'predictions'), currentPred);
        currentPred.id = docRef.id;
        allPredictions.push(currentPred);
    }

    if (currentPred.winner) {
        showToast(`Placar salvo: ${currentPred.blueScore} x ${currentPred.redScore} (${currentPred.winner})`);
    }

    renderMatchesForUser();
};

// MUDANÇA DE RODADA
window.onRoundChange = function() {
    setupCountdownTimer();
    renderMatchesForUser();
};

// HANDLERS DE AUTENTICAÇÃO E UTILS
window.handleLogin = async function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        showToast('Login realizado com sucesso!');
    } catch (err) {
        showAuthError('E-mail ou senha inválidos.');
    }
};

window.handleRegister = async function(e) {
    e.preventDefault();
    const nick = document.getElementById('regNick').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value.trim();
    try {
        const creds = await createUserWithEmailAndPassword(auth, email, pass);
        const isAdmin = (email.toLowerCase() === 'admin@bolao.com');
        await setDoc(doc(db, 'users', creds.user.uid), { nick, email, isAdmin });
        showToast('Conta criada com sucesso!');
    } catch (err) {
        showAuthError('Erro ao criar conta: ' + err.message);
    }
};

window.handleLogout = async function() {
    await signOut(auth);
    location.reload();
};

function setupUserSession() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('appDashboard').classList.remove('hidden');
    document.getElementById('userHeaderProfile').classList.remove('hidden');
    
    document.getElementById('headerUserNick').textContent = currentUserData.nick;
    document.getElementById('headerRoleBadge').textContent = currentUserData.isAdmin ? 'Admin' : 'Membro';

    if (currentUserData.isAdmin) {
        document.getElementById('adminTabBtn').classList.remove('hidden');
    }
}

window.switchAuthTab = function(tab) {
    document.getElementById('tabLoginBtn').classList.toggle('active', tab === 'login');
    document.getElementById('tabRegisterBtn').classList.toggle('active', tab === 'register');
    document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
    document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
};

window.switchMainTab = function(tab) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    event.currentTarget.classList.add('active');
    document.getElementById(tab + 'Tab').classList.remove('hidden');
};

// RENDERIZAR PALPITES DA GALERA (EXIBE PLACAR OU VENCEDOR)
function renderGroupGuessesView() {
    const container = document.getElementById('groupMatchesBreakdown');
    if (!container) return;
    container.innerHTML = '';

    const roundSelect = document.getElementById('roundSelect');
    const selectedRound = roundSelect ? roundSelect.value : null;
    const matchesOfRound = allMatches.filter(m => m.roundId === selectedRound);

    if (matchesOfRound.length === 0) {
        container.innerHTML = `<p style="color: var(--hextech-text-muted);">Nenhum confronto disponível para esta rodada.</p>`;
        return;
    }

    matchesOfRound.forEach(match => {
        let pills = '';
        allPredictions.filter(p => p.matchId === match.id).forEach(p => {
            const u = allUsers.find(x => x.id === p.userId);
            const nick = u ? u.nick : 'Invocador';
            
            let displayChoice = p.winner || '-';
            if ((match.format === 'MD3' || match.format === 'MD5') && p.blueScore !== undefined && p.redScore !== undefined) {
                displayChoice = `${p.blueScore} x ${p.redScore} (${p.winner})`;
            }

            pills += `
                <div class="user-guess-pill">
                    <span class="user-guess-nick">${nick}</span>
                    <span class="user-guess-choice"><i class="fa-solid fa-check"></i> ${displayChoice}</span>
                </div>
            `;
        });

        const formattedDate = new Date(match.dateTimeISO).toLocaleString('pt-BR', {
            hour: '2-digit', minute: '2-digit'
        });

        container.innerHTML += `
            <div class="group-match-card">
                <div class="group-match-title">
                    <span>${match.teamBlue} vs ${match.teamRed} (${match.format})</span>
                    <small style="font-size:0.8rem; color: var(--hextech-blue-cyan);">${formattedDate}</small>
                </div>
                <div class="user-guesses-grid">${pills || '<span style="color:var(--hextech-text-muted)">Nenhum palpite registrado</span>'}</div>
            </div>
        `;
    });
}

// CALCULAR RANKING COM PONTUAÇÃO DE MD1, MD3 E MD5
function renderRanking() {
    const tbody = document.getElementById('rankingTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const scores = allUsers.map(user => {
        let pts = 0;
        allPredictions.filter(p => p.userId === user.id).forEach(p => {
            const match = allMatches.find(m => m.id === p.matchId);
            if (!match) return;

            if (match.format === 'MD1') {
                if (match.winner && p.winner === match.winner) pts += 3;
            } else if (match.format === 'MD3' || match.format === 'MD5') {
                // Se a partida tiver os placares reais salvos no Admin
                if (match.blueScore !== undefined && match.redScore !== undefined) {
                    const exactMatch = (p.blueScore === match.blueScore && p.redScore === match.redScore);
                    const winnerMatch = (match.winner && p.winner === match.winner);

                    if (exactMatch) {
                        pts += 3; // Cravada
                    } else if (winnerMatch) {
                        pts += 1; // Apenas o vencedor correto
                    }
                } else if (match.winner && p.winner === match.winner) {
                    // Fallback caso o Admin só tenha marcado o vencedor sem digitar o placar
                    pts += 1;
                }
            }
        });
        return { nick: user.nick || 'Invocador', pts };
    }).sort((a, b) => b.pts - a.pts);

    scores.forEach((s, idx) => {
        tbody.innerHTML += `
            <tr>
                <td><strong>#${idx+1}</strong></td>
                <td><strong>${s.nick}</strong></td>
                <td><span style="color:var(--hextech-gold); font-weight:bold;">${s.pts} pts</span></td>
            </tr>
        `;
    });
}

// GERENCIAR NO PAINEL ADMIN (COM PLACAR REAL PARA MD3 E MD5)
function renderAdminMatchesList() {
    const container = document.getElementById('adminMatchesList');
    if (!container) return;
    container.innerHTML = '';

    if (allMatches.length === 0) {
        container.innerHTML = `<p style="color: var(--hextech-text-muted);">Nenhum jogo cadastrado.</p>`;
        return;
    }

    allMatches.forEach(m => {
        const formattedDate = new Date(m.dateTimeISO).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        const isSeries = (m.format === 'MD3' || m.format === 'MD5');
        
        let adminScoreInputs = '';
        if (isSeries) {
            const bScore = m.blueScore !== undefined ? m.blueScore : '';
            const rScore = m.redScore !== undefined ? m.redScore : '';
            adminScoreInputs = `
                <div style="display:flex; align-items:center; gap:4px;">
                    <input type="number" min="0" max="3" value="${bScore}" placeholder="0" style="width:40px; text-align:center;" onchange="setAdminSeriesScore('${m.id}', 'blue', this.value)">
                    <span>x</span>
                    <input type="number" min="0" max="3" value="${rScore}" placeholder="0" style="width:40px; text-align:center;" onchange="setAdminSeriesScore('${m.id}', 'red', this.value)">
                </div>
            `;
        }

        container.innerHTML += `
            <div class="admin-match-item">
                <span>[${m.roundId}] <strong>${m.teamBlue} vs ${m.teamRed}</strong> (${m.format}) - ${formattedDate}</span>
                <div style="display:flex; gap:10px; align-items:center;">
                    ${adminScoreInputs}
                    <select onchange="setWinner('${m.id}', this.value)">
                        <option value="">-- Vencedor --</option>
                        <option value="${m.teamBlue}" ${m.winner === m.teamBlue ? 'selected' : ''}>${m.teamBlue}</option>
                        <option value="${m.teamRed}" ${m.winner === m.teamRed ? 'selected' : ''}>${m.teamRed}</option>
                    </select>
                    <button class="btn-secondary btn-sm" onclick="deleteMatch('${m.id}')" title="Excluir Confronto" style="color:var(--hextech-red); border-color:var(--hextech-red);">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
}

window.setAdminSeriesScore = async function(matchId, side, val) {
    const match = allMatches.find(m => m.id === matchId);
    if (!match) return;

    let bScore = side === 'blue' ? (val === '' ? null : parseInt(val, 10)) : (match.blueScore !== undefined ? match.blueScore : null);
    let rScore = side === 'red' ? (val === '' ? null : parseInt(val, 10)) : (match.redScore !== undefined ? match.redScore : null);

    let winner = match.winner;
    if (bScore !== null && rScore !== null) {
        if (bScore > rScore) winner = match.teamBlue;
        else if (rScore > bScore) winner = match.teamRed;
    }

    await updateDoc(doc(db, 'matches', matchId), {
        blueScore: bScore,
        redScore: rScore,
        winner: winner
    });

    showToast('Placar real atualizado!');
};

window.setWinner = async function(matchId, winner) {
    await updateDoc(doc(db, 'matches', matchId), { winner: winner || null });
    showToast('Resultado atualizado!');
};

window.deleteMatch = async function(matchId) {
    if (confirm("Excluir este confronto?")) {
        await deleteDoc(doc(db, 'matches', matchId));
        showToast('Confronto excluído!');
    }
};

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ADICIONAR CONFRONTO COM FORMATO MD1 / MD3 / MD5
window.handleAddMatch = async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('btnAddMatchSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';

    try {
        const roundId = document.getElementById('newRoundId').value.trim().toLowerCase();
        const format = document.getElementById('matchFormat').value;
        const teamBlue = document.getElementById('teamBlue').value.trim().toUpperCase();
        const teamRed = document.getElementById('teamRed').value.trim().toUpperCase();
        const dateTimeISO = document.getElementById('matchDateTime').value;

        const blueFile = document.getElementById('teamBlueLogoFile').files[0];
        const blueUrlInput = document.getElementById('teamBlueLogoUrl').value.trim();
        let teamBlueLogo = blueUrlInput;
        if (blueFile) teamBlueLogo = await fileToBase64(blueFile);

        const redFile = document.getElementById('teamRedLogoFile').files[0];
        const redUrlInput = document.getElementById('teamRedLogoUrl').value.trim();
        let teamRedLogo = redUrlInput;
        if (redFile) teamRedLogo = await fileToBase64(redFile);

        await addDoc(collection(db, 'matches'), {
            roundId,
            format,
            teamBlue,
            teamBlueLogo,
            teamRed,
            teamRedLogo,
            dateTimeISO,
            winner: null,
            blueScore: null,
            redScore: null
        });

        showToast('Confronto adicionado!');
        e.target.reset();
    } catch (error) {
        console.error("Erro ao adicionar confronto:", error);
        alert("Erro ao salvar: " + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar Confronto Manualmente';
    }
};

function showToast(msg) {
    const t = document.getElementById('toastNotification');
    if (!t) return;
    t.textContent = msg;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 2500);
}

function showAuthError(msg) {
    const err = document.getElementById('authError');
    if (!err) return;
    err.textContent = msg;
    err.classList.remove('hidden');
}