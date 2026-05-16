document.addEventListener('DOMContentLoaded', () => {
  const saveButtons = document.querySelectorAll('.save-btn')

  // Función para guardar/quitar de favoritos
  const toggleBookmark = async (postId) => {
    if (!postId) return

    try {
      const response = await fetch(`/posts/${postId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        window.location.href = `/posts/${postId}`
        return
      }

      const data = await response.json()

      if (data.success) {
        updateSaveUI(postId, data.saved)
        return data.saved
      }
    } catch (err) {
      console.error('Bookmark fetch error:', err)
    }
    return null
  }

  // Actualizar la UI
  const updateSaveUI = (postId, saved) => {
    const buttons = document.querySelectorAll(`.save-btn[data-post-id="${postId}"]`)
    buttons.forEach(btn => {
      const icon = btn.querySelector('i')

      if (saved) {
        btn.classList.remove('text-muted')
        btn.classList.add('text-primary')
        icon.classList.remove('bi-bookmark')
        icon.classList.add('bi-bookmark-fill')
        btn.setAttribute('aria-label', 'Quitar de guardados')
      } else {
        btn.classList.remove('text-primary')
        btn.classList.add('text-muted')
        icon.classList.remove('bi-bookmark-fill')
        icon.classList.add('bi-bookmark')
        btn.setAttribute('aria-label', 'Guardar')

        // Si estamos en la página de guardados, quitar la tarjeta del DOM
        if (window.location.pathname === '/profile/saved') {
          const col = btn.closest('.col-md-4')
          if (col) {
            col.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
            col.style.opacity = '0'
            col.style.transform = 'scale(0.9)'
            setTimeout(() => {
              col.remove()
              const remainingPosts = document.querySelectorAll('.save-btn')
              if (remainingPosts.length === 0) {
                window.location.reload()
              }
            }, 300)
          }
        }
      }
    })
  }

  // Evento Click en botón de guardar
  saveButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const postId = button.getAttribute('data-post-id')
      toggleBookmark(postId)
    })
  })
})
