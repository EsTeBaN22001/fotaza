document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('globalSearchInput')
  const dropdown = document.getElementById('autocompleteDropdown')
  const searchForm = document.getElementById('globalSearchForm')

  if (!searchInput || !dropdown) return

  let debounceTimer = null

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!searchForm.contains(e.target)) {
      dropdown.style.display = 'none'
    }
  })

  // Handle ESC key to close dropdown
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.style.display = 'none'
      searchInput.blur()
    }
  })

  // Input event with debounce
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer)
    const q = searchInput.value.trim()

    if (q.length < 2) {
      dropdown.innerHTML = ''
      dropdown.style.display = 'none'
      return
    }

    debounceTimer = setTimeout(() => {
      fetch(`/search/autocomplete?q=${encodeURIComponent(q)}`)
        .then(res => {
          if (!res.ok) throw new Error('Network error')
          return res.json()
        })
        .then(data => {
          renderSuggestions(data, q)
        })
        .catch(err => {
          console.error('Autocomplete error:', err)
        })
    }, 300) // 300ms debounce
  })

  function renderSuggestions(data, query) {
    const { tags, users, posts } = data
    const totalResults = tags.length + users.length + posts.length

    if (totalResults === 0) {
      dropdown.innerHTML = `
        <div class="p-3 text-center text-muted small">
          <i class="bi bi-search me-1"></i> No se encontraron resultados
        </div>
      `
      dropdown.style.display = 'block'
      return
    }

    let html = ''

    // 1. Render tags
    if (tags && tags.length > 0) {
      html += `<h6 class="dropdown-header text-uppercase text-primary small fw-bold mt-2">
        <i class="bi bi-tag-fill me-1"></i> Etiquetas
      </h6>`
      tags.forEach(tag => {
        html += `
          <a class="dropdown-item d-flex align-items-center py-2 text-wrap" href="/search?tags=${encodeURIComponent(tag)}">
            <span class="badge bg-light text-primary border rounded-pill me-2">#${tag}</span>
            <small class="text-muted">Explorar posts con esta etiqueta</small>
          </a>
        `
      })
    }

    // 2. Render users
    if (users && users.length > 0) {
      html += `<h6 class="dropdown-header text-uppercase text-success small fw-bold mt-2">
        <i class="bi bi-person-fill me-1"></i> Creadores
      </h6>`
      users.forEach(username => {
        html += `
          <a class="dropdown-item d-flex align-items-center py-2" href="/profile/${encodeURIComponent(username)}">
            <div class="bg-light rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 28px; height: 28px;">
              <i class="bi bi-person text-muted small"></i>
            </div>
            <span>@${username}</span>
          </a>
        `
      })
    }

    // 3. Render posts
    if (posts && posts.length > 0) {
      html += `<h6 class="dropdown-header text-uppercase text-warning small fw-bold mt-2">
        <i class="bi bi-image me-1"></i> Publicaciones
      </h6>`
      posts.forEach(post => {
        html += `
          <a class="dropdown-item py-2 text-truncate" href="/posts/${post.id}" title="${escapeHtml(post.title)}">
            <i class="bi bi-file-image text-muted me-2"></i>
            <span class="small">${escapeHtml(post.title)}</span>
          </a>
        `
      })
    }

    dropdown.innerHTML = html
    dropdown.style.display = 'block'
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
})
