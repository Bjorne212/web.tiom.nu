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
});

