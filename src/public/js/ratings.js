/**
 * Sistema de valoración con estrellas (1-5) para publicaciones.
 * Envía la valoración via AJAX y actualiza la UI sin recargar la página.
 */
document.addEventListener('DOMContentLoaded', () => {
  const starContainers = document.querySelectorAll('.star-rating-input')

  starContainers.forEach(container => {
    const postId = container.dataset.postId
    const starBtns = container.querySelectorAll('.star-btn')

    // Hover: iluminar estrellas hasta la que se hace hover
    starBtns.forEach((btn, idx) => {
      btn.addEventListener('mouseenter', () => {
        starBtns.forEach((b, i) => {
          const icon = b.querySelector('i')
          if (i <= idx) {
            icon.classList.remove('bi-star', 'text-muted')
            icon.classList.add('bi-star-fill', 'text-warning')
          } else {
            icon.classList.remove('bi-star-fill', 'text-warning')
            icon.classList.add('bi-star', 'text-muted')
          }
        })
      })

      // Mouse leave: volver al estado original
      btn.addEventListener('mouseleave', () => {
        starBtns.forEach(b => {
          const icon = b.querySelector('i')
          if (!b.classList.contains('selected')) {
            icon.classList.remove('bi-star-fill', 'text-warning')
            icon.classList.add('bi-star', 'text-muted')
          }
        })
      })

      // Click: enviar valoración
      btn.addEventListener('click', async () => {
        const value = parseInt(btn.dataset.value)

        // Marcar visualmente como seleccionado antes de la respuesta
        starBtns.forEach((b, i) => {
          const icon = b.querySelector('i')
          if (i < value) {
            b.classList.add('selected')
            icon.classList.remove('bi-star', 'text-muted')
            icon.classList.add('bi-star-fill', 'text-warning')
          } else {
            b.classList.remove('selected')
            icon.classList.remove('bi-star-fill', 'text-warning')
            icon.classList.add('bi-star', 'text-muted')
          }
        })

        // Deshabilitar botones mientras se procesa
        starBtns.forEach(b => (b.disabled = true))

        try {
          const response = await fetch(`/posts/${postId}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value })
          })

          if (response.status === 401) {
            window.location.href = `/posts/${postId}`
            return
          }

          const data = await response.json()

          if (data.success) {
            updateRatingUI(postId, data.userRating, data.ratingAvg, data.ratingCount)
          } else {
            showRatingMessage(container, data.message || 'Error al valorar.', 'danger')
            // Re-habilitar si hubo error
            starBtns.forEach(b => (b.disabled = false))
          }
        } catch (err) {
          console.error('Error en ratePost:', err)
          showRatingMessage(container, 'Error de conexión.', 'danger')
          starBtns.forEach(b => (b.disabled = false))
        }
      })
    })

    // Resetear hover al salir del contenedor completo
    container.addEventListener('mouseleave', () => {
      starBtns.forEach(b => {
        if (!b.classList.contains('selected')) {
          const icon = b.querySelector('i')
          icon.classList.remove('bi-star-fill', 'text-warning')
          icon.classList.add('bi-star', 'text-muted')
        }
      })
    })
  })

  /**
   * Actualiza la UI de valoración tras una valoración exitosa.
   */
  function updateRatingUI(postId, userRating, ratingAvg, ratingCount) {
    // Reemplazar el widget de estrellas con un mensaje de éxito
    const container = document.querySelector(`.star-rating-input[data-post-id="${postId}"]`)
    if (!container) return

    const parent = container.closest('.d-flex')
    if (parent) {
      parent.innerHTML = `
        <div class="alert alert-success py-2 px-3 mb-0 small w-100">
          <i class="bi bi-check-circle me-1"></i>
          Valoraste con <strong>${userRating}</strong> ${userRating === 1 ? 'estrella' : 'estrellas'}
        </div>
      `
    }

    // Actualizar el display de promedio
    updateAverageDisplay(ratingAvg, ratingCount)
  }

  /**
   * Actualiza el display del promedio y cantidad de valoraciones.
   */
  function updateAverageDisplay(ratingAvg, ratingCount) {
    const avgEl = document.querySelector('.rating-display')
    if (avgEl) {
      let starsHtml = ''
      const avg = parseFloat(ratingAvg)
      const rounded = Math.round(avg)
      for (let s = 1; s <= 5; s++) {
        starsHtml += `<i class="bi ${s <= rounded ? 'bi-star-fill text-warning' : 'bi-star text-muted'} fs-5"></i>`
      }
      avgEl.innerHTML = starsHtml

      // Actualizar el número de promedio
      const avgNum = avgEl.nextElementSibling
      if (avgNum) avgNum.textContent = ratingAvg

      // Actualizar el contador
      const countEl = avgEl.closest('.d-flex').parentElement.querySelector('.text-muted.small:last-child')
    }

    // Actualizar contador de valoraciones en el header de la sección
    const countDisplay = document.querySelector('[class*="ratingCount"]')
  }

  /**
   * Muestra un mensaje en el contenedor de rating.
   */
  function showRatingMessage(container, message, type) {
    const msgEl = document.createElement('div')
    msgEl.className = `alert alert-${type} py-2 px-3 small mt-2`
    msgEl.textContent = message
    container.parentNode.insertBefore(msgEl, container.nextSibling)
    setTimeout(() => msgEl.remove(), 4000)
  }
})
