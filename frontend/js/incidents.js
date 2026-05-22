async function loadIncidents() {
    const list = document.getElementById('incidentList');
    list.innerHTML = '<p style="color:var(--text-tertiary);text-align:center;padding:2rem;">Loading incidents...</p>';
    try {
        const incidents = await apiFetch('/reports/incidents');
        list.innerHTML = '';
        if (!incidents.length) {
            list.innerHTML = '<p style="color:var(--text-tertiary);text-align:center;padding:2rem;">No incidents reported yet.</p>';
            return;
        }
        incidents.forEach(i => list.appendChild(buildIncidentCard(i)));
    } catch { list.innerHTML = '<p style="color:var(--danger-red);text-align:center;padding:2rem;">Failed to load incidents.</p>'; }
}

function buildIncidentCard(i) {
    const div = document.createElement('div');
    div.className = 'report-card';
    const severityColor = i.severity === 'High' ? 'var(--danger-red)' : i.severity === 'Medium' ? 'var(--warning-orange)' : 'var(--success-green)';
    div.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.8rem;margin-bottom:0.8rem;">
            <span style="background:${severityColor};color:#fff;font-size:0.7rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:0.4rem;">${i.severity.toUpperCase()}</span>
        </div>
        <h4 style="color:var(--text-primary);margin-bottom:0.5rem;font-size:1rem;">${i.title}</h4>
        <p style="color:var(--text-secondary);font-size:0.88rem;margin-bottom:0.8rem;">${i.description}</p>
        <p style="color:var(--text-tertiary);font-size:0.8rem;">📍 ${i.location || 'Unknown'} &nbsp;|&nbsp; 🕐 ${new Date(i.datetime).toLocaleString()}</p>
        <p style="color:var(--text-tertiary);font-size:0.8rem;margin-top:0.3rem;">Reporter: ${i.reporterName || 'Anonymous'}</p>
        ${i.aiAnalysis ? `<div class="ai-analysis-box" style="margin-top:0.8rem;padding:0.8rem;background:rgba(124,58,237,0.1);border-left:3px solid var(--primary-purple);border-radius:0.5rem;font-size:0.82rem;color:var(--accent-purple);">🤖 ${i.aiAnalysis}</div>` : ''}
        <p style="color:var(--text-tertiary);font-size:0.72rem;margin-top:0.5rem;font-family:monospace;">🔗 ${i.blockchainHash}</p>
    `;
    return div;
}

function openIncidentModal() {
    document.getElementById('incidentModal').classList.add('active');
    document.getElementById('incidentDatetime').value = new Date().toISOString().slice(0, 16);
}

function closeIncidentModal() {
    document.getElementById('incidentModal').classList.remove('active');
    document.getElementById('incidentForm').reset();
    document.getElementById('incidentAIResult').textContent = '';
}

function analyzeIncidentWithAI() {
    const severity = document.getElementById('incidentSeverity').value;
    const desc = document.getElementById('incidentDescription').value;
    if (!desc) { showToast('Enter a description first', 'warning'); return; }

    const desc_lower = desc.toLowerCase();
    let advice = 'Monitor the situation and stay alert.';
    if (desc_lower.includes('rain') || desc_lower.includes('flood')) advice = 'Avoid low-lying areas. Seek shelter immediately.';
    else if (desc_lower.includes('fire')) advice = 'Evacuate the area. Contact fire services: 101.';
    else if (desc_lower.includes('theft') || desc_lower.includes('robbery')) advice = 'Contact police: 100. Do not confront the suspect.';
    else if (desc_lower.includes('accident')) advice = 'Contact medical emergency: 108. Avoid the area.';
    else if (severity === 'High') advice = 'High severity — alert authorities immediately.';

    const risk = severity === 'High' ? 'HIGH RISK' : severity === 'Medium' ? 'MODERATE RISK' : 'LOW RISK';
    document.getElementById('incidentAIResult').textContent = `🤖 AI: ${risk} — ${advice}`;
    document.getElementById('incidentAIResult').style.display = 'block';
    showToast('AI analysis complete', 'success');
}

async function submitIncident(e) {
    e.preventDefault();
    const btn = document.getElementById('submitIncidentBtn');
    btn.disabled = true;
    btn.textContent = 'Logging to Blockchain...';

    try {
        await apiFetch('/reports/incidents', {
            method: 'POST',
            body: JSON.stringify({
                title: document.getElementById('incidentTitle').value,
                description: document.getElementById('incidentDescription').value,
                severity: document.getElementById('incidentSeverity').value,
                location: document.getElementById('incidentLocation').value,
                imageUrl: document.getElementById('incidentImageUrl').value,
                datetime: document.getElementById('incidentDatetime').value
            })
        });
        showToast('✅ Incident logged to blockchain!', 'success');
        closeIncidentModal();
        loadIncidents();
    } catch (err) {
        showToast(err.message, 'danger');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Submit & Log to Blockchain';
    }
}
