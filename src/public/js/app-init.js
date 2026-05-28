document.addEventListener('DOMContentLoaded', function() {
  const toastElements = document.querySelectorAll('.toast.show')
  toastElements.forEach(function(toastEl) {
    const toast = new bootstrap.Toast(toastEl, {
      delay: 10000,
      autohide: true
    })
    toast.show()
  })
  
  if (window.history.replaceState) {
    const url = new URL(window.location)
    url.searchParams.delete('success')
    url.searchParams.delete('error')
    url.searchParams.delete('errors')
    window.history.replaceState({}, document.title, url)
  }

  document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG' && !e.target.dataset.fallback) {
      e.target.dataset.fallback = 'true';
      e.target.src = '/placeholder.svg';
    }
  }, true);
})
