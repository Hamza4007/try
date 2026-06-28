const cursor = document.querySelector('.cursor');

if (cursor) {
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  const speed = 0.08;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    currentX += (mouseX - currentX) * speed;
    currentY += (mouseY - currentY) * speed;

    cursor.style.left = `${currentX}px`;
    cursor.style.top = `${currentY}px`;

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}

window.addEventListener('load', () => {
  const targets = document.querySelectorAll('.section-animate, section');
  const staggerDelay = 90;

  targets.forEach((target) => {
    target.classList.add('section-animate');

    const elements = target.querySelectorAll('h1, h2, h3, p, li, img, button, a, .btn, .about-card, .project-card, .contact-card, .contact-form');
    elements.forEach((el) => el.classList.add('element-animate'));
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');

          const inner = entry.target.querySelectorAll('.element-animate');
          inner.forEach((el, i) => {
            setTimeout(() => {
              el.classList.add('show');
            }, i * staggerDelay);
          });
          return;
        }

        entry.target.classList.remove('show');
        const inner = entry.target.querySelectorAll('.element-animate');
        inner.forEach((el) => el.classList.remove('show'));
      });
    },
    { threshold: 0.2 }
  );

  targets.forEach((target) => observer.observe(target));

  const magneticButtons = document.querySelectorAll('.btn, .nav-cta');
  const enableMagnetic =
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (enableMagnetic) {
    magneticButtons.forEach((button) => {
      button.addEventListener('mousemove', (event) => {
        const rect = button.getBoundingClientRect();
        const offsetX = event.clientX - (rect.left + rect.width / 2);
        const offsetY = event.clientY - (rect.top + rect.height / 2);

        const moveX = Math.max(-96, Math.min(96, offsetX * 0.3));
        const moveY = Math.max(-72, Math.min(72, offsetY * 0.3));

        button.style.setProperty('--mx', `${moveX}px`);
        button.style.setProperty('--my', `${moveY}px`);
      });

      button.addEventListener('mouseleave', () => {
        button.style.setProperty('--mx', '0px');
        button.style.setProperty('--my', '0px');
      });

      button.addEventListener('blur', () => {
        button.style.setProperty('--mx', '0px');
        button.style.setProperty('--my', '0px');
      });
    });
  }

  const skillsGrid = document.querySelector('.skills-grid');
  const skillsSection = document.querySelector('#skills');
  if (skillsGrid) {
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocityX = 0;
    let momentumRaf = 0;

    function clampScroll(value) {
      const maxScroll = skillsGrid.scrollWidth - skillsGrid.clientWidth;
      return Math.max(0, Math.min(maxScroll, value));
    }

    function stopMomentum() {
      if (momentumRaf) {
        cancelAnimationFrame(momentumRaf);
        momentumRaf = 0;
      }
    }

    skillsGrid.addEventListener(
      'wheel',
      (event) => {
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
          event.preventDefault();
          skillsGrid.scrollLeft = clampScroll(skillsGrid.scrollLeft + event.deltaY);
        }
      },
      { passive: false }
    );

    function beginDrag(clientX) {
      stopMomentum();
      isDragging = true;
      startX = clientX;
      startScrollLeft = skillsGrid.scrollLeft;
      lastX = clientX;
      lastTime = performance.now();
      velocityX = 0;
      skillsGrid.classList.add('is-dragging');
    }

    function moveDrag(clientX) {
      if (!isDragging) {
        return;
      }

      const distance = clientX - startX;
      const nextScrollLeft = clampScroll(startScrollLeft - distance);
      skillsGrid.scrollLeft = nextScrollLeft;

      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocityX = (clientX - lastX) / dt;
      }
      lastX = clientX;
      lastTime = now;
    }

    function endDrag() {
      if (!isDragging) {
        return;
      }
      isDragging = false;
      skillsGrid.classList.remove('is-dragging');

      let momentum = -velocityX * 26;
      stopMomentum();

      const momentumStep = () => {
        momentum *= 0.92;
        if (Math.abs(momentum) < 0.08) {
          momentumRaf = 0;
          return;
        }

        skillsGrid.scrollLeft = clampScroll(skillsGrid.scrollLeft + momentum * 16);
        momentumRaf = requestAnimationFrame(momentumStep);
      };

      if (Math.abs(momentum) >= 0.08) {
        momentumRaf = requestAnimationFrame(momentumStep);
      }
    }

    skillsGrid.addEventListener('mousedown', (event) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      beginDrag(event.clientX);
    });

    window.addEventListener('mousemove', (event) => {
      if (!isDragging) {
        return;
      }
      event.preventDefault();
      moveDrag(event.clientX);
    });

    window.addEventListener('mouseup', endDrag);

    skillsGrid.addEventListener(
      'touchstart',
      (event) => {
        if (!event.touches.length) {
          return;
        }
        beginDrag(event.touches[0].clientX);
      },
      { passive: true }
    );

    skillsGrid.addEventListener(
      'touchmove',
      (event) => {
        if (!isDragging || !event.touches.length) {
          return;
        }
        moveDrag(event.touches[0].clientX);
      },
      { passive: true }
    );

    window.addEventListener('touchend', endDrag, { passive: true });
    window.addEventListener('touchcancel', endDrag, { passive: true });
  }

  if (cursor && skillsSection && window.matchMedia('(pointer: fine)').matches) {
    skillsSection.addEventListener('mouseenter', () => {
      cursor.classList.add('is-drag-hint');
      cursor.setAttribute('data-label', 'Drag');
    });

    skillsSection.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-drag-hint');
      cursor.setAttribute('data-label', '');
    });
  }

  // ============================================================
  // ✅ CONTACT FORM - FULLY FIXED
  // ============================================================
  const contactForm = document.querySelector('#contact-form');
  const formStatus = document.querySelector('#form-status');
  const projectType = document.querySelector('#projectType');
  const otherProjectWrap = document.querySelector('#otherProjectWrap');
  const otherProjectType = document.querySelector('#otherProjectType');
  const submitBtn = contactForm.querySelector('.form-submit');

  if (!contactForm || !formStatus) {
    return;
  }

  function getRequiredFields() {
    return contactForm.querySelectorAll('input[required], select[required], textarea[required]');
  }

  function setStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
  }

  // ✅ Specific error message display
  function setFieldError(field, message) {
    const errorSpan = document.querySelector(`.field-error[data-for="${field.name}"]`);
    if (errorSpan) {
      errorSpan.textContent = message;
    }
  }

  function clearAllErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  }

  function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMsg = '';

    if (field.hasAttribute('required') && value.length === 0) {
      isValid = false;
      errorMsg = 'This field is required.';
    } else if (field.type === 'email' && value.length > 0) {
      if (!field.validity.valid) {
        isValid = false;
        errorMsg = 'Please enter a valid email address.';
      }
    } else if (field.name === 'phone' && value.length > 0) {
      // Simple phone validation (at least 10 digits)
      const digits = value.replace(/\D/g, '');
      if (digits.length < 10) {
        isValid = false;
        errorMsg = 'Please enter a valid phone number (at least 10 digits).';
      }
    } else if (field.name === 'message' && value.length > 0) {
      if (value.length < 20) {
        isValid = false;
        errorMsg = 'Message must be at least 20 characters.';
      }
    } else if (field.name === 'other_project_type' && field.required) {
      if (value.length === 0) {
        isValid = false;
        errorMsg = 'Please specify your project type.';
      }
    }

    field.classList.toggle('is-invalid', !isValid);
    field.setAttribute('aria-invalid', String(!isValid));
    setFieldError(field, errorMsg);
    return isValid;
  }

  function syncOtherProjectField() {
    if (!projectType || !otherProjectWrap || !otherProjectType) {
      return;
    }

    const isOtherSelected = projectType.value === 'other';
    otherProjectWrap.classList.toggle('is-hidden', !isOtherSelected);
    // ✅ ARIA attribute toggled for accessibility
    otherProjectWrap.setAttribute('aria-hidden', String(!isOtherSelected));
    otherProjectType.required = isOtherSelected;

    if (!isOtherSelected) {
      otherProjectType.value = '';
      otherProjectType.classList.remove('is-invalid');
      otherProjectType.setAttribute('aria-invalid', 'false');
      setFieldError(otherProjectType, '');
    }
  }

  syncOtherProjectField();

  if (projectType) {
    projectType.addEventListener('change', () => {
      syncOtherProjectField();
      validateField(projectType);
      if (formStatus.classList.contains('error')) {
        setStatus('', '');
      }
    });
  }

  // Validate on input
  getRequiredFields().forEach((field) => {
    field.addEventListener('input', () => {
      validateField(field);
      if (formStatus.classList.contains('error')) {
        setStatus('', '');
      }
    });
    field.addEventListener('blur', () => {
      validateField(field);
    });
  });

  // ✅ Form submission with fetch and error handling
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Honeypot check
    const honeypot = contactForm.querySelector('input[name="_gotcha"]');
    if (honeypot && honeypot.value.trim() !== '') {
      setStatus('Spam check failed. Please reload and try again.', 'error');
      return;
    }

    // Clear previous errors
    clearAllErrors();

    // Validate all fields
    let allValid = true;
    getRequiredFields().forEach((field) => {
      const valid = validateField(field);
      if (!valid) allValid = false;
    });

    // Check other project field specifically
    if (otherProjectType && otherProjectType.required) {
      const valid = validateField(otherProjectType);
      if (!valid) allValid = false;
    }

    if (!allValid) {
      setStatus('Please fix the errors highlighted above.', 'error');
      return;
    }

    // ✅ Loading state
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Sending...';
    setStatus('Sending message...', 'info');

    try {
      const formData = new FormData(contactForm);
      const response = await fetch('https://formspree.io/f/mreapynk', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setStatus('✅ Message sent successfully! I\'ll reply within 24 hours.', 'success');
        contactForm.reset();
        clearAllErrors();
        // Reset other project fields
        if (otherProjectType) {
          otherProjectType.value = '';
          otherProjectWrap.classList.add('is-hidden');
          otherProjectWrap.setAttribute('aria-hidden', 'true');
          otherProjectType.required = false;
        }
        if (projectType) projectType.value = '';
      } else {
        const errorData = await response.json();
        setStatus(`❌ Server error: ${errorData.error || 'Please try again later.'}`, 'error');
      }
    } catch (error) {
      setStatus('❌ Network error. Please check your internet connection and try again.', 'error');
    } finally {
      // ✅ Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
});