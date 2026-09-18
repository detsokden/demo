// =============================================
// FOOTER - Single file with HTML, CSS, and JS
// =============================================
(function() {
    
    // ===== FOOTER CSS =====
    var footerCSS = `
        /* ===== FOOTER ===== */
        .footer {
            background: #0a0e12;
            padding: 3.5rem 8% 2rem;
            position: relative;
            z-index: 1;
            border-top: 1px solid rgba(255, 255, 255, 0.04);
            margin-top: 3rem;
            width: 100%;
        }

        .footer-wrapper {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1.5fr 1.5fr;
            gap: 2.5rem;
        }

        .footer-col-1 .footer-logo { margin-bottom: 1rem; }
        .footer-col-1 .footer-logo img { height: 45px; width: auto; display: block; filter: brightness(0) invert(1); }
        .footer-col-1 .footer-tagline { color: rgba(255, 255, 255, 0.4); font-size: 0.9rem; line-height: 1.7; max-width: 280px; }

        .footer-col h4 {
            color: #fff;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 1.2rem;
            position: relative;
        }

        .footer-col h4::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 30px;
            height: 2px;
            background: #038494;
        }

        .footer-col ul { list-style: none; padding: 0; margin: 0; }
        .footer-col ul li { margin-bottom: 0.6rem; }
        .footer-col ul li a {
            color: rgba(255, 255, 255, 0.4);
            text-decoration: none;
            font-size: 0.85rem;
            transition: all 0.3s ease;
            display: inline-block;
        }
        .footer-col ul li a:hover { color: #038494; transform: translateX(4px); }

        .footer-col-3 .footer-contact-item {
            display: flex;
            align-items: flex-start;
            gap: 0.8rem;
            margin-bottom: 0.8rem;
        }

        .footer-col-3 .footer-contact-item .contact-icon { color: #038494; font-size: 0.9rem; width: 20px; margin-top: 0.1rem; }
        .footer-col-3 .footer-contact-item .contact-text { color: rgba(255, 255, 255, 0.6); font-size: 0.85rem; line-height: 1.5; }
        .footer-col-3 .footer-contact-item .contact-text a { color: rgba(255, 255, 255, 0.6); text-decoration: none; transition: color 0.3s ease; }
        .footer-col-3 .footer-contact-item .contact-text a:hover { color: #038494; }

        .footer-col-4 .footer-social {
            display: flex;
            gap: 0.8rem;
            margin-bottom: 1.5rem;
        }

        .footer-col-4 .footer-social a {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.06);
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255, 255, 255, 0.4);
            font-size: 0.9rem;
            transition: all 0.3s ease;
            text-decoration: none;
        }

        .footer-col-4 .footer-social a:hover {
            background: rgba(3,132,148,0.1);
            border-color: rgba(3,132,148,0.2);
            color: #038494;
            transform: translateY(-3px);
        }

        .footer-col-4 .footer-payment {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            margin-top: 0.5rem;
        }

        .footer-col-4 .footer-payment .payment-label { color: rgba(255, 255, 255, 0.3); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; }
        .footer-col-4 .footer-payment .payment-icons { display: flex; gap: 0.5rem; }
        .footer-col-4 .footer-payment .payment-icons span { color: rgba(255, 255, 255, 0.15); font-size: 1.8rem; transition: color 0.3s ease; }
        .footer-col-4 .footer-payment .payment-icons span:hover { color: rgba(255, 255, 255, 0.4); }

        .footer-bottom {
            max-width: 1200px;
            margin: 0 auto;
            padding-top: 1.5rem;
            margin-top: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.04);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .footer-bottom .footer-copy { color: rgba(255, 255, 255, 0.25); font-size: 0.8rem; letter-spacing: 0.5px; }
        .footer-bottom .footer-copy span { color: rgba(255, 255, 255, 0.4); }
        .footer-bottom .footer-legal { display: flex; gap: 1.5rem; }
        .footer-bottom .footer-legal a { color: rgba(255, 255, 255, 0.25); text-decoration: none; font-size: 0.8rem; transition: color 0.3s ease; }
        .footer-bottom .footer-legal a:hover { color: rgba(255, 255, 255, 0.4); }

        @media (max-width: 1024px) {
            .footer-wrapper { grid-template-columns: 1fr 1fr 1fr; gap: 2rem; }
            .footer-col-1 { grid-column: span 1; }
        }

        @media (max-width: 768px) {
            .footer { padding: 2.5rem 5% 1.5rem; }
            .footer-wrapper { grid-template-columns: 1fr 1fr; gap: 1.8rem; }
            .footer-col-1 { grid-column: span 2; }
            .footer-col-1 .footer-tagline { max-width: 100%; }
            .footer-bottom { flex-direction: column; text-align: center; gap: 0.8rem; }
            .footer-bottom .footer-legal { flex-wrap: wrap; justify-content: center; gap: 1rem; }
        }

        @media (max-width: 600px) {
            .footer { padding: 2rem 4% 1.2rem; }
            .footer-wrapper { grid-template-columns: 1fr; gap: 1.5rem; }
            .footer-col-1 { grid-column: span 1; }
            .footer-col-4 .footer-social a { width: 36px; height: 36px; font-size: 0.8rem; }
            .footer-col-4 .footer-payment .payment-icons span { font-size: 1.5rem; }
            .footer-bottom .footer-copy { font-size: 0.7rem; }
            .footer-bottom .footer-legal a { font-size: 0.7rem; }
        }
    `;

    // ===== FOOTER HTML =====
    var footerHTML = `
        <footer class="footer">
            <div class="footer-wrapper">
                <div class="footer-col footer-col-1">
                    <div class="footer-logo">
                        <img src="/uploads/logo.png" alt="Sonitori" width="160">
                    </div>
                    <p class="footer-tagline">
                        Experience the perfect blend of modern comfort and traditional Khmer hospitality.
                    </p>
                </div>

                <div class="footer-col">
                    <h4>Destinations</h4>
                    <ul>
                        <li><a href="../phnompenh/">Phnom Penh</a></li>
                        <li><a href="/siemreap/">Siem Reap</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h4>Quick Link</h4>
                    <ul>
                        <li><a href="https://maps.app.goo.gl/6WXFTYwUPaGZzass8">Map</a></li>
                        <li><a href="/siemreap/policy-privacy/">Policy Privacy</a></li>
                    </ul>
                </div>

                <div class="footer-col footer-col-3">
                    <h4>Reservation</h4>
                    <div class="footer-contact-item">
                        <span class="contact-icon"><i class="fas fa-phone"></i></span>
                        <span class="contact-text">
                            <a href="tel:+85587759779">+855(0)87 759 779</a>
                        </span>
                    </div>
                    <div class="footer-contact-item">
                        <span class="contact-icon"><i class="fas fa-envelope"></i></span>
                        <span class="contact-text">
                            <a href="mailto:sonitoririverside.info@gmail.com">sonitoririverside.info@gmail.com</a>
                        </span>
                    </div>
                </div>

                <div class="footer-col footer-col-4">
                    
                    <div class="footer-social">
                        
                    </div>
                    <div class="footer-payment">
                        <span class="payment-label">Pay way :</span>
                        <div class="payment-icons">
                            <span><i class="fab fa-cc-visa"></i></span>
                            <span><i class="fab fa-cc-mastercard"></i></span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <div class="footer-copy">
                    Copyright © <span>Sonitori</span> 2026
                </div>
            </div>
        </footer>
    `;

    // ===== INJECT FOOTER =====
    function injectFooter() {
        // Check if footer already exists
        if (document.querySelector('.footer')) {
            console.log('Footer already exists');
            return;
        }
        
        console.log('Injecting footer...');
        
        // Inject CSS
        var styleTag = document.getElementById('footerStyles');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'footerStyles';
            styleTag.textContent = footerCSS;
            document.head.appendChild(styleTag);
            console.log('Footer CSS injected');
        }
        
        // Create footer element
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = footerHTML.trim();
        var footerElement = tempDiv.firstElementChild;
        
        if (!footerElement) {
            console.error('Failed to create footer element');
            return;
        }
        
        // Find where to place the footer
        var mainContent = document.getElementById('mainContent');
        
        if (mainContent) {
            // Insert after mainContent
            mainContent.parentNode.insertBefore(footerElement, mainContent.nextSibling);
            console.log('Footer inserted after #mainContent');
        } else {
            // If no mainContent, append to body after all content
            document.body.appendChild(footerElement);
            console.log('Footer appended to body');
        }
    }

    // ===== RUN ON PAGE LOAD =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, injecting footer...');
            injectFooter();
        });
    } else {
        console.log('Page already loaded, injecting footer...');
        injectFooter();
    }

    // Also run after a small delay to ensure everything is loaded
    setTimeout(function() {
        if (!document.querySelector('.footer')) {
            console.log('Footer not found, retrying injection...');
            injectFooter();
        }
    }, 500);

})();