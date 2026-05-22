function activateSOS() {
            const btn = document.getElementById('sosButton');
            const alert = document.getElementById('sosAlert');

            btn.classList.add('activated');
            alert.classList.add('show');

            showToast('🚨 SOS ACTIVATED - Emergency services notified!', 'danger');

            setTimeout(() => {
                alert.classList.remove('show');
                btn.classList.remove('activated');
            }, 5000);
        }