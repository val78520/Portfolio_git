/* ============================================
   Valentin Bertinetti — Portfolio
   Interactions sobres
   ============================================ */

(function () {
    'use strict';

    /* ----- Reveal au scroll (IntersectionObserver) ----- */
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -60px 0px',
            }
        );

        revealElements.forEach((el) => revealObserver.observe(el));
    } else {
        // Fallback : tout visible
        revealElements.forEach((el) => el.classList.add('is-visible'));
    }

    /* ----- Header : se masque au scroll vers le bas, réapparaît au scroll vers le haut ----- */
    const header = document.querySelector('.site-header');
    if (header) {
        let lastScroll = 0;
        let ticking = false;

        const body = document.body;

        const updateHeader = () => {
            const currentScroll = window.scrollY;

            if (currentScroll <= 80) {
                header.style.transform = 'translateY(0)';
                body.classList.remove('header-hidden');
            } else if (currentScroll > lastScroll && currentScroll > 200) {
                header.style.transform = 'translateY(-100%)';
                body.classList.add('header-hidden');
            } else if (currentScroll < lastScroll) {
                header.style.transform = 'translateY(0)';
                body.classList.remove('header-hidden');
            }

            lastScroll = currentScroll;
            ticking = false;
        };

        window.addEventListener(
            'scroll',
            () => {
                if (!ticking) {
                    window.requestAnimationFrame(updateHeader);
                    ticking = true;
                }
            },
            { passive: true }
        );
    }

    /* ----- Mobile : burger menu ----- */
    const burger = document.querySelector('.site-header__burger');
    const overlay = document.getElementById('site-nav-overlay');

    if (burger && overlay) {
        const closeMenu = () => {
            document.body.classList.remove('menu-open');
            burger.setAttribute('aria-expanded', 'false');
            burger.setAttribute('aria-label', 'Ouvrir le menu');
            overlay.setAttribute('aria-hidden', 'true');
        };

        const openMenu = () => {
            document.body.classList.add('menu-open');
            burger.setAttribute('aria-expanded', 'true');
            burger.setAttribute('aria-label', 'Fermer le menu');
            overlay.setAttribute('aria-hidden', 'false');
        };

        burger.addEventListener('click', () => {
            if (document.body.classList.contains('menu-open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Ferme le menu au clic sur un lien de l'overlay
        overlay.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', closeMenu);
        });

        // Ferme le menu sur Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
                closeMenu();
            }
        });

        // Si on repasse en desktop alors que le menu était ouvert, on ferme
        const mq = window.matchMedia('(min-width: 721px)');
        mq.addEventListener('change', (e) => {
            if (e.matches && document.body.classList.contains('menu-open')) {
                closeMenu();
            }
        });
    }

    /* ----- Scroll fluide pour les ancres internes ----- */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#' || targetId.length <= 1) return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - headerOffset,
                    behavior: 'smooth',
                });
            }
        });
    });

    /* ----- Homepage : précharge des images du split pour des hovers fluides ----- */
    const splitMedias = document.querySelectorAll('.split__media');
    if (splitMedias.length) {
        splitMedias.forEach((media) => {
            const bg = window.getComputedStyle(media).backgroundImage;
            const match = bg && bg.match(/url\(["']?(.+?)["']?\)/);
            if (match && match[1]) {
                const img = new Image();
                img.src = match[1];
            }
        });
    }

    /* ----- Case study : lightbox sur les figures ----- */
    const lightbox = document.querySelector('.lightbox');
    if (lightbox) {
        const lightboxImg = lightbox.querySelector('.lightbox__image');
        const lightboxCaption = lightbox.querySelector('.lightbox__caption');
        const lightboxClose = lightbox.querySelector('.lightbox__close');
        const figures = document.querySelectorAll(
            '.case-figure, .case-chapter__photo, .case-gallery__item'
        );

        const openLightbox = (src, alt, caption) => {
            lightboxImg.src = src;
            lightboxImg.alt = alt || '';
            lightboxCaption.textContent = caption || '';
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            // focus le bouton close pour l'accessibilité clavier
            window.setTimeout(() => lightboxClose.focus(), 50);
        };

        const closeLightbox = () => {
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            // reset après la transition pour éviter le flash
            window.setTimeout(() => {
                if (!lightbox.classList.contains('is-open')) {
                    lightboxImg.src = '';
                    lightboxImg.alt = '';
                    lightboxCaption.textContent = '';
                }
            }, 320);
        };

        figures.forEach((figure) => {
            figure.addEventListener('click', (e) => {
                // ne pas ouvrir si l'utilisateur clique sur la caption uniquement
                const img = figure.querySelector('img');
                if (!img) return;
                e.preventDefault();
                const caption = figure.querySelector(
                    '.case-figure__caption, figcaption'
                );
                openLightbox(
                    img.src,
                    img.alt,
                    caption ? caption.textContent.trim() : ''
                );
            });
        });

        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
                closeLightbox();
            }
        });
    }

    /* ----- Case study : TOC active state au scroll ----- */
    const tocSections = document.querySelectorAll('[data-toc]');
    const tocLinks = document.querySelectorAll('[data-toc-link]');

    if (tocSections.length && tocLinks.length && 'IntersectionObserver' in window) {
        const linkById = {};
        tocLinks.forEach((link) => {
            const id = link.getAttribute('href').slice(1);
            linkById[id] = link;
        });

        const tocObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const id = entry.target.id;
                    const link = linkById[id];
                    if (!link) return;

                    if (entry.isIntersecting) {
                        tocLinks.forEach((l) => l.classList.remove('is-active'));
                        link.classList.add('is-active');
                    }
                });
            },
            {
                rootMargin: '-30% 0px -60% 0px',
                threshold: 0,
            }
        );

        tocSections.forEach((section) => tocObserver.observe(section));
    }
})();
