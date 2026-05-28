document.addEventListener('DOMContentLoaded', () => {
  // Toggle watermark field for existing images
  document.querySelectorAll('.existing-license-radio').forEach(radio => {
    radio.addEventListener('change', function () {
      const imgId = this.dataset.imgid
      const wmField = document.getElementById(`ewm_${imgId}`)
      if (!wmField) return
      if (this.value === 'copyright') {
        wmField.style.display = ''
      } else {
        wmField.style.display = 'none'
        const input = wmField.querySelector('input')
        if (input) input.value = ''
      }
    })
  })

  // Toggle card style when removing
  document.querySelectorAll('.remove-img-cb').forEach(cb => {
    cb.addEventListener('change', function () {
      const card = document.getElementById(`card-img-${this.value}`)
      if (!card) return
      if (this.checked) {
        card.style.opacity = '0.4'
        card.style.outline = '2px solid red'
      } else {
        card.style.opacity = ''
        card.style.outline = ''
      }
    })
  })

  // Preview nuevas imágenes con control de licencia
  const newImageInput = document.getElementById('newImageInput')
  const newPreviewContainer = document.getElementById('newImagePreviewContainer')

  if (newImageInput && newPreviewContainer) {
    newImageInput.addEventListener('change', function () {
      newPreviewContainer.innerHTML = ''
      const files = Array.from(this.files)
      if (files.length === 0) return

      const heading = document.createElement('h6')
      heading.className = 'fw-semibold mb-3 text-muted small'
      heading.innerHTML = '<i class="bi bi-sliders me-1"></i> Licencia para imágenes nuevas'
      newPreviewContainer.appendChild(heading)

      files.forEach((file, idx) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const card = document.createElement('div')
          card.className = 'd-flex align-items-start gap-2 mb-3 p-2 border rounded'
          card.innerHTML = `
            <img src="${e.target.result}" class="img-preview-thumb-sm" alt="Preview" />
            <div class="flex-grow-1">
              <p class="small fw-semibold mb-1">${file.name}</p>
              <div class="d-flex gap-3 mb-1">
                <div class="form-check">
                  <input class="form-check-input new-lic-radio" type="radio" name="license"
                         value="copyright" id="nlc_copy_${idx}" checked data-nidx="${idx}">
                  <label class="form-check-label small" for="nlc_copy_${idx}">Copyright</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input new-lic-radio" type="radio" name="license"
                         value="free" id="nlc_free_${idx}" data-nidx="${idx}">
                  <label class="form-check-label small" for="nlc_free_${idx}">Libre</label>
                </div>
              </div>
              <div class="new-wm-field" id="nwm_${idx}">
                <input type="text" class="form-control form-control-sm" name="watermark"
                       placeholder="Marca de agua (opcional)" maxlength="60" />
              </div>
            </div>
          `
          newPreviewContainer.appendChild(card)
          card.querySelectorAll('.new-lic-radio').forEach(r => {
            r.addEventListener('change', function () {
              const wm = document.getElementById(`nwm_${this.dataset.nidx}`)
              if (!wm) return
              wm.style.display = this.value === 'copyright' ? '' : 'none'
              if (this.value === 'free') {
                const input = wm.querySelector('input')
                if (input) input.value = ''
              }
            })
          })
        }
        reader.readAsDataURL(file)
      })
    })
  }
})
