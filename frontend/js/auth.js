function toggleAuthMode() {
            isRegisterMode = !isRegisterMode;
            const title = document.getElementById('authTitle');
            const btn = document.getElementById('authBtn');
            const toggle = document.getElementById('toggleText');
            const confirm = document.getElementById('confirmPasswordGroup');

            if (isRegisterMode) {
                title.textContent = 'Create Account';
                btn.textContent = 'Sign Up';
                toggle.textContent = 'Already have an account? ';
                confirm.classList.remove('hidden');
            } else {
                title.textContent = 'Login';
                btn.textContent = 'Login';
                toggle.textContent = "Don't have an account? ";
                confirm.classList.add('hidden');
            }

            document.getElementById('authForm').reset();
            document.querySelectorAll('.error-message').forEach(m => m.classList.remove('show'));
        }

        function handleAuth(event) {
            event.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const confirm = document.getElementById('confirmPassword').value;

            let valid = true;

            if (username.length < 3) {
                showError('username', 'Username must be 3+ characters');
                valid = false;
            } else {
                clearError('username');
            }

            if (password.length < 4) {
                showError('password', 'Password must be 4+ characters');
                valid = false;
            } else {
                clearError('password');
            }

            if (isRegisterMode && password !== confirm) {
                showError('confirmPassword', 'Passwords do not match');
                valid = false;
            } else if (isRegisterMode) {
                clearError('confirmPassword');
            }

            if (valid) {
                isLoggedIn = true;
                currentUser = username;
                localStorage.setItem('currentUser', username);
                localStorage.setItem('isLoggedIn', 'true');

                showToast(`Welcome, ${username}!`, 'success');

                if (isRegisterMode) {
                    showToast('Account created successfully!', 'success');
                    toggleAuthMode();
                    document.getElementById('authForm').reset();
                } else {
                    document.getElementById('usernameDisplay').textContent = username;
                    goToPage('dashboard');
                }
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
