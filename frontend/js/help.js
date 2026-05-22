async function loadHelpProfile() {
    try {
        const user = await apiFetch('/auth/profile');
        document.getElementById('profileUsername').textContent = user.username || '-';
        document.getElementById('profileFullName').textContent = user.fullName || '-';
        document.getElementById('profileMobile').textContent = user.mobile || '-';
        document.getElementById('profileRole').textContent = user.role || 'Tourist';
        document.getElementById('profileBlockchainId').textContent = user.blockchainId || 'Not assigned';
        document.getElementById('profileSosCount').textContent = user.sosAlerts?.length || 0;
        document.getElementById('profileJoined').textContent = new Date(user.createdAt).toLocaleDateString();
    } catch { /* silent */ }
}

function initHelp() {
    loadHelpProfile();
}

// ===== SAFEBOT =====
const safeBotResponses = {
    'sos': 'Press the SOS button on the SOS page to alert emergency services immediately with your location.',
    'police': 'Tourist Police: 1363 | General Police: 100',
    'ambulance': 'Medical Emergency: 108',
    'fire': 'Fire Emergency: 101',
    'women': 'Women Helpline: 1091',
    'disaster': 'Disaster Management: 1078',
    'safe': 'Stay in well-lit areas, avoid isolated spots at night, and keep your emergency contacts updated.',
    'blockchain': 'Your Blockchain ID is a unique SHA-256 hash that securely identifies you in the system. It cannot be tampered with.',
    'incident': 'Go to the Incidents page to report any safety incidents. All reports are logged to the blockchain.',
    'accident': 'Go to the Accidents page to report accidents. Emergency services will be notified.',
    'location': 'Your GPS location is tracked in real-time on the Dashboard. Enable location permissions for accuracy.',
    'geofence': 'Geofencing monitors if you enter a danger zone. You will receive an alert automatically.',
    'help': 'I can help with: SOS, emergency contacts, safety tips, blockchain ID, incidents, accidents, location tracking.',
};

function sendSafeBot() {
    const input = document.getElementById('safebotInput');
    const msg = input.value.trim();
    if (!msg) return;

    addSafeBotMessage(msg, 'user');
    input.value = '';

    const lower = msg.toLowerCase();
    let response = "I'm not sure about that. Try asking about: SOS, police, ambulance, safety tips, blockchain, incidents, or accidents.";

    for (const [key, val] of Object.entries(safeBotResponses)) {
        if (lower.includes(key)) { response = val; break; }
    }

    setTimeout(() => addSafeBotMessage(response, 'bot'), 500);
}

function addSafeBotMessage(text, sender) {
    const list = document.getElementById('safebotMessages');
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.style.justifyContent = sender === 'user' ? 'flex-end' : 'flex-start';
    item.innerHTML = `<span class="activity-message" style="color:${sender === 'user' ? 'var(--text-primary)' : 'var(--accent-teal)'};text-align:${sender === 'user' ? 'right' : 'left'};">${sender === 'bot' ? '🤖 ' : ''}${text}</span>`;
    list.appendChild(item);
    list.scrollTop = list.scrollHeight;
}
