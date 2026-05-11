document.addEventListener('DOMContentLoaded', () => {
  const likeButtons = document.querySelectorAll('.like-btn')
  let clickTimer = null

  // Función genérica para dar/quitar like
  const toggleLike = async (postId) => {
    if (!postId) return

    try {
      const response = await fetch(`/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        window.location.href = '/auth/login'
        return
      }

      const data = await response.json()

      if (data.success) {
        updateLikeUI(postId, data.liked, data.likeCount)
        return data.liked
      }
    } catch (err) {
      console.error('Fetch error:', err)
    }
    return null
  }

  // Actualizar la UI
  const updateLikeUI = (postId, liked, count) => {
    const buttons = document.querySelectorAll(`.like-btn[data-post-id="${postId}"]`)
    buttons.forEach(btn => {
      const icon = btn.querySelector('i')
      const countSpan = btn.querySelector('.like-count')
      
      if (liked) {
        btn.classList.remove('text-muted')
        btn.classList.add('text-danger')
        icon.classList.remove('bi-heart')
        icon.classList.add('bi-heart-fill')
        btn.setAttribute('aria-label', 'Quitar me gusta')
      } else {
        btn.classList.remove('text-danger')
        btn.classList.add('text-muted')
        icon.classList.remove('bi-heart-fill')
        icon.classList.add('bi-heart')
        btn.setAttribute('aria-label', 'Dar me gusta')
      }
      
      if (countSpan) countSpan.textContent = count
    })
  }

  // Evento Click en botón de like (clásico)
  likeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const postId = button.getAttribute('data-post-id')
      toggleLike(postId)
    })
  })

  // Manejo de clicks en imágenes/links de posts
  // Solo aplicamos esto a los links que contienen la imagen del post
  const postImageLinks = document.querySelectorAll('.card-img-top, .carousel-inner, .carousel-item img')
  
  postImageLinks.forEach(element => {
    const link = element.closest('a[href^="/posts/"]')
    if (!link) return

    link.addEventListener('click', async (e) => {
      const postId = link.getAttribute('href').split('/').pop()
      
      if (!clickTimer) {
        // Primer click
        e.preventDefault()
        clickTimer = setTimeout(() => {
          window.location.href = link.getAttribute('href')
          clickTimer = null
        }, 250)
      } else {
        // Segundo click (Double click)
        clearTimeout(clickTimer)
        clickTimer = null
        e.preventDefault()
        
        // Ejecutar Like
        const btn = document.querySelector(`.like-btn[data-post-id="${postId}"]`)
        const isLiked = btn?.classList.contains('text-danger')
        
        if (!isLiked) {
          await toggleLike(postId)
        }
        
        // Animación (buscamos el contenedor de la imagen para centrar el corazón)
        const animationContainer = link.querySelector('.carousel-inner') || link
        showHeartAnimation(animationContainer)
      }
    })
  })

  // Animación de corazón
  const showHeartAnimation = (container) => {
    const heart = document.createElement('i')
    heart.className = 'bi bi-heart-fill text-white position-absolute top-50 start-50 translate-middle'
    heart.style.fontSize = '5rem'
    heart.style.opacity = '0'
    heart.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    heart.style.zIndex = '1000'
    heart.style.pointerEvents = 'none'
    heart.style.textShadow = '0 0 20px rgba(0,0,0,0.5)'
    
    container.style.position = 'relative'
    container.appendChild(heart)
    
    setTimeout(() => {
      heart.style.opacity = '0.9'
      heart.style.transform = 'translate(-50%, -50%) scale(1.2)'
    }, 10)
    
    setTimeout(() => {
      heart.style.opacity = '0'
      heart.style.transform = 'translate(-50%, -50%) scale(0.3)'
      setTimeout(() => heart.remove(), 400)
    }, 600)
  }
})
