// Script de test pour vérifier le scroll mobile dans les DevTools
// À exécuter dans la console du navigateur

console.log('🚀 Test de scroll mobile - DS Parfum');
console.log('====================================');

// Fonction de diagnostic
function diagnosticScrollMobile() {
    const isMobile = window.innerWidth <= 768;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const supportsSmooth = 'scrollBehavior' in document.documentElement.style;
    
    console.log('📱 Informations du navigateur:');
    console.log('  - Mobile détecté:', isMobile);
    console.log('  - iOS:', isIOS);
    console.log('  - Safari:', isSafari);
    console.log('  - Chrome:', isChrome);
    console.log('  - Firefox:', isFirefox);
    console.log('  - Support scroll smooth:', supportsSmooth);
    console.log('  - Largeur:', window.innerWidth + 'px');
    console.log('  - User Agent:', navigator.userAgent);
    
    return { isMobile, isIOS, isSafari, isChrome, isFirefox, supportsSmooth };
}

// Test de scroll vers une section
function testScrollToSection(sectionId = 'collections') {
    console.log('\n🎯 Test de scroll vers:', sectionId);
    
    const element = document.getElementById(sectionId);
    if (!element) {
        console.error('❌ Élément non trouvé:', sectionId);
        return;
    }
    
    const isMobile = window.innerWidth <= 768;
    const offset = isMobile ? 120 : 100;
    
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const targetPosition = Math.max(0, elementPosition - offset);
    
    console.log('  - Position actuelle:', window.pageYOffset);
    console.log('  - Position élément:', elementPosition);
    console.log('  - Offset:', offset);
    console.log('  - Position cible:', targetPosition);
    console.log('  - Distance:', targetPosition - window.pageYOffset);
    
    // Test du scroll
    try {
        if (window.scrollToPosition) {
            console.log('  ✅ Utilisation de scrollToPosition()');
            window.scrollToPosition(targetPosition);
        } else {
            console.log('  ⚠️ scrollToPosition non disponible, test manuel');
            window.scrollTo(0, targetPosition);
        }
    } catch (error) {
        console.error('  ❌ Erreur de scroll:', error);
    }
}

// Test des onglets de collection
function testTabClick(collectionKey = 'femme') {
    console.log('\n📋 Test de clic d\'onglet:', collectionKey);
    
    const collectionsContent = document.getElementById('collections-content');
    if (!collectionsContent) {
        console.error('❌ Élément collections-content non trouvé');
        return;
    }
    
    const isMobile = window.innerWidth <= 768;
    const offset = isMobile ? 120 : 100;
    
    const elementPosition = collectionsContent.getBoundingClientRect().top + window.pageYOffset;
    const targetPosition = Math.max(0, elementPosition - offset);
    
    console.log('  - Position collections-content:', elementPosition);
    console.log('  - Position cible:', targetPosition);
    
    // Simuler le délai
    setTimeout(() => {
        try {
            if (window.scrollToPosition) {
                console.log('  ✅ Scroll après délai');
                window.scrollToPosition(targetPosition);
            } else {
                console.log('  ⚠️ scrollToPosition non disponible');
                window.scrollTo(0, targetPosition);
            }
        } catch (error) {
            console.error('  ❌ Erreur de scroll:', error);
        }
    }, 150);
}

// Test de performance
function testScrollPerformance() {
    console.log('\n⏱️ Test de performance de scroll');
    
    const startTime = performance.now();
    const startPosition = window.pageYOffset;
    const targetPosition = startPosition + 1000;
    
    console.log('  - Position initiale:', startPosition);
    console.log('  - Position cible:', targetPosition);
    
    let frameCount = 0;
    function trackFrames() {
        frameCount++;
        if (Math.abs(window.pageYOffset - targetPosition) < 10) {
            const endTime = performance.now();
            console.log('  ✅ Scroll terminé en:', (endTime - startTime).toFixed(2) + 'ms');
            console.log('  - Frames utilisées:', frameCount);
            console.log('  - Position finale:', window.pageYOffset);
        } else if (frameCount < 200) {
            requestAnimationFrame(trackFrames);
        } else {
            console.log('  ⚠️ Timeout de scroll atteint');
        }
    }
    
    if (window.scrollToPosition) {
        window.scrollToPosition(targetPosition);
        requestAnimationFrame(trackFrames);
    } else {
        console.log('  ❌ scrollToPosition non disponible');
    }
}

// Menu de test interactif
function menuTest() {
    console.log('\n🎮 Menu de test interactif:');
    console.log('  diagnosticScrollMobile() - Diagnostic complet');
    console.log('  testScrollToSection("collections") - Test scroll vers collections');
    console.log('  testScrollToSection("pack-decouverte") - Test scroll vers pack découverte');
    console.log('  testTabClick("femme") - Test clic onglet');
    console.log('  testScrollPerformance() - Test de performance');
    console.log('\nExemple: diagnosticScrollMobile()');
}

// Lancement automatique
diagnosticScrollMobile();
menuTest();

// Export des fonctions pour utilisation globale
window.testScrollMobile = {
    diagnostic: diagnosticScrollMobile,
    scrollToSection: testScrollToSection,
    tabClick: testTabClick,
    performance: testScrollPerformance,
    menu: menuTest
};

console.log('\n✅ Tests disponibles via window.testScrollMobile');
