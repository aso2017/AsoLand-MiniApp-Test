document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;

  if (tg) {
    tg.ready();
    tg.expand();

    const user = tg.initDataUnsafe?.user;
    
    if (user) {
      document.getElementById('user-welcome').innerText = `خوش آمدید، ${user.first_name || 'کاربر عزیز'}`;
      document.getElementById('user-id').innerText = user.id ? `#${user.id}` : '---';
      document.getElementById('dash-username').innerText = user.first_name || 'کاربر آصولند';
      document.getElementById('dash-avatar').innerText = (user.first_name || 'A')[0].toUpperCase();
    }

    const btn = document.getElementById('main-action-btn');
    const onboardingScreen = document.getElementById('onboarding-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');

    btn.addEventListener('click', () => {
      tg.HapticFeedback?.impactOccurred('medium');

      onboardingScreen.classList.remove('active');
      dashboardScreen.classList.add('active');
    });
  }
});