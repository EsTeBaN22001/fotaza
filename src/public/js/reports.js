document.addEventListener('DOMContentLoaded', () => {
  const reportModalEl = document.getElementById('reportModal')
  if (!reportModalEl) return

  const reportModal = new bootstrap.Modal(reportModalEl)
  const reportForm = document.getElementById('reportForm')
  
  // Variables to hold current target
  let currentTargetType = ''
  let currentTargetId = ''

  // Attach event to report buttons
  document.querySelectorAll('.btn-report').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentTargetType = e.currentTarget.dataset.targetType
      currentTargetId = e.currentTarget.dataset.targetId
      
      // Update modal info
      document.getElementById('reportTargetType').value = currentTargetType
      document.getElementById('reportTargetId').value = currentTargetId
      
      // Reset form
      reportForm.reset()
      
      reportModal.show()
    })
  })

  // Handle form submission
  reportForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const submitBtn = reportForm.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    
    const reason = document.getElementById('reportReason').value
    const description = document.getElementById('reportDescription').value

    try {
      const response = await fetch('/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          targetType: currentTargetType,
          targetId: currentTargetId,
          reason,
          description
        })
      })

      const data = await response.json()

      if (response.ok) {
        reportModal.hide()
        // Mostrar success toast o alert
        alert(data.message || 'Denuncia enviada correctamente')
      } else {
        alert(data.error || 'Error al enviar la denuncia')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión al enviar denuncia')
    } finally {
      submitBtn.disabled = false
    }
  })
})
