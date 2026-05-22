let currentUser = '';
let isRegisterMode = false;

function isLoggedIn() {
    return !!localStorage.getItem('token');
}

function updateNav(pageId) {
    const authNav = document.getElementById('authNav');
    const appNav = document.getElementById('appNav');

    if (pageId === 'landing' || pageId === 'auth') {
        authNav.style.display = 'flex';
        appNav.style.display = 'none';
    } else {
        authNav.style.display = 'none';
        appNav.style.display = 'flex';
    }

    document.querySelectorAll('#appNav a[data-page]').forEach(link => {
        link.classList.toggle('active-link', link.dataset.page === pageId);
    });
}

function goToPage(pageId) {
    if (pageId !== 'landing' && pageId !== 'auth' && !isLoggedIn()) {
        pageId = 'auth';
    }
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    updateNav(pageId);
    if (pageId === 'dashboard') initDashboard();
}

function logout() {
    currentUser = '';
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    document.getElementById('authForm').reset();
    goToPage('landing');
    showToast('Logged out successfully', 'info');
}

window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('currentUser');
    if (token && saved) {
        currentUser = saved;
        document.getElementById('usernameDisplay').textContent = saved;
        goToPage('dashboard');
    } else {
        goToPage('landing');
    }
});
