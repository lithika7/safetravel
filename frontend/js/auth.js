function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    const title = document.getElementById('authTitle');
    const btn = document.getElementById('authBtn');
    const toggle = document.getElementById('toggleText');
    const confirm = document.getElementById('confirmPasswordGroup');
    const extraFields = document.getElementById('extraRegisterFields');
    const extraFields2 = document.getElementById('extraRegisterFields2');

    if (isRegisterMode) {
        title.textContent = 'Create Account';
        btn.textContent = 'Create Account & Issue Blockchain ID';
        toggle.textContent = 'Already have an account? ';
        confirm.classList.remove('hidden');
        extraFields.classList.remove('hidden');
        extraFields2.classList.remove('hidden');
    } else {
        title.textContent = 'Login';
        btn.textContent = 'Login';
        toggle.textContent = "Don't have an account? ";
        confirm.classList.add('hidden');
        extraFields.classList.add('hidden');
        extraFields2.classList.add('hidden');
    }

    document.getElementById('authForm').reset();
    document.getElementById('passwordStrengthBar').style.width = '0%';
    document.querySelectorAll('.error-message').forEach(m => m.classList.remove('show'));
}

function checkPasswordStrength(val) {
    const bar = document.getElementById('passwordStrengthBar');
    const label = document.getElementById('passwordStrengthLabel');
    let strength = 0;
    if (val.length >= 4) strength++;
    if (val.length >= 8) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;

    const levels = [
        { w: '0%', color: 'transparent', text: '' },
        { w: '25%', color: '#ef4444', text: 'Weak' },
        { w: '50%', color: '#f97316', text: 'Fair' },
        { w: '75%', color: '#eab308', text: 'Good' },
        { w: '100%', color: '#22c55e', text: 'Strong' },
        { w: '100%', color: '#22c55e', text: 'Strong' }
    ];
    bar.style.width = levels[strength].w;
    bar.style.background = levels[strength].color;
    label.textContent = levels[strength].text;
    label.style.color = levels[strength].color;
}

async function handleAuth(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;

    let valid = true;

    if (username.length < 3) {
        showError('username', 'Username must be 3+ characters');
        valid = false;
    } else { clearError('username'); }

    if (password.length < 4) {
        showError('password', 'Password must be 4+ characters');
        valid = false;
    } else { clearError('password'); }

    if (isRegisterMode && password !== confirm) {
        showError('confirmPassword', 'Passwords do not match');
        valid = false;
    } else if (isRegisterMode) { clearError('confirmPassword'); }

    if (!valid) return;

    const btn = document.getElementById('authBtn');
    btn.disabled = true;
    btn.textContent = isRegisterMode ? 'Creating...' : 'Logging in...';

    try {
        const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
        const body = { username, password };

        if (isRegisterMode) {
            body.fullName = document.getElementById('fullName').value.trim();
            body.mobile = document.getElementById('mobile').value.trim();
            body.role = document.getElementById('role').value;
        }

        const data = await apiFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', data.username);
        localStorage.setItem('blockchainId', data.blockchainId || '');
        currentUser = data.username;

        showToast(`Welcome, ${data.username}!`, 'success');

        if (isRegisterMode) {
            showToast('🔗 Blockchain ID issued!', 'success');
            toggleAuthMode();
        } else {
            document.getElementById('usernameDisplay').textContent = data.username;
            goToPage('dashboard');
        }
    } catch (err) {
        showToast(err.message, 'danger');
    } finally {
        btn.disabled = false;
        btn.textContent = isRegisterMode ? 'Create Account & Issue Blockchain ID' : 'Login';
    }
}

function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const msg = input.parentElement.querySelector('.error-message');
    input.classList.add('error');
    msg.textContent = message;
    msg.classList.add('show');
}

function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const msg = input.parentElement.querySelector('.error-message');
    input.classList.remove('error');
    msg.classList.remove('show');
}
