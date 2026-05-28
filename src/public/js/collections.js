document.addEventListener('DOMContentLoaded', () => {
  const collectionModal = document.getElementById('collectionModal')
  const deleteCollectionModal = document.getElementById('deleteCollectionModal')

  if (!collectionModal) return // Not on saved page

  const bsCollectionModal = new bootstrap.Modal(collectionModal)
  const bsDeleteModal = new bootstrap.Modal(deleteCollectionModal)

  // =============================================
  // Nueva Colección
  // =============================================
  const btnNew = document.getElementById('btnNewCollection')
  if (btnNew) {
    btnNew.addEventListener('click', () => {
      document.getElementById('collectionModalLabel').textContent = 'Nueva Colección'
      document.getElementById('collectionName').value = ''
      document.getElementById('collectionDescription').value = ''
      document.getElementById('collectionEditId').value = ''
      bsCollectionModal.show()
    })
  }

  // =============================================
  // Editar Colección
  // =============================================
  document.querySelectorAll('.btn-edit-collection').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('collectionModalLabel').textContent = 'Editar Colección'
      document.getElementById('collectionName').value = btn.dataset.name
      document.getElementById('collectionDescription').value = btn.dataset.description
      document.getElementById('collectionEditId').value = btn.dataset.id
      bsCollectionModal.show()
    })
  })

  // =============================================
  // Guardar Colección (crear o editar)
  // =============================================
  const btnSave = document.getElementById('btnSaveCollection')
  if (btnSave) {
    btnSave.addEventListener('click', async () => {
      const name = document.getElementById('collectionName').value.trim()
      const description = document.getElementById('collectionDescription').value.trim()
      const editId = document.getElementById('collectionEditId').value

      if (!name) {
        document.getElementById('collectionName').classList.add('is-invalid')
        return
      }
      document.getElementById('collectionName').classList.remove('is-invalid')

      btnSave.disabled = true
      btnSave.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Guardando...'

      try {
        const url = editId ? `/collections/${editId}` : '/collections'
        const method = editId ? 'PUT' : 'POST'

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description })
        })

        const data = await response.json()

        if (data.success) {
          bsCollectionModal.hide()
          window.location.reload()
        } else {
          alert(data.message || 'Error al guardar la colección')
        }
      } catch (err) {
        console.error('Error guardando colección:', err)
        alert('Error de conexión')
      } finally {
        btnSave.disabled = false
        btnSave.innerHTML = '<i class="bi bi-check-lg me-1"></i> Guardar'
      }
    })
  }

  // =============================================
  // Eliminar Colección
  // =============================================
  document.querySelectorAll('.btn-delete-collection').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('deleteCollectionName').textContent = btn.dataset.name
      document.getElementById('deleteCollectionId').value = btn.dataset.id
      bsDeleteModal.show()
    })
  })

  const btnConfirmDelete = document.getElementById('btnConfirmDelete')
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', async () => {
      const id = document.getElementById('deleteCollectionId').value

      btnConfirmDelete.disabled = true
      btnConfirmDelete.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Eliminando...'

      try {
        const response = await fetch(`/collections/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()

        if (data.success) {
          bsDeleteModal.hide()
          // Si estamos filtrando por la colección eliminada, redirigir a todos
          const params = new URLSearchParams(window.location.search)
          if (params.get('collection') === id) {
            window.location.href = '/profile/saved'
          } else {
            window.location.reload()
          }
        } else {
          alert(data.message || 'Error al eliminar la colección')
        }
      } catch (err) {
        console.error('Error eliminando colección:', err)
        alert('Error de conexión')
      } finally {
        btnConfirmDelete.disabled = false
        btnConfirmDelete.innerHTML = '<i class="bi bi-trash me-1"></i> Eliminar'
      }
    })
  }

  // =============================================
  // Mover bookmark a otra colección
  // =============================================
  document.querySelectorAll('.move-to-collection').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault()
      const postId = btn.dataset.postId
      const collectionId = btn.dataset.collectionId

      try {
        const response = await fetch(`/profile/saved/${postId}/collection`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectionId: collectionId || null })
        })

        const data = await response.json()

        if (data.success) {
          window.location.reload()
        } else {
          alert(data.message || 'Error al mover la publicación')
        }
      } catch (err) {
        console.error('Error moviendo bookmark:', err)
        alert('Error de conexión')
      }
    })
  })
})
