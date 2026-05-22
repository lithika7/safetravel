let injuriesReported = false;

async function loadAccidents() {
    const list = document.getElementById('accidentList');
    list.innerHTML = '<p style="color:var(--text-tertiary);text-align:center;padding:2rem;">Loading accidents...</p>';
    try {
        const accidents = await apiFetch('/reports/accidents');
        list.innerHTML = '';
        if (!accidents.length) {
            list.innerHTML = '<p style="color:var(--text-tertiary);text-align:center;padding:2rem;">No accidents reported yet.</p>';
            return;
        }
        accidents.forEach(a => list.appendChild(buildAccidentCard(a)));
    } catch { list.innerHTML = '<p style="color:var(--danger-red);text-align:center;padding:2rem;">Failed to load accidents.</p>'; }
}

function buildAccidentCard(a) {
    const div = document.createElement('div');
    div.className = 'report-card';
    const injuryColor = a.injuriesReported ? 'var(--danger-red)' : 'var(--success-green)';
    div.innerHTML = `
        <div style="background:rgba(249,115,22,0.15);border-left:3px solid var(--warning-orange);padding:0.7rem 1rem;border-radius:0.5rem;margin-bottom:0.8rem;font-size:0.85rem;color:var(--warning-orange);">
            ⚠️ SAFETY ALERT: Accident reported in ${a.location || 'your area'}. Avoid the area and contact emergency services if needed.
        </div>
        <h4 style="color:var(--text-primary);margin-bottom:0.5rem;font-size:1rem;">${a.title}</h4>
        <p style="color:var(--text-secondary);font-size:0.88rem;margin-bottom:0.8rem;">${a.description}</p>
        <div style="display:flex;gap:0.5rem;margin-bottom:0.8rem;">
            <span style="background:rgba(255,255,255,0.1);padding:0.2rem 0.6rem;border-radius:0.4rem;font-size:0.78rem;color:var(--text-secondary);">PEOPLE: ${a.peopleInvolved}</span>
            <span style="background:rgba(255,255,255,0.1);padding:0.2rem 0.6rem;border-radius:0.4rem;font-size:0.78rem;color:${injuryColor};">INJURIES: ${a.injuriesReported ? 'YES' : 'NO'}</span>
        </div>
        <p style="color:var(--text-tertiary);font-size:0.8rem;">📍 ${a.location || 'Unknown'} &nbsp;|&nbsp; 🕐 ${new Date(a.datetime).toLocaleString()}</p>
        <p style="color:var(--text-tertiary);font-size:0.72rem;margin-top:0.5rem;font-family:monospace;">🔗 ${a.blockchainHash}</p>
    `;
    return div;
}

function openAccidentModal() {
    document.getElementById('accidentModal').classList.add('active');
    document.getElementById('accidentDatetime').value = new Date().toISOString().slice(0, 16);
    injuriesReported = false;
    setInjury(false);
}

function closeAccidentModal() {
    document.getElementById('accidentModal').classList.remove('active');
    document.getElementById('accidentForm').reset();
}

function setInjury(val) {
    injuriesReported = val;
    document.getElementById('injuryYes').classList.toggle('btn-active', val);
    document.getElementById('injuryNo').classList.toggle('btn-active', !val);
}

async function submitAccident(e) {
    e.preventDefault();
    const btn = document.getElementById('submitAccidentBtn');
    btn.disabled = true;
    btn.textContent = 'Logging to Blockchain...';

    try {
        await apiFetch('/reports/accidents', {
            method: 'POST',
            body: JSON.stringify({
                title: document.getElementById('accidentTitle').value,
                description: document.getElementById('accidentDescription').value,
                peopleInvolved: parseInt(document.getElementById('accidentPeople').value) || 1,
                injuriesReported,
                location: document.getElementById('accidentLocation').value,
                imageUrl: document.getElementById('accidentImageUrl').value,
                datetime: document.getElementById('accidentDatetime').value
            })
        });
        showToast('✅ Accident logged to blockchain!', 'success');
        closeAccidentModal();
        loadAccidents();
    } catch (err) {
        showToast(err.message, 'danger');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Submit & Log to Blockchain';
    }
}
