function initDashboard() {
    getLocation();
    assessRisk();
    checkGeofence();
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                const acc = Math.round(pos.coords.accuracy);

                document.getElementById('latitude').textContent = lat.toFixed(4);
                document.getElementById('longitude').textContent = lon.toFixed(4);
                document.getElementById('accuracy').textContent = acc;
                document.querySelector('.location-display').innerHTML = '';
                document.getElementById('locationInfo').style.display = 'block';

                simulateLocation(lat, lon);
                showToast('Location updated', 'success');
            },
            () => {
                simulateLocation(40.7128, -74.0060);
                document.querySelector('.location-display').innerHTML = '<p style="color: var(--text-tertiary);">Using simulated location</p>';
                document.getElementById('locationInfo').style.display = 'block';
            }
        );
    }
}

function assessRisk() {
    const hour = new Date().getHours();
    const random = Math.random();
    let risk = 20;

    if (hour >= 22 || hour < 6) risk += 35;
    if (random > 0.75) risk += 30;

    let level = 'low';
    if (risk > 65) {
        level = 'high';
        updateStatus('danger');
    } else if (risk > 40) {
        level = 'medium';
    }

    document.getElementById('riskScore').textContent = level.toUpperCase();
    document.getElementById('riskScore').className = `risk-value ${level}`;
    document.getElementById('riskFill').style.width = risk + '%';
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

function simulateLocation(lat, lon) {
    const marker = document.getElementById('userMarker');
    const x = (lat * 15) % 300 + 50;
    const y = (lon * 15) % 300 + 50;
    marker.style.left = x + 'px';
    marker.style.top = y + 'px';
}

function checkGeofence() {
    const user = document.getElementById('userMarker').getBoundingClientRect();
    const danger = document.getElementById('dangerZone').getBoundingClientRect();
    const dist = Math.hypot(user.left - danger.left, user.top - danger.top);

    if (dist < 150) {
        document.getElementById('geofenceWarning').classList.add('active');
        updateStatus('danger');
        showToast('⚠️ Danger zone proximity alert!', 'warning');
    } else {
        document.getElementById('geofenceWarning').classList.remove('active');
        updateStatus('safe');
    }
}

function refreshDashboard() {
    assessRisk();
    checkGeofence();
    showToast('Dashboard refreshed', 'success');
}
