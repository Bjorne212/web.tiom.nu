// ========================================
// TIOM Web - Main Script
// ========================================

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form handling
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            company: formData.get('company'),
            phone: formData.get('phone'),
            projectType: formData.get('project-type'),
            message: formData.get('message')
        };
        
        // Log form data (in production, send to backend)
        console.log('Form submitted:', data);
        
        // Show success message
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = '✓ Förfrågan Skickad!';
        submitButton.style.background = '#10b981';
        
        // Reset form
        this.reset();
        
        // Restore button after 3 seconds
        setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.style.background = '';
        }, 3000);
    });
}

// Intersection Observer for fade-in animations
if ('IntersectionObserver' in window) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe cards
    document.querySelectorAll('.project-item, .process-item, .testimonial').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// Hero bubble parallax exit on scroll
const navbar = document.querySelector('.navbar');

if (navbar) {
    const updateNavbarState = () => {
        if (window.scrollY > 36) {
            navbar.classList.add('is-compact');
        } else {
            navbar.classList.remove('is-compact');
        }
    };

    updateNavbarState();
    window.addEventListener('scroll', updateNavbarState, { passive: true });
    window.addEventListener('resize', updateNavbarState);
}

const bubbleSections = Array.from(document.querySelectorAll('.hero, .bubble-zone'))
    .map((section) => ({
        section,
        bubbles: section.querySelector('.hero-bubbles')
    }))
    .filter((item) => Boolean(item.bubbles));

if (bubbleSections.length > 0) {
    let ticking = false;

    const updateSectionBubbles = () => {
        const viewportHeight = window.innerHeight || 1;

        bubbleSections.forEach(({ section, bubbles }) => {
            const rect = section.getBoundingClientRect();
            const sectionHeight = Math.max(rect.height, 1);

            // Skip expensive updates for far-off sections.
            if (rect.bottom < -160 || rect.top > viewportHeight + 160) {
                return;
            }

            // Progress from 0 to 1 as section scrolls out of view.
            const progress = Math.min(Math.max(-rect.top / sectionHeight, 0), 1);
            const translateY = -Math.round(progress * 220);
            const fade = 1 - (progress * 1.1);

            bubbles.style.transform = `translate3d(0, ${translateY}px, 0)`;
            bubbles.style.opacity = String(Math.max(fade, 0));
        });

        ticking = false;
    };

    const onBubbleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateSectionBubbles);
            ticking = true;
        }
    };

    updateSectionBubbles();
    window.addEventListener('scroll', onBubbleScroll, { passive: true });
    window.addEventListener('resize', onBubbleScroll);
}

// Counter animation for stats
const animateCounters = () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const text = stat.textContent;
        const value = parseInt(text);
        
        if (!isNaN(value)) {
            let current = 0;
            const increment = value / 30;
            const timer = setInterval(() => {
                current += increment;
                if (current >= value) {
                    stat.textContent = text;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current) + '+';
                }
            }, 30);
        }
    });
};

// Trigger counter animation when visible
if ('IntersectionObserver' in window) {
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('TIOM Web loaded');
    initWizard();
});

// ========================================
// ORDER WIZARD
// ========================================

let wizardState = {
    currentStep: 1,
    package: '',
    pageTypes: [],
    isTemplate: false
};

function initWizard() {
    const wizardButtons = document.querySelectorAll('[data-wizard]');
    const wizardModal = document.getElementById('order-wizard');
    const wizardOverlay = document.querySelector('.wizard-overlay');
    const closeBtn = document.querySelector('.wizard-close');
    const actionBtns = document.querySelectorAll('[data-action]');

    // Open wizard when clicking pricing buttons
    wizardButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const packageName = btn.getAttribute('data-package');
            openWizard(packageName);
        });
    });

    // Close wizard
    if (closeBtn) {
        closeBtn.addEventListener('click', closeWizard);
    }
    if (wizardOverlay) {
        wizardOverlay.addEventListener('click', closeWizard);
    }

    // Action buttons
    actionBtns.forEach(btn => {
        btn.addEventListener('click', handleWizardAction);
    });

    // Prevent closing when clicking inside modal
    const wizardContainer = document.querySelector('.wizard-container');
    if (wizardContainer) {
        wizardContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Allow users to close the modal with Escape when it is open.
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && wizardModal && wizardModal.getAttribute('aria-hidden') === 'false') {
            closeWizard();
        }
    });
}

function openWizard(packageName) {
    wizardState.package = packageName;
    wizardState.isTemplate = packageName.includes('Template');
    wizardState.pageTypes = wizardState.isTemplate
        ? ['Templateupplagg (fardig struktur)']
        : [];

    const modal = document.getElementById('order-wizard');
    const packageNameEl = document.querySelector('.wizard-package-name');
    
    if (packageNameEl) {
        packageNameEl.textContent = packageName;
    }
    
    // Template packages go directly to form (step 2), others start at page selection (step 1)
    const startStep = wizardState.isTemplate ? 2 : 1;
    updateSummary();
    showStep(startStep);
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeWizard() {
    const modal = document.getElementById('order-wizard');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Reset form
    const inputs = document.querySelectorAll('.wizard-form input, .wizard-form textarea');
    inputs.forEach(input => input.value = '');
    
    const checkboxes = document.querySelectorAll('.wizard-page-types input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
}

function showStep(stepNumber) {
    const steps = document.querySelectorAll('.wizard-step[data-step]');
    steps.forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        if (stepNum === stepNumber) {
            if (stepNum === 3) {
                step.style.display = 'flex';
                step.style.flexDirection = 'column';
                step.style.alignItems = 'center';
                step.style.justifyContent = 'center';
            } else {
                step.style.display = 'block';
                step.style.flexDirection = '';
                step.style.alignItems = '';
                step.style.justifyContent = '';
            }
        } else {
            step.style.display = 'none';
            step.style.flexDirection = '';
            step.style.alignItems = '';
            step.style.justifyContent = '';
        }
    });
    
    // Hide back button for template on step 2
    const backBtn = document.getElementById('wizard-back-btn');
    if (backBtn) {
        if (wizardState.isTemplate && stepNumber === 2) {
            backBtn.style.display = 'none';
        } else {
            backBtn.style.display = 'inline-block';
        }
    }
    
    wizardState.currentStep = stepNumber;
}

function handleWizardAction(e) {
    const action = e.currentTarget.getAttribute('data-action');
    
    switch(action) {
        case 'next':
            handleNext();
            break;
        case 'back':
            showStep(1);
            break;
        case 'submit':
            handleSubmit();
            break;
        case 'cancel':
        case 'close':
            closeWizard();
            break;
    }
}

function handleNext() {
    const checkboxes = document.querySelectorAll('.wizard-page-types input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        alert('Vänligen välj minst en sidtyp');
        return;
    }
    
    wizardState.pageTypes = Array.from(checkboxes).map(cb => cb.value);
    updateSummary();
    showStep(2);
}

function updateSummary() {
    const summaryPackage = document.getElementById('summary-package');
    const summaryPages = document.getElementById('summary-pages');
    
    if (summaryPackage) {
        summaryPackage.textContent = wizardState.package;
    }
    if (summaryPages) {
        summaryPages.textContent = wizardState.pageTypes.join(', ');
    }
}

function handleSubmit() {
    const nameInput = document.getElementById('wizard-name');
    const emailInput = document.getElementById('wizard-email');
    const messageInput = document.getElementById('wizard-message');
    const companyInput = document.getElementById('wizard-company');
    const phoneInput = document.getElementById('wizard-phone');
    
    // Validation
    if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
        alert('Vänligen fyll i alla obligatoriska fält (*)');
        return;
    }
    
    // Prepare form data
    const formData = {
        name: nameInput.value,
        email: emailInput.value,
        company: companyInput.value,
        phone: phoneInput.value,
        package: wizardState.package,
        pageTypes: wizardState.pageTypes.join(', '),
        message: messageInput.value,
        source: 'wizard',
        isTemplate: wizardState.isTemplate
    };
    
    // Submit in background (log to console in this version)
    console.log('Order submitted:', formData);
    
    // Show success message
    showStep(3);
    
    // Close after 3 seconds
    setTimeout(() => {
        closeWizard();
    }, 3000);
}

