// Simulated danger zone — offset ~500m from user's real location
let userLat = null, userLon = null;
let dangerZoneLat = null, dangerZoneLon = null;

function initDashboard() {
    getLocation();
}

function getLocation() {
    document.querySelector('.location-display').innerHTML =
        '<p style="color:var(--text-secondary);">Fetching location...</p><div class="loading-spinner"></div>';
    document.getElementById('locationInfo').style.display = 'none';

    if (!navigator.geolocation) {
        useSimulatedLocation();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            userLat = pos.coords.latitude;
            userLon = pos.coords.longitude;
            const acc = Math.round(pos.coords.accuracy);

            document.getElementById('latitude').textContent = userLat.toFixed(4);
            document.getElementById('longitude').textContent = userLon.toFixed(4);
            document.getElementById('accuracy').textContent = acc;
            document.querySelector('.location-display').innerHTML = '';
            document.getElementById('locationInfo').style.display = 'block';

            // Place danger zone ~500m north-east of user
            dangerZoneLat = userLat + 0.0045;
            dangerZoneLon = userLon + 0.0045;

            updateMapMarkers();
            assessRisk();
            showToast('📍 Location updated', 'success');
        },
        () => useSimulatedLocation(),
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function useSimulatedLocation() {
    userLat = 11.3595;
    userLon = 77.8284;
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

// Convert lat/lon to pixel position inside the map box
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

// Haversine formula — real distance in meters between two coords
function getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function assessRisk() {
    if (userLat === null) return;

    const hour = new Date().getHours();
    const dist = getDistanceMeters(userLat, userLon, dangerZoneLat, dangerZoneLon);

    let risk = 10;
    if (hour >= 22 || hour < 6) risk += 30;   // night time
    if (dist < 800) risk += 40;                // close to danger zone
    else if (dist < 1500) risk += 20;          // moderate proximity

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

function refreshDashboard() {
    getLocation();
    showToast('🔄 Dashboard refreshed', 'success');
}
