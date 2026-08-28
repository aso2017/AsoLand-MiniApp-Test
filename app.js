document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;

  if (tg) {
    tg.ready();
    tg.expand();

    const user = tg.initDataUnsafe?.user;
    if (user) {
      document.getElementById('user-welcome').innerText = `خوش آمدید، ${user.first_name || 'کاربر عزیز'}`;
      document.getElementById('user-id').innerText = user.id ? `#${user.id}` : '---';
    } else {
      document.getElementById('user-welcome').innerText = 'خوش آمدید به آصولند';
    }

    const btn = document.getElementById('main-action-btn');
    btn.addEventListener('click', () => {
      tg.HapticFeedback?.impactOccurred('medium');

      // ۱. تغییر وضعیت دکمه جهت بازخورد به کاربر
      btn.disabled = true;
      btn.innerHTML = '<span>در حال ثبت...</span>';

      const payload = JSON.stringify({ 
        action: 'submit_click', 
        user_id: user?.id || null,
        timestamp: Date.now() 
      });

      // ۲. نمایش پیغام تایید به کاربر و سپس بستن مینی‌اپ
      tg.showAlert('اطلاعات با موفقیت تایید شد!', () => {
        try {
          tg.sendData(payload);
        } catch (e) {
          console.log('Opened via Menu Button, sendData skipped.');
        }
        tg.close();
      });
    });
  }
});
