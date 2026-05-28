async function markRead(id) {
  try {
    const res = await fetch(`/notifications/${id}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    if (res.ok) {
      const item = document.getElementById(`notif-${id}`);
      if (item) {
        item.classList.remove('bg-primary-subtle');
        const dotBtn = item.querySelector('.bi-circle-fill');
        if (dotBtn) dotBtn.parentElement.remove();

        const badge = document.querySelector('.navbar .bi-bell + .badge');
        if (badge) {
          const currentCount = parseInt(badge.textContent);
          if (currentCount > 1) {
            badge.textContent = currentCount - 1;
          } else {
            badge.remove();
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function deleteNotif(id) {
  if (!confirm('¿Seguro que deseas eliminar esta notificación?')) return;
  try {
    const res = await fetch(`/notifications/${id}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    if (res.ok) {
      const item = document.getElementById(`notif-${id}`);
      if (item) {
        const isUnread = item.classList.contains('bg-primary-subtle');
        if (isUnread) {
          const badge = document.querySelector('.navbar .bi-bell + .badge');
          if (badge) {
            const currentCount = parseInt(badge.textContent);
            if (currentCount > 1) {
              badge.textContent = currentCount - 1;
            } else {
              badge.remove();
            }
          }
        }
        item.remove();

        const list = document.querySelector('.list-group');
        if (list && list.children.length === 0) {
          location.reload();
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
