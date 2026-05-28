document.addEventListener('DOMContentLoaded', () => {
  const saveButtons = document.querySelectorAll('.save-btn')

  // =============================================
  // Modal de selección de colección (se inyecta dinámicamente)
  // =============================================
  let bookmarkModalEl = document.getElementById('bookmarkCollectionModal')
  if (!bookmarkModalEl) {
    bookmarkModalEl = document.createElement('div')
    bookmarkModalEl.id = 'bookmarkCollectionModal'
    bookmarkModalEl.className = 'modal fade'
    bookmarkModalEl.tabIndex = -1
    bookmarkModalEl.setAttribute('aria-hidden', 'true')
    bookmarkModalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content">
          <div class="modal-header py-2">
            <h6 class="modal-title fw-bold">
              <i class="bi bi-bookmark-plus me-1"></i> Guardar en colección
            </h6>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-0">
            <div id="bookmarkCollectionList" class="list-group list-group-flush">
              <div class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary"></div>
              </div>
            </div>
          </div>
          <div class="modal-footer py-2">
            <button type="button" class="btn btn-sm btn-outline-primary w-100" id="btnQuickCreateCollection">
              <i class="bi bi-plus-lg me-1"></i> Nueva colección
            </button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(bookmarkModalEl)
  }

  const bsBookmarkModal = new bootstrap.Modal(bookmarkModalEl)
  let pendingPostId = null

  // =============================================
  // Función para guardar/quitar de favoritos
  // =============================================
  const saveToCollection = async (postId, collectionId) => {
    if (!postId) return null

    try {
      const response = await fetch(`/posts/${postId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId: collectionId || null })
      })

      if (response.status === 401) {
        window.location.href = `/posts/${postId}`
        return null
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

  // Quitar bookmark directamente (sin modal)
  const removeBookmark = async (postId) => {
    return saveToCollection(postId, null)
  }

  // =============================================
  // Cargar colecciones y mostrar modal
  // =============================================
  const showCollectionModal = async (postId) => {
    pendingPostId = postId
    const listEl = document.getElementById('bookmarkCollectionList')
    listEl.innerHTML = '<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>'
    bsBookmarkModal.show()

    try {
      const response = await fetch('/collections', {
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()

      let html = ''

      // Opción "Sin colección"
      html += `
        <button type="button" class="list-group-item list-group-item-action d-flex align-items-center py-2 bookmark-collection-option" data-collection-id="">
          <i class="bi bi-inbox me-2 text-muted"></i>
          <span>Sin colección</span>
        </button>
      `

      if (data.success && data.collections.length > 0) {
        data.collections.forEach(col => {
          html += `
            <button type="button" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-2 bookmark-collection-option" data-collection-id="${col.id}">
              <span class="text-truncate">
                <i class="bi bi-folder2 me-2 text-primary"></i>
                ${escapeHtml(col.name)}
              </span>
              <span class="badge bg-light text-dark rounded-pill small">${col.postCount}</span>
            </button>
          `
        })
      }

      listEl.innerHTML = html

      // Bind click events
      listEl.querySelectorAll('.bookmark-collection-option').forEach(opt => {
        opt.addEventListener('click', async () => {
          const collectionId = opt.dataset.collectionId
          bsBookmarkModal.hide()
          await saveToCollection(pendingPostId, collectionId)
          pendingPostId = null
        })
      })
    } catch (err) {
      console.error('Error loading collections:', err)
      listEl.innerHTML = '<div class="text-center py-3 text-danger small">Error al cargar colecciones</div>'
    }
  }

  // =============================================
  // Quick create collection desde el modal de bookmark
  // =============================================
  const btnQuickCreate = document.getElementById('btnQuickCreateCollection')
  if (btnQuickCreate) {
    btnQuickCreate.addEventListener('click', async () => {
      const name = prompt('Nombre de la nueva colección:')
      if (!name || name.trim().length === 0) return

      try {
        const response = await fetch('/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() })
        })

        const data = await response.json()

        if (data.success) {
          // Guardar en la nueva colección
          bsBookmarkModal.hide()
          await saveToCollection(pendingPostId, data.collection.id)
          pendingPostId = null
        } else {
          alert(data.message || 'Error al crear la colección')
        }
      } catch (err) {
        console.error('Error creating collection:', err)
        alert('Error de conexión')
      }
    })
  }

  // =============================================
  // Actualizar la UI
  // =============================================
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

  // =============================================
  // Evento Click en botón de guardar
  // =============================================
  saveButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const postId = button.getAttribute('data-post-id')
      const isSaved = button.classList.contains('text-primary')

      if (isSaved) {
        // Ya está guardado → quitar directamente
        removeBookmark(postId)
      } else {
        // No está guardado → mostrar modal de colección
        showCollectionModal(postId)
      }
    })
  })

  // =============================================
  // Utilidades
  // =============================================
  function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
})
