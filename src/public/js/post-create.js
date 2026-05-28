document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.getElementById('imageInput')
  const previewContainer = document.getElementById('imagePreviewContainer')

  if (!imageInput || !previewContainer) return

  imageInput.addEventListener('change', function () {
    previewContainer.innerHTML = ''
    const files = Array.from(this.files)

    if (files.length === 0) return

    const heading = document.createElement('h6')
    heading.className = 'fw-semibold mb-3 text-muted'
    heading.innerHTML = '<i class="bi bi-sliders me-1"></i> Configurar licencia por imagen'
    previewContainer.appendChild(heading)

    files.forEach((file, idx) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const card = document.createElement('div')
        card.className = 'license-card p-3 mb-3'
        card.innerHTML = `
          <div class="d-flex align-items-start gap-3">
            <img src="${e.target.result}" class="img-preview-thumb" alt="Preview ${idx + 1}" />
            <div class="flex-grow-1">
              <p class="fw-semibold mb-2 small">${file.name}</p>
              <div class="d-flex gap-3 mb-2">
                <div class="form-check">
                  <input class="form-check-input license-radio" type="radio" name="license" value="copyright" 
                         id="lic_copy_${idx}" ${idx === 0 ? 'checked' : ''} data-idx="${idx}">
                  <label class="form-check-label small" for="lic_copy_${idx}">
                    <i class="bi bi-c-circle text-warning me-1"></i>Con copyright
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input license-radio" type="radio" name="license" value="free"
                         id="lic_free_${idx}" data-idx="${idx}">
                  <label class="form-check-label small" for="lic_free_${idx}">
                    <i class="bi bi-unlock text-success me-1"></i>Libre de derechos
                  </label>
                </div>
              </div>
              <div class="watermark-field visible" id="wm_field_${idx}">
                <label class="form-label small fw-semibold">
                  <i class="bi bi-water me-1"></i>Texto de marca de agua
                </label>
                <input type="text" class="form-control form-control-sm" name="watermark"
                       placeholder="Ej: © Mi Nombre 2026" maxlength="60"
                       id="wm_input_${idx}" />
                <small class="text-muted">La marca de agua se aplicará en diagonal sobre la imagen.</small>
              </div>
            </div>
          </div>
        `
        previewContainer.appendChild(card)

        // Toggle watermark field on license change
        card.querySelectorAll('.license-radio').forEach(radio => {
          radio.addEventListener('change', function () {
            const wmField = document.getElementById(`wm_field_${this.dataset.idx}`)
            if (this.value === 'copyright') {
              wmField.classList.add('visible')
            } else {
              wmField.classList.remove('visible')
              document.getElementById(`wm_input_${this.dataset.idx}`).value = ''
            }
          })
        })
      }
      reader.readAsDataURL(file)
    })
  })
})
