const EFFECT_KEY = 'welcome-gradient-effect-played-v2';

const forcePageTopOnEntry = () => {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    if (window.location.hash) {
        history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
};

const canUseStorage = () => {
    try {
        const testKey = '__welcome_storage_test__';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
};

const revealSections = () => {
    const sections = document.querySelectorAll('.section');

    if (sections.length === 0) {
        return;
    }

    if (!('IntersectionObserver' in window)) {
        sections.forEach((section) => section.classList.add('section-visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add('section-visible');
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.05,
            rootMargin: '0px 0px -5% 0px',
        },
    );

    sections.forEach((section) => observer.observe(section));
};

const initMobileCarousels = () => {
    if (window.matchMedia('(min-width: 681px)').matches) {
        return;
    }

    const carousels = document.querySelectorAll('.courses, .services, .products, .tiktok-grid');

    carousels.forEach((carousel) => {
        if (carousel.dataset.carouselReady === '1') {
            return;
        }

        const cards = Array.from(carousel.querySelectorAll('.card'));

        if (cards.length <= 1) {
            return;
        }

        const dots = document.createElement('div');
        dots.className = 'carousel-dots';
        dots.setAttribute('aria-hidden', 'true');
        const isTikTokCarousel = carousel.classList.contains('tiktok-grid');
        let counter = null;

        const getActiveIndex = () => {
            const cardWidth = cards[0].getBoundingClientRect().width;

            if (cardWidth <= 0) {
                return 0;
            }

            return Math.min(cards.length - 1, Math.max(0, Math.round(carousel.scrollLeft / cardWidth)));
        };

        const setActiveDot = (index) => {
            dots.querySelectorAll('.carousel-dot').forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === index);
            });

            if (counter) {
                counter.textContent = `${index + 1}/${cards.length}`;
            }
        };

        const scrollToIndex = (index) => {
            cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            setActiveDot(index);
        };

        cards.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', `Ver elemento ${index + 1}`);
            dot.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                scrollToIndex(index);
            });
            dots.appendChild(dot);
        });

        if (isTikTokCarousel) {
            const controls = document.createElement('div');
            controls.className = 'carousel-controls tiktok-carousel-controls';

            const prevButton = document.createElement('button');
            prevButton.type = 'button';
            prevButton.className = 'carousel-nav-btn';
            prevButton.setAttribute('aria-label', 'Video anterior');
            prevButton.textContent = '<';

            counter = document.createElement('span');
            counter.className = 'carousel-index';

            const nextButton = document.createElement('button');
            nextButton.type = 'button';
            nextButton.className = 'carousel-nav-btn';
            nextButton.setAttribute('aria-label', 'Siguiente video');
            nextButton.textContent = '>';

            prevButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                const target = (getActiveIndex() - 1 + cards.length) % cards.length;
                scrollToIndex(target);
            });

            nextButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                const target = (getActiveIndex() + 1) % cards.length;
                scrollToIndex(target);
            });

            controls.append(prevButton, counter, nextButton);
            carousel.insertAdjacentElement('afterend', controls);
            controls.insertAdjacentElement('afterend', dots);
        } else {
            carousel.insertAdjacentElement('afterend', dots);
        }

        carousel.addEventListener('scroll', () => setActiveDot(getActiveIndex()), { passive: true });
        setActiveDot(0);
        carousel.dataset.carouselReady = '1';
    });
};

const enableOneTimeEffect = () => {
    const { body } = document;

    if (!body) {
        return;
    }

    if (!canUseStorage()) {
        body.classList.add('play-once-effect');
        revealSections();
        return;
    }

    const alreadyPlayed = localStorage.getItem(EFFECT_KEY) === '1';

    if (alreadyPlayed) {
        body.classList.add('skip-once-effect');
        return;
    }

    body.classList.add('play-once-effect');
    revealSections();
    localStorage.setItem(EFFECT_KEY, '1');
};

const initWelcomePage = () => {
    forcePageTopOnEntry();
    enableOneTimeEffect();
    initMobileCarousels();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWelcomePage);
} else {
    initWelcomePage();
}

window.addEventListener('pageshow', forcePageTopOnEntry);
