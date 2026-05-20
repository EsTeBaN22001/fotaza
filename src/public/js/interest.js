/**
 * Botón "Me interesa" para publicaciones.
 * Envía via AJAX y actualiza la UI del botón.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar estado del botón de interés al cargar (verificar desde servidor)
  initInterestButtons()

  async function initInterestButtons () {
    const buttons = document.querySelectorAll('.interest-btn')
    buttons.forEach(btn => {
      // Primero cargar el estado actual desde el servidor
      const postId = btn.dataset.postId
      checkInterestStatus(postId, btn)

      btn.addEventListener('click', () => toggleInterest(postId, btn))
    })
  }

  async function checkInterestStatus (postId, btn) {
    try {
      const res = await fetch(`/posts/${postId}/interest/status`, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      })
      // Si el endpoint no existe o da 404, simplemente no hacemos nada
      if (res.ok) {
        const data = await res.json()
        if (data.interested) {
          setInterestedState(btn, true)
        }
      }
    } catch {
      // ignorar - el estado se lee desde Pug al renderizar
    }
  }

  async function toggleInterest (postId, btn) {
    btn.disabled = true

    try {
      const response = await fetch(`/posts/${postId}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.status === 401) {
        window.location.href = `/auth/login`
        return
      }

      const data = await response.json()

      if (data.success) {
        setInterestedState(btn, data.interested)

        if (data.interested) {
          showToast('¡Interés registrado! El autor fue notificado. Podés contactarlo desde tu bandeja de mensajes.', 'success')
          // Mostrar link a mensajería
          const msgLink = document.getElementById('msg-link-btn')
          if (msgLink) msgLink.classList.remove('d-none')
        } else {
          showToast('Interés retirado.', 'info')
          const msgLink = document.getElementById('msg-link-btn')
          if (msgLink) msgLink.classList.add('d-none')
        }
      } else {
        showToast(data.message || 'Error al registrar interés.', 'danger')
      }
    } catch (err) {
      console.error('Error en toggleInterest:', err)
      showToast('Error de conexión.', 'danger')
    } finally {
      btn.disabled = false
    }
  }

  function setInterestedState (btn, interested) {
    const textSpan = btn.querySelector('.interest-text')
    const icon = btn.querySelector('i')

    if (interested) {
      btn.classList.remove('btn-outline-success')
      btn.classList.add('btn-success')
      if (icon) {
        icon.classList.remove('bi-hand-thumbsup')
        icon.classList.add('bi-hand-thumbsup-fill')
      }
      if (textSpan) textSpan.textContent = '¡Me interesa! (registrado)'
    } else {
      btn.classList.remove('btn-success')
      btn.classList.add('btn-outline-success')
      if (icon) {
        icon.classList.remove('bi-hand-thumbsup-fill')
        icon.classList.add('bi-hand-thumbsup')
      }
      if (textSpan) textSpan.textContent = 'Me interesa adquirir'
    }
  }

  function showToast (message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container')
    if (!toastContainer) return

    const toastEl = document.createElement('div')
    const bgClass = type === 'success' ? 'bg-success' : type === 'danger' ? 'bg-danger' : 'bg-info'
    toastEl.className = 'toast show'
    toastEl.setAttribute('role', 'alert')
    toastEl.innerHTML = `
      <div class="toast-header ${bgClass} text-white">
        <strong class="me-auto">${type === 'success' ? '✅' : type === 'danger' ? '❌' : 'ℹ️'} Aviso</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">${message}</div>
    `
    toastContainer.appendChild(toastEl)

    const toast = new bootstrap.Toast(toastEl, { delay: 6000 })
    toast.show()
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove())
  }
})
