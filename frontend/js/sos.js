async function activateSOS() {
    const btn = document.getElementById('sosButton');
    const alertBox = document.getElementById('sosAlert');

    btn.disabled = true;
    btn.classList.add('activated');

    // Try to get real location, fall back to null
    let latitude = null, longitude = null;
    try {
        const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
    } catch {
        // location unavailable, still send SOS without coords
    }

    try {
        await apiFetch('/auth/sos', {
            method: 'POST',
            body: JSON.stringify({ latitude, longitude })
        });

        alertBox.classList.add('show');
        showToast('🚨 SOS ACTIVATED - Emergency services notified!', 'danger');

        setTimeout(() => {
            alertBox.classList.remove('show');
            btn.classList.remove('activated');
            btn.disabled = false;
        }, 5000);

    } catch (err) {
        showToast(err.message === 'No token, unauthorized'
            ? 'Please log in to use SOS'
            : '🚨 SOS sent (offline mode)', 'danger');
        btn.classList.remove('activated');
        btn.disabled = false;
    }
}
