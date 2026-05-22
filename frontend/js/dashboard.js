let userLat = null, userLon = null;
let dangerZoneLat = null, dangerZoneLon = null;
let lastMovementLat = null, lastMovementLon = null;
let noMovementTimer = null;

function initDashboard() {
    displayBlockchainId();
    getLocation();
    loadActivityLog();
}

// ===== BLOCKCHAIN IDENTITY =====
async function displayBlockchainId() {
    const el = document.getElementById('blockchainId');
    if (!el) return;
    let id = localStorage.getItem('blockchainId');
    // If missing (old account), fetch from profile
    if (!id || id === 'undefined' || id === '') {
        try {
            const user = await apiFetch('/auth/profile');
            id = user.blockchainId || null;
            if (id) localStorage.setItem('blockchainId', id);
        } catch { id = null; }
    }
    el.textContent = id || 'Generating...';
}

// ===== LOCATION =====
function getLocation() {
    document.querySelector('.location-display').innerHTML =
        '<p style="color:var(--text-secondary);">Fetching location...</p><div class="loading-spinner"></div>';
    document.getElementById('locationInfo').style.display = 'none';

    if (!navigator.geolocation) { useSimulatedLocation(); return; }

    navigator.geolocation.getCurrentPosition(
        pos => {
            userLat = pos.coords.latitude;
            userLon = pos.coords.longitude;
            const acc = Math.abs(Math.round(pos.coords.accuracy));

            document.getElementById('latitude').textContent = userLat.toFixed(4);
            document.getElementById('longitude').textContent = userLon.toFixed(4);
            document.getElementById('accuracy').textContent = acc >= 100 ? `~${acc}` : acc;
            document.querySelector('.location-display').innerHTML = '';
            document.getElementById('locationInfo').style.display = 'block';

            dangerZoneLat = userLat + 0.0045;
            dangerZoneLon = userLon + 0.0045;

            updateMapMarkers();
            assessRisk();
            startMovementWatch();
            logActivity('location_check', '📍 Location updated', userLat, userLon);
            showToast('📍 Location updated', 'success');
        },
        () => useSimulatedLocation(),
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function useSimulatedLocation() {
    userLat = 11.3595; userLon = 77.8284;
    dangerZoneLat = userLat + 0.0045;
    dangerZoneLon = userLon + 0.0045;

    document.getElementById('latitude').textContent = userLat.toFixed(4);
    document.getElementById('longitude').textContent = userLon.toFixed(4);
    document.getElementById('accuracy').textContent = 'N/A';
    document.querySelector('.location-display').innerHTML =
        '<p style="color:var(--text-tertiary);font-size:0.85rem;">📡 Using simulated location</p>';
    document.getElementById('locationInfo').style.display = 'block';

    updateMapMarkers();
    assessRisk();
}

// ===== AI BEHAVIOR: NO-MOVEMENT DETECTION =====
function startMovementWatch() {
    lastMovementLat = userLat;
    lastMovementLon = userLon;

    if (noMovementTimer) clearInterval(noMovementTimer);

    noMovementTimer = setInterval(() => {
        navigator.geolocation.getCurrentPosition(pos => {
            const newLat = pos.coords.latitude;
            const newLon = pos.coords.longitude;
            const moved = getDistanceMeters(lastMovementLat, lastMovementLon, newLat, newLon);

            if (moved < 10) {
                // Less than 10m movement in 2 minutes — possible distress
                showToast('🤖 AI Alert: No movement detected for 2 mins!', 'warning');
                logActivity('ai_alert', '🤖 AI: No movement detected — possible distress', newLat, newLon);
                addActivityToUI({ type: 'ai_alert', message: '🤖 AI: No movement detected — possible distress', timestamp: new Date() });
            } else {
                lastMovementLat = newLat;
                lastMovementLon = newLon;
            }
        });
    }, 2 * 60 * 1000); // every 2 minutes
}

// ===== MAP =====
function latLonToPixel(lat, lon, mapW, mapH) {
    const x = ((lon - (userLon - 0.01)) / 0.02) * mapW;
    const y = mapH - ((lat - (userLat - 0.01)) / 0.02) * mapH;
    return {
        x: Math.max(10, Math.min(mapW - 10, x)),
        y: Math.max(10, Math.min(mapH - 10, y))
    };
}

function updateMapMarkers() {
    const map = document.getElementById('geofenceMap');
    const mapW = map.offsetWidth;
    const mapH = map.offsetHeight;

    const userPos = latLonToPixel(userLat, userLon, mapW, mapH);
    const dangerPos = latLonToPixel(dangerZoneLat, dangerZoneLon, mapW, mapH);

    const userMarker = document.getElementById('userMarker');
    userMarker.style.left = userPos.x + 'px';
    userMarker.style.top = userPos.y + 'px';

    const dangerZone = document.getElementById('dangerZone');
    dangerZone.style.left = dangerPos.x + 'px';
    dangerZone.style.top = dangerPos.y + 'px';
    dangerZone.style.transform = 'translate(-50%, -50%)';
}

// ===== HAVERSINE =====
function getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ===== RISK ASSESSMENT =====
function assessRisk() {
    if (userLat === null) return;

    const hour = new Date().getHours();
    const dist = getDistanceMeters(userLat, userLon, dangerZoneLat, dangerZoneLon);

    let risk = 10;
    if (hour >= 22 || hour < 6) risk += 30;
    if (dist < 500) risk += 50;
    else if (dist < 800) risk += 35;
    else if (dist < 1500) risk += 15;

    risk = Math.min(risk, 100);

    let level = 'low';
    if (risk >= 65) level = 'high';
    else if (risk >= 35) level = 'medium';

    document.getElementById('riskScore').textContent = level.toUpperCase();
    document.getElementById('riskScore').className = `risk-value ${level}`;
    document.getElementById('riskFill').style.width = risk + '%';

    updateStatus(level === 'high' ? 'danger' : 'safe');
    checkGeofence(dist);
}

function checkGeofence(dist) {
    const warning = document.getElementById('geofenceWarning');
    const distanceInfo = document.getElementById('geofenceDistance');

    if (distanceInfo) {
        distanceInfo.textContent = dist < 1000
            ? `${Math.round(dist)}m from danger zone`
            : `${(dist / 1000).toFixed(1)}km from danger zone`;
    }

    if (dist < 500) {
        warning.classList.add('active');
        updateStatus('danger');
        showToast('⚠️ You are inside a danger zone!', 'danger');
        logActivity('danger_zone', '🚨 Entered danger zone', userLat, userLon);
        addActivityToUI({ type: 'danger_zone', message: '🚨 Entered danger zone', timestamp: new Date() });
    } else if (dist < 800) {
        warning.classList.add('active');
        showToast('⚠️ Danger zone nearby, stay alert!', 'warning');
    } else {
        warning.classList.remove('active');
    }
}

function updateStatus(status) {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    const sub = document.getElementById('statusSubtext');

    if (status === 'danger') {
        dot.className = 'status-dot danger';
        text.className = 'status-text danger';
        text.textContent = 'DANGER';
        sub.textContent = 'High risk detected in your area';
    } else {
        dot.className = 'status-dot safe';
        text.className = 'status-text safe';
        text.textContent = 'SAFE';
        sub.textContent = 'All systems normal';
    }
}

// ===== ACTIVITY LOG =====
async function logActivity(type, message, latitude = null, longitude = null) {
    try {
        await apiFetch('/auth/activity', {
            method: 'POST',
            body: JSON.stringify({ type, message, latitude, longitude })
        });
    } catch { /* silent fail — don't interrupt UX */ }
}

async function loadActivityLog() {
    try {
        const user = await apiFetch('/auth/profile');
        const log = user.activityLog || [];
        const list = document.getElementById('activityList');
        if (!list) return;

        list.innerHTML = '';
        // Show latest 8 entries
        [...log].reverse().slice(0, 8).forEach(entry => addActivityToUI(entry, false));
    } catch { /* silent */ }
}

function addActivityToUI(entry, prepend = true) {
    const list = document.getElementById('activityList');
    if (!list) return;

    const icons = { login: '[LOGIN]', sos: '[SOS]', location_check: '[LOC]', danger_zone: '[ZONE]', ai_alert: '[AI]' };
    const colors = { login: 'var(--primary-teal)', sos: 'var(--danger-red)', location_check: 'var(--success-green)', danger_zone: 'var(--warning-orange)', ai_alert: 'var(--accent-purple)' };
    const time = new Date(entry.timestamp).toLocaleTimeString();

    const item = document.createElement('div');
    item.className = 'activity-item';
    const color = colors[entry.type] || 'var(--text-tertiary)';
    item.innerHTML = `
        <span class="activity-icon" style="color:${color};font-size:0.75rem;font-weight:700;background:rgba(255,255,255,0.06);padding:0.3rem 0.5rem;border-radius:0.4rem;font-family:monospace;">${icons[entry.type] || '[LOG]'}</span>
        <span class="activity-message">${entry.message}</span>
        <span class="activity-time">${time}</span>
    `;

    if (prepend && list.firstChild) {
        list.insertBefore(item, list.firstChild);
    } else {
        list.appendChild(item);
    }
}

function refreshDashboard() {
    getLocation();
    loadActivityLog();
    showToast('🔄 Dashboard refreshed', 'success');
}
