let isLoggedIn = false;
let currentUser = '';
let isRegisterMode = false;
function goToPage(pageId) {
 if (pageId !== 'landing' && pageId !== 'auth' && !isLoggedIn) {
  pageId = 'auth';
}

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  if (pageId === 'dashboard') initDashboard();
}

function logout() {
  isLoggedIn = false;
  currentUser = '';
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isLoggedIn');
  document.getElementById('authForm').reset();
  goToPage('landing');
  showToast('Logged out successfully', 'info');
}