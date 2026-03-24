/**
 * Baseaim A/B Testing Engine
 * Lightweight client-side A/B testing for headline
 * Integrates with Meta Pixel
 */
(function () {
    'use strict';

    // =============================================
    // TEST CONFIGURATION — Edit your variants here
    // =============================================
    var TESTS = {
        headline: {
            A: {
                html: '<span style="font-size:2rem;">Accountants</span> <br> <span class="headline-highlight listen-up-highlight" style="font-size:1.9rem">Listen <span id="secret-p" style="cursor:default">up</span></span><br><br><strong>THREE</strong> new clients <br> every single month<span class="headline-br-mid" style="display:block;"></span><span class="headline-highlight" style="font-size:2.55rem"> Or you Don\'t Pay</span>',
                version: 'control'
            },
            B: {
                html: 'Get <span class="headline-highlight">Garunteed results...</span> or you<span class="headline-highlight"> Don\'t Pay Us</span>',
                version: 'variant_b'
            }
        },
        subheadline: {
            A: {
                html: '',
                version: 'control'
            },
            B: {
                html: 'Only for Australian Accounting Firms',
                version: 'variant_b'
            }
        }
    };

    // =============================================
    // ANTI-FLICKER — hide elements until variant is applied
    // =============================================
    var antiFlicker = document.createElement('style');
    antiFlicker.textContent = '.headline, .video-intro { opacity: 0 !important; }';
    document.head.appendChild(antiFlicker);

    // =============================================
    // VARIANT ASSIGNMENT — locked to A, tracking still active
    // =============================================
    var variant = 'A';
    localStorage.setItem('ab_variant', variant);
    localStorage.setItem('ab_variant_time', new Date().toISOString());

    // =============================================
    // APPLY VARIANTS
    // =============================================
    function applyVariants() {
        var headline = document.querySelector('h1.headline');
        if (headline) {
            headline.innerHTML = TESTS.headline[variant].html;
        }

        var subheadline = document.querySelector('p.video-intro');
        if (subheadline) {
            subheadline.innerHTML = TESTS.subheadline[variant].html;
        }

        // Remove anti-flicker
        antiFlicker.remove();
    }

    // =============================================
    // ANALYTICS — Meta Pixel
    // =============================================
    function trackAssignment() {
        if (typeof fbq !== 'undefined') {
            fbq('trackCustom', 'ABTestAssigned', {
                test_name: 'headline_test',
                variant: variant
            });
        }
    }

    // =============================================
    // ENGAGEMENT TRACKING — time, scroll, sections
    // =============================================
    function trackEngagement() {
        // --- Time on page (active tab only) ---
        var milestones = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 30, 60, 120];
        var elapsed = 0;
        var nextIndex = 0;
        var timerActive = !document.hidden;

        setInterval(function () {
            if (!timerActive || nextIndex >= milestones.length) return;
            elapsed++;
            if (elapsed >= milestones[nextIndex]) {
                nextIndex++;
            }
        }, 1000);

        document.addEventListener('visibilitychange', function () {
            timerActive = !document.hidden;
        });

        // --- Scroll depth milestones (percentage) ---
        var scrollFired = {};
        var scrollThresholds = [25, 50, 75, 100];

        window.addEventListener('scroll', function () {
            var pct = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
            for (var i = 0; i < scrollThresholds.length; i++) {
                var t = scrollThresholds[i];
                if (pct >= t && !scrollFired[t]) {
                    scrollFired[t] = true;
                }
            }
        }, { passive: true });

        // --- Section visibility tracking ---
        var sections = [
            { id: 'hero', name: 'Hero' },
            { id: 'frustration', name: 'Trust & Story' },
            { id: 'how-it-works', name: 'How It Works' },
            { id: 'solution', name: 'Guarantee' },
            { id: 'faq', name: 'FAQ' }
        ];
        var sectionFired = {};

        sections.forEach(function (sec) {
            var el = document.getElementById(sec.id);
            if (el && window.IntersectionObserver) {
                var obs = new IntersectionObserver(function (entries) {
                    if (entries[0].isIntersecting && !sectionFired[sec.id]) {
                        sectionFired[sec.id] = true;
                        obs.disconnect();
                    }
                }, { threshold: 0.3 });
                obs.observe(el);
            }
        });

        // --- Form interaction tracking ---
        var formTracked = false;
        var leadForm = document.getElementById('lead-form');
        if (leadForm && window.IntersectionObserver) {
            var formObs = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting && !formTracked) {
                    formTracked = true;
                    formObs.disconnect();
                }
            }, { threshold: 0.3 });
            formObs.observe(leadForm);
        }
    }

    // =============================================
    // INIT
    // =============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            applyVariants();
            trackAssignment();
            trackEngagement();
        });
    } else {
        applyVariants();
        trackAssignment();
        trackEngagement();
    }

    // =============================================
    // DEBUG HELPER — use in browser console
    // =============================================
    window.BASEAIM_AB_TEST = {
        variant: variant,
        reset: function () {
            localStorage.removeItem('ab_variant');
            localStorage.removeItem('ab_variant_time');
            location.reload();
        }
    };
})();
