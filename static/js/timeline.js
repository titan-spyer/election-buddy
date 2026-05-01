document.addEventListener('DOMContentLoaded', function() {
    const timelineItems = document.querySelectorAll('.timelineItem');
    const progressBar = document.getElementById('timelineProgress');
    const container = document.getElementById('timelineContainer');
    const nextBtn = document.getElementById('nextBtnContainer');

    // Scroll Observer for revealing items
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: "0px 0px -100px 0px"
    });

    timelineItems.forEach(item => observer.observe(item));

    // Scroll Progress Bar logic
    window.addEventListener('scroll', () => {
        if (!container || !progressBar) return;
        
        const containerRect = container.getBoundingClientRect();
        const containerTop = containerRect.top + window.scrollY;
        const containerHeight = containerRect.height;
        
        // Calculate how much we've scrolled past the top of the container
        let scrollPosition = window.scrollY + (window.innerHeight / 2) - containerTop;
        
        // Clamp the value between 0 and containerHeight
        scrollPosition = Math.max(0, Math.min(scrollPosition, containerHeight));
        
        // Convert to percentage
        let percentage = (scrollPosition / containerHeight) * 100;
        
        progressBar.style.height = percentage + '%';

        // Show next button when at bottom
        if (nextBtn && percentage > 90) {
            nextBtn.style.opacity = '1';
            nextBtn.style.transform = 'translateY(0)';
        }
    });
    
    // Trigger scroll event once on load to set initial state
    window.dispatchEvent(new Event('scroll'));
});
