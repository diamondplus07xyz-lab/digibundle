/**
 * Enterprise Automatic Multi-Language (i18n) Engine for CheapReels.in
 * Automatically adapts website language based on user's country or browser locale:
 * - India: English / Hindi
 * - Spain & Latin America: Español (Spanish)
 * - France & Francophone: Français (French)
 * - Germany & Austria: Deutsch (German)
 * - Middle East / Arab World: العربية (Arabic) with RTL support
 * - Brazil & Portugal: Português (Portuguese)
 * - Japan: 日本語 (Japanese)
 * - Russia & CIS: Русский (Russian)
 * - Global: English (US / Global standard)
 */

import { detectUserCountry, COUNTRY_PROFILES } from './geoPricing';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪', rtl: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', rtl: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', rtl: false }
];

export const TRANSLATIONS = {
  en: {
    // Nav
    home: 'Home',
    allBundles: 'All Bundles',
    categories: 'Categories',
    searchPlaceholder: 'Search 130+ viral reel niches (e.g. Fitness, AI, Luxury)...',
    myOrders: 'My Orders',
    cart: 'Cart',
    support: '24/7 Support',
    switchCountry: 'Region / Language',

    // Announcement
    announcement: 'LIMITED TIME OFFER: 2,50,000+ Ready Reels Pack at Flat 95% OFF! Instant Google Drive Access in 5 Seconds',
    endsIn: 'Ends in',

    // Hero
    heroBadge: '2,50,000+ Ready-to-Post Viral Reels',
    heroTitle1: 'Viral 1080p Full HD',
    heroTitle2: 'Reels Bundles',
    heroTitle3: 'To Explode Your Growth',
    heroSubtitle: 'Instant Google Drive Cloud Access in 5 Seconds. 100% Watermark-Free with Full Commercial & Resell Rights Included.',
    startingAt: 'Starting At Just',
    exploreCatalog: 'Explore All Bundles',
    getMasterPack: 'Get All-In-One Master Pack',
    lifetimeAccess: 'Lifetime Cloud Access & Regular Additions',
    bestsellerVault: 'ALL-IN-ONE MASTER VAULT',
    instantCloudAccess: '5-Second Cloud Unlock',

    // Special Offer
    specialOfferBadge: '🔥 SPECIAL OFFER',
    only: 'ONLY',
    gtaTitle: 'GTA 6 4K Cinematic Ultra-HD Reels Bundle',
    gtaSubtitle: 'High-octane Vice City cinematic video reels crafted for maximum views and viral engagement.',
    claimOfferNow: 'Claim Offer Now',
    driveUnlocked: 'Google Drive Unlocked Instantly',

    // Product Card
    watchPreview: 'Watch Preview',
    pausePreview: 'Pause',
    addToCart: 'Add to Cart',
    added: 'Added!',
    buyNow: 'Buy Now',
    off: 'OFF',
    hdVerticalVideo: '1080p Full HD Vertical Video',
    noWatermark: 'No Watermark',
    fullRights: 'Full Commercial Rights',
    clips: 'Clips',

    // Cart Drawer
    yourCart: 'Your Shopping Cart',
    emptyCartTitle: 'Your cart is empty',
    emptyCartDesc: 'Add some viral reels bundles to skyrocket your social growth!',
    subtotal: 'Subtotal',
    totalPayable: 'Total Payable',
    proceedToCheckout: 'Proceed to Checkout',
    clearCart: 'Clear Cart',
    secure256Bit: '100% Secure 256-Bit Encrypted Checkout',
    instantAccessGuaranteed: 'Instant Google Drive Access Guaranteed',

    // Checkout
    secureCheckoutTitle: 'Secure Checkout',
    step1Title: '1. Contact & Delivery Information',
    step2Title: '2. Payment Method',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    email: 'Email Address',
    emailPlaceholder: 'you@example.com (for instant link receipt)',
    whatsapp: 'WhatsApp Phone Number',
    whatsappPlaceholder: 'For immediate cloud folder delivery',
    countryLabel: 'Country / Region',
    stateLabel: 'State / Province',
    cityLabel: 'City',
    orderSummary: 'Order Summary',
    originalValue: 'Bundle(s) Original Value',
    promotionalDiscount: 'Store Promotional Discount',
    delivery: 'Delivery',
    freeDelivery: 'FREE (Instant Cloud)',
    continueToPayment: 'Continue to Payment',
    continueToPayPal: 'Continue to PayPal',
    backToReview: 'Back to Order Details',
    safetyNotice: '100% Official & Safe Checkout',

    // Features
    whyChooseTitle: 'Why 25,000+ Creators Trust Cheap Reels',
    feature1Title: '130+ Curated Niches',
    feature1Desc: 'From AI and Luxury to Fitness and Motivation, find vertical video packs ready to post.',
    feature2Title: 'Instant Drive Delivery',
    feature2Desc: 'Official Google Drive folder link unlocks directly on-screen and via WhatsApp in 5 seconds.',
    feature3Title: 'Full Commercial Rights',
    feature3Desc: '100% watermark-free with unrestricted commercial rights to publish and monetize.',
    feature4Title: 'Worldwide Secure Checkout',
    feature4Desc: 'Seamless payment processing with instant order fulfillment.',

    // Steps
    howItWorksTitle: 'How It Works',
    howItWorksSubtitle: 'Get viral content on your channel in 3 simple steps',
    step1Head: 'Choose Your Niche',
    step1Text: 'Browse through 130+ viral ready categories including Fitness, Luxury, Anime, Motivation, Art & more.',
    step2Head: '1-Click Secure Payment',
    step2Text: 'Pay securely using local and international payment methods with zero extra fees.',
    step3Head: 'Instant Cloud Unlock',
    step3Text: 'Get your official Google Drive download folder instantly on screen and WhatsApp right after checkout.',

    // Reviews
    reviewsTitle: 'Loved by Creators Worldwide',
    verifiedBuyer: 'Verified Creator',

    // Footer
    aboutStore: 'About Cheap Reels',
    aboutStoreText: 'The world\'s leading platform for premium 1080p full HD ready-to-post vertical video bundles. 100% watermark-free with instant Google Drive cloud link delivery.',
    paymentModesTitle: 'Supported Payment Modes',
    allRightsReserved: 'All rights reserved.'
  },

  hi: {
    home: 'होम',
    allBundles: 'सभी बंडल',
    categories: 'कैटेगरी',
    searchPlaceholder: '130+ वायरल रील्स खोजें (जैसे फिटनेस, AI, लग्जरी)...',
    myOrders: 'मेरे ऑर्डर्स',
    cart: 'कार्ट',
    support: '24/7 सहायता',
    switchCountry: 'देश / भाषा',

    announcement: 'सीमित समय ऑफर: 2,50,000+ रेडी रील्स पैक 95% छूट पर! 5 सेकंड में गूगल ड्राइव एक्सेस',
    endsIn: 'समाप्त होने में',

    heroBadge: '2,50,000+ रेडी-टू-पोस्ट वायरल रील्स',
    heroTitle1: 'वायरल 1080p फुल HD',
    heroTitle2: 'रील्स बंडल्स',
    heroTitle3: 'आपकी ग्रोथ को 10x करने के लिए',
    heroSubtitle: '5 सेकंड में गूगल ड्राइव क्लाउड एक्सेस। 100% बिना वाटरमार्क, फुल कमर्शियल और रीसेल राइट्स के साथ।',
    startingAt: 'शुरुआती कीमत सिर्फ',
    exploreCatalog: 'सभी बंडल देखें',
    getMasterPack: 'ऑल-इन-वन मास्टर पैक लें',
    lifetimeAccess: 'लाइफटाइम क्लाउड एक्सेस और नए अपडेट्स',
    bestsellerVault: 'ऑल-इन-वन मास्टर वॉल्ट',
    instantCloudAccess: '5 सेकंड में क्लाउड अनलॉक',

    specialOfferBadge: '🔥 स्पेशल ऑफर',
    only: 'सिर्फ',
    gtaTitle: 'GTA 6 4K सिनेमैटिक अल्ट्रा-HD रील्स बंडल',
    gtaSubtitle: 'वाइस सिटी के हाई-ऑक्टेन सिनेमैटिक रील्स, इंस्टाग्राम और यूट्यूब शॉर्ट्स पर वायरल होने के लिए तैयार।',
    claimOfferNow: 'अभी ऑफर क्लेम करें',
    driveUnlocked: 'गूगल ड्राइव तुरंत अनलॉक',

    watchPreview: 'प्रीव्यू देखें',
    pausePreview: 'रोकें',
    addToCart: 'कार्ट में डालें',
    added: 'जुड़ गया!',
    buyNow: 'अभी खरीदें',
    off: 'छूट',
    hdVerticalVideo: '1080p फुल HD वर्टिकल वीडियो',
    noWatermark: 'बिना वाटरमार्क',
    fullRights: 'फुल कमर्शियल राइट्स',
    clips: 'क्लिप्स',

    yourCart: 'आपकी शॉपिंग कार्ट',
    emptyCartTitle: 'आपकी कार्ट खाली है',
    emptyCartDesc: 'अपनी सोशल मीडिया ग्रोथ बढ़ाने के लिए वायरल रील्स बंडल जोड़ें!',
    subtotal: 'सबटोटल',
    totalPayable: 'कुल देय राशि',
    proceedToCheckout: 'चेकआउट के लिए आगे बढ़ें',
    clearCart: 'कार्ट खाली करें',
    secure256Bit: '100% सुरक्षित 256-बिट एन्क्रिप्टेड पेमेंट',
    instantAccessGuaranteed: 'तुरंत गूगल ड्राइव एक्सेस गारंटी',

    secureCheckoutTitle: 'सुरक्षित चेकआउट',
    step1Title: '1. संपर्क और डिलीवरी जानकारी',
    step2Title: '2. पेमेंट का तरीका चुनें',
    fullName: 'पूरा नाम',
    fullNamePlaceholder: 'अपना पूरा नाम दर्ज करें',
    email: 'ईमेल पता',
    emailPlaceholder: 'you@example.com (लिंक रसीद के लिए)',
    whatsapp: 'व्हाट्सएप फोन नंबर',
    whatsappPlaceholder: 'ड्राइव लिंक तुरंत पाने के लिए',
    countryLabel: 'देश / क्षेत्र',
    stateLabel: 'राज्य / प्रांत',
    cityLabel: 'शहर',
    orderSummary: 'ऑर्डर सारांश',
    originalValue: 'बंडल का मूल मूल्य',
    promotionalDiscount: 'स्टोर डिस्काउंट',
    delivery: 'डिलीवरी',
    freeDelivery: 'फ्री (तुरंत क्लाउड लिंक)',
    continueToPayment: 'पेमेंट के लिए आगे बढ़ें',
    continueToPayPal: 'पेमेंट जारी रखें',
    backToReview: 'ऑर्डर जानकारी पर वापस जाएं',
    safetyNotice: '100% सुरक्षित और प्रमाणित चेकआउट',

    whyChooseTitle: '25,000+ क्रिएटर्स का भरोसा',
    feature1Title: '130+ वायरल नीच',
    feature1Desc: 'फिटनेस, लग्जरी, AI और मोटिवेशन सहित हर तरह के रेडी-टू-पोस्ट वीडियो पैक।',
    feature2Title: 'तुरंत ड्राइव डिलीवरी',
    feature2Desc: 'पेमेंट के 5 सेकंड में गूगल ड्राइव लिंक स्क्रीन और व्हाट्सएप पर अनलॉक होता है।',
    feature3Title: 'फुल कमर्शियल राइट्स',
    feature3Desc: '100% वाटरमार्क-फ्री, कहीं भी पोस्ट और मोनेटाइज करने की पूरी छूट।',
    feature4Title: 'सुरक्षित पेमेंट',
    feature4Desc: 'सभी प्रमुख पेमेंट तरीकों से सुरक्षित और तेज पेमेंट।',

    howItWorksTitle: 'यह कैसे काम करता है',
    howItWorksSubtitle: 'सिर्फ 3 आसान स्टेप्स में वायरल कंटेंट पाएं',
    step1Head: 'अपनी नीच चुनें',
    step1Text: '130+ श्रेणियों में से अपने पसंदीदा रील्स बंडल को चुनें।',
    step2Head: '1-क्लिक सुरक्षित पेमेंट',
    step2Text: 'बिना किसी अतिरिक्त शुल्क के सुरक्षित पेमेंट पूरा करें।',
    step3Head: 'तुरंत क्लाउड अनलॉक',
    step3Text: 'चेकआउट के तुरंत बाद गूगल ड्राइव लिंक प्राप्त करें।',

    reviewsTitle: 'दुनिया भर के क्रिएटर्स की पसंद',
    verifiedBuyer: 'सत्यापित क्रिएटर',

    aboutStore: 'Cheap Reels के बारे में',
    aboutStoreText: 'प्रीमियम 1080p फुल HD वर्टिकल वीडियो बंडल्स के लिए दुनिया का अग्रणी प्लेटफॉर्म। 100% बिना वाटरमार्क और तुरंत गूगल ड्राइव डिलीवरी।',
    paymentModesTitle: 'स्वीकृत पेमेंट माध्यम',
    allRightsReserved: 'सर्वाधिकार सुरक्षित।'
  },

  es: {
    home: 'Inicio',
    allBundles: 'Todos los Paquetes',
    categories: 'Categorías',
    searchPlaceholder: 'Buscar en más de 130 nichos de reels virales...',
    myOrders: 'Mis Pedidos',
    cart: 'Carrito',
    support: 'Soporte 24/7',
    switchCountry: 'País / Idioma',

    announcement: 'OFERTA LIMITADA: ¡Más de 250,000 Reels listos con 95% de descuento! Acceso inmediato a Google Drive',
    endsIn: 'Termina en',

    heroBadge: '+250,000 Reels Virales Listos Para Publicar',
    heroTitle1: 'Reels Virales 1080p',
    heroTitle2: 'En Calidad Full HD',
    heroTitle3: 'Para Impulsar Tu Crecimiento',
    heroSubtitle: 'Acceso instantáneo a la nube de Google Drive en 5 segundos. 100% sin marcas de agua con derechos comerciales completos.',
    startingAt: 'Desde Solo',
    exploreCatalog: 'Explorar Todos los Paquetes',
    getMasterPack: 'Obtener Pack Maestro Todo En Uno',
    lifetimeAccess: 'Acceso de Por Vida a la Nube y Nuevas Actualizaciones',
    bestsellerVault: 'BÓVEDA MAESTRA TODO EN UNO',
    instantCloudAccess: 'Desbloqueo en 5 Segundos',

    specialOfferBadge: '🔥 OFERTA ESPECIAL',
    only: 'SOLO',
    gtaTitle: 'Paquete de Reels Cinemáticos GTA 6 4K Ultra-HD',
    gtaSubtitle: 'Reels cinemáticos de alta velocidad en Vice City listos para dominar Instagram y Shorts.',
    claimOfferNow: 'Reclamar Oferta Ahora',
    driveUnlocked: 'Google Drive Desbloqueado al Instante',

    watchPreview: 'Ver Vista Previa',
    pausePreview: 'Pausa',
    addToCart: 'Añadir al Carrito',
    added: '¡Añadido!',
    buyNow: 'Comprar Ahora',
    off: 'DESCUENTO',
    hdVerticalVideo: 'Video Vertical 1080p Full HD',
    noWatermark: 'Sin Marcas de Agua',
    fullRights: 'Derechos Comerciales Completos',
    clips: 'Clips',

    yourCart: 'Tu Carrito de Compras',
    emptyCartTitle: 'Tu carrito está vacío',
    emptyCartDesc: '¡Agrega paquetes de reels virales para disparar tu crecimiento social!',
    subtotal: 'Subtotal',
    totalPayable: 'Total a Pagar',
    proceedToCheckout: 'Proceder al Pago',
    clearCart: 'Vaciar Carrito',
    secure256Bit: 'Pago Seguro Encriptado de 256 Bits',
    instantAccessGuaranteed: 'Acceso Inmediato a Google Drive Garantizado',

    secureCheckoutTitle: 'Pago Seguro',
    step1Title: '1. Información de Contacto y Entrega',
    step2Title: '2. Método de Pago',
    fullName: 'Nombre Completo',
    fullNamePlaceholder: 'Ingresa tu nombre completo',
    email: 'Correo Electrónico',
    emailPlaceholder: 'tu@ejemplo.com (para recibir tu enlace)',
    whatsapp: 'Número de WhatsApp',
    whatsappPlaceholder: 'Para entrega directa del enlace',
    countryLabel: 'País / Región',
    stateLabel: 'Estado / Provincia',
    cityLabel: 'Ciudad',
    orderSummary: 'Resumen del Pedido',
    originalValue: 'Valor Original del Paquete',
    promotionalDiscount: 'Descuento de la Tienda',
    delivery: 'Entrega',
    freeDelivery: 'GRATIS (Enlace en la Nube)',
    continueToPayment: 'Continuar al Pago',
    continueToPayPal: 'Continuar con PayPal',
    backToReview: 'Volver a los Detalles',
    safetyNotice: 'Pago 100% Oficial y Seguro',

    whyChooseTitle: 'Más de 25,000 Creadores Confían en Nosotros',
    feature1Title: '+130 Nichos Curados',
    feature1Desc: 'Fitness, lujo, IA, motivación y mucho más listos para publicar.',
    feature2Title: 'Entrega Inmediata por Drive',
    feature2Desc: 'El enlace oficial de Google Drive se desbloquea en 5 segundos en pantalla y WhatsApp.',
    feature3Title: 'Derechos Comerciales',
    feature3Desc: '100% sin marcas de agua con libertad para monetizar donde quieras.',
    feature4Title: 'Pago Seguro Mundial',
    feature4Desc: 'Procesamiento de pagos seguro y confiable.',

    howItWorksTitle: 'Cómo Funciona',
    howItWorksSubtitle: 'Obtén contenido viral en 3 sencillos pasos',
    step1Head: 'Elige Tu Nicho',
    step1Text: 'Explora más de 130 categorías de video vertical optimizado.',
    step2Head: 'Pago Seguro en 1 Clic',
    step2Text: 'Paga de forma segura sin tarifas adicionales.',
    step3Head: 'Acceso Inmediato a la Nube',
    step3Text: 'Descarga al instante desde la carpeta oficial de Google Drive.',

    reviewsTitle: 'Amado por Creadores en Todo el Mundo',
    verifiedBuyer: 'Creador Verificado',

    aboutStore: 'Sobre Cheap Reels',
    aboutStoreText: 'La plataforma líder mundial en paquetes de videos verticales 1080p listos para publicar sin marcas de agua.',
    paymentModesTitle: 'Métodos de Pago Admitidos',
    allRightsReserved: 'Todos los derechos reservados.'
  },

  fr: {
    home: 'Accueil',
    allBundles: 'Tous les Packs',
    categories: 'Catégories',
    searchPlaceholder: 'Rechercher parmi 130+ niches de reels viraux...',
    myOrders: 'Mes Commandes',
    cart: 'Panier',
    support: 'Support 24/7',
    switchCountry: 'Pays / Langue',

    announcement: 'OFFRE LIMITÉE : 250 000+ Reels prêts avec 95% de réduction ! Accès Google Drive instantané',
    endsIn: 'Se termine dans',

    heroBadge: '250 000+ Reels Viraux Prêts à Publier',
    heroTitle1: 'Reels Viraux 1080p',
    heroTitle2: 'En Qualité Full HD',
    heroTitle3: 'Pour Booster Votre Croissance',
    heroSubtitle: 'Accès Google Drive instantané en 5 secondes. 100% sans filigrane avec droits commerciaux complets.',
    startingAt: 'À Partir de Seulement',
    exploreCatalog: 'Explorer Tous les Packs',
    getMasterPack: 'Obtenir le Master Pack Tout-en-Un',
    lifetimeAccess: 'Accès Cloud à Vie et Mises à Jour Incluses',
    bestsellerVault: 'COFFRE MASTER TOUT-EN-UN',
    instantCloudAccess: 'Déverrouillage en 5 Secondes',

    specialOfferBadge: '🔥 OFFRE SPÉCIALE',
    only: 'SEULEMENT',
    gtaTitle: 'Pack de Reels Cinématiques GTA 6 4K Ultra-HD',
    gtaSubtitle: 'Reels cinématiques époustouflants prêts à dominer Instagram et YouTube Shorts.',
    claimOfferNow: 'Profiter de l\'Offre',
    driveUnlocked: 'Google Drive Débloqué Instantanément',

    watchPreview: 'Voir l\'Aperçu',
    pausePreview: 'Pause',
    addToCart: 'Ajouter au Panier',
    added: 'Ajouté !',
    buyNow: 'Acheter Maintenant',
    off: 'DE RÉDUCTION',
    hdVerticalVideo: 'Vidéo Verticale 1080p Full HD',
    noWatermark: 'Sans Filigrane',
    fullRights: 'Droits Commerciaux Inclus',
    clips: 'Clips',

    yourCart: 'Votre Panier',
    emptyCartTitle: 'Votre panier est vide',
    emptyCartDesc: 'Ajoutez des packs de reels viraux pour faire décoller vos réseaux sociaux !',
    subtotal: 'Sous-total',
    totalPayable: 'Total à Payer',
    proceedToCheckout: 'Passer à la Caisse',
    clearCart: 'Vider le Panier',
    secure256Bit: 'Paiement Sécurisé Crypté 256 Bits',
    instantAccessGuaranteed: 'Accès Google Drive Instantané Garanti',

    secureCheckoutTitle: 'Paiement Sécurisé',
    step1Title: '1. Coordonnées et Livraison',
    step2Title: '2. Mode de Paiement',
    fullName: 'Nom Complet',
    fullNamePlaceholder: 'Entrez votre nom complet',
    email: 'Adresse E-mail',
    emailPlaceholder: 'vous@exemple.com (pour votre lien)',
    whatsapp: 'Numéro WhatsApp',
    whatsappPlaceholder: 'Pour livraison directe du lien',
    countryLabel: 'Pays / Région',
    stateLabel: 'Région / Département',
    cityLabel: 'Ville',
    orderSummary: 'Récapitulatif de Commande',
    originalValue: 'Valeur Initiale du Pack',
    promotionalDiscount: 'Remise Promotionnelle',
    delivery: 'Livraison',
    freeDelivery: 'GRATUIT (Accès Cloud)',
    continueToPayment: 'Continuer vers le Paiement',
    continueToPayPal: 'Payer avec PayPal',
    backToReview: 'Modifier les Informations',
    safetyNotice: 'Paiement 100% Officiel et Sécurisé',

    whyChooseTitle: 'Plus de 25 000 Créateurs Nous Font Confiance',
    feature1Title: '130+ Niches Populaires',
    feature1Desc: 'Fitness, luxe, IA, motivation et plus, prêts à être publiés.',
    feature2Title: 'Livraison Drive Immédiate',
    feature2Desc: 'Lien officiel débloqué en 5 secondes à l\'écran et sur WhatsApp.',
    feature3Title: 'Droits Commerciaux Complets',
    feature3Desc: '100% sans filigrane, liberté totale de monétisation.',
    feature4Title: 'Paiement International Sécurisé',
    feature4Desc: 'Paiements rapides et fiables dans le monde entier.',

    howItWorksTitle: 'Comment Ça Marche',
    howItWorksSubtitle: 'Publiez du contenu viral en 3 étapes simples',
    step1Head: 'Choisissez Votre Niche',
    step1Text: 'Parcourez plus de 130 catégories de vidéos verticales prêtes à l\'emploi.',
    step2Head: 'Paiement Sécurisé en 1 Clic',
    step2Text: 'Payez en toute sécurité sans frais cachés.',
    step3Head: 'Accès Cloud Instantané',
    step3Text: 'Accédez directement à vos fichiers sur Google Drive.',

    reviewsTitle: 'Approuvé par les Créateurs du Monde Entier',
    verifiedBuyer: 'Créateur Vérifié',

    aboutStore: 'À Propos de Cheap Reels',
    aboutStoreText: 'La plateforme de référence mondiale pour les packs de vidéos verticales 1080p sans filigrane avec accès Google Drive instantané.',
    paymentModesTitle: 'Moyens de Paiement Acceptés',
    allRightsReserved: 'Tous droits réservés.'
  },

  de: {
    home: 'Startseite',
    allBundles: 'Alle Pakete',
    categories: 'Kategorien',
    searchPlaceholder: 'Über 130 virale Reel-Nischen durchsuchen...',
    myOrders: 'Meine Bestellungen',
    cart: 'Warenkorb',
    support: '24/7 Kundenservice',
    switchCountry: 'Land / Sprache',

    announcement: 'ZEITLICH BEGRENZTES ANGEBOT: 250.000+ fertige Reels mit 95% Rabatt! Sofortiger Google Drive-Zugriff',
    endsIn: 'Endet in',

    heroBadge: '250.000+ Verzehrfertige Virale Reels',
    heroTitle1: 'Virale 1080p Full HD',
    heroTitle2: 'Reel-Pakete',
    heroTitle3: 'Für Maximales Social-Media-Wachstum',
    heroSubtitle: 'Sofortiger Google Drive Cloud-Zugriff in 5 Sekunden. 100% ohne Wasserzeichen mit vollen kommerziellen Rechten.',
    startingAt: 'Bereits Ab Nur',
    exploreCatalog: 'Alle Pakete Entdecken',
    getMasterPack: 'All-In-One Master-Paket Holen',
    lifetimeAccess: 'Lebenslanger Cloud-Zugriff & Regelmäßige Updates',
    bestsellerVault: 'ALL-IN-ONE MASTER-TRESOR',
    instantCloudAccess: 'Freischaltung in 5 Sekunden',

    specialOfferBadge: '🔥 SONDERANGEBOT',
    only: 'NUR',
    gtaTitle: 'GTA 6 4K Cinematic Ultra-HD Reel-Paket',
    gtaSubtitle: 'Hochauflösende cineastische Vice City-Reels für maximale Reichweite auf Instagram & Shorts.',
    claimOfferNow: 'Angebot Jetzt Sichern',
    driveUnlocked: 'Google Drive Sofort Freigeschaltet',

    watchPreview: 'Vorschau Ansehen',
    pausePreview: 'Pause',
    addToCart: 'In den Warenkorb',
    added: 'Hinzugefügt!',
    buyNow: 'Jetzt Kaufen',
    off: 'RABATT',
    hdVerticalVideo: '1080p Full HD Vertikales Video',
    noWatermark: 'Ohne Wasserzeichen',
    fullRights: 'Volle Kommerzielle Rechte',
    clips: 'Clips',

    yourCart: 'Ihr Warenkorb',
    emptyCartTitle: 'Ihr Warenkorb ist leer',
    emptyCartDesc: 'Fügen Sie virale Reel-Pakete hinzu, um Ihr Social-Media-Wachstum zu beschleunigen!',
    subtotal: 'Zwischensumme',
    totalPayable: 'Gesamtbetrag',
    proceedToCheckout: 'Zur Kasse Gehen',
    clearCart: 'Warenkorb Leeren',
    secure256Bit: '100% Sichere 256-Bit-Verschlüsselte Bezahlung',
    instantAccessGuaranteed: 'Sofortiger Google Drive-Zugriff Garantiert',

    secureCheckoutTitle: 'Sichere Kasse',
    step1Title: '1. Kontakt & Lieferinformationen',
    step2Title: '2. Zahlungsmethode',
    fullName: 'Vollständiger Name',
    fullNamePlaceholder: 'Vor- und Nachname eingeben',
    email: 'E-Mail-Adresse',
    emailPlaceholder: 'ihre@email.de (für den Zugangslink)',
    whatsapp: 'WhatsApp-Nummer',
    whatsappPlaceholder: 'Für direkte Zusendung des Links',
    countryLabel: 'Land / Region',
    stateLabel: 'Bundesland',
    cityLabel: 'Stadt',
    orderSummary: 'Bestellübersicht',
    originalValue: 'Ursprünglicher Paketwert',
    promotionalDiscount: 'Rabatt',
    delivery: 'Lieferung',
    freeDelivery: 'KOSTENLOS (Sofort-Cloud)',
    continueToPayment: 'Weiter zur Zahlung',
    continueToPayPal: 'Mit PayPal Bezahlen',
    backToReview: 'Zurück zur Übersicht',
    safetyNotice: '100% Offizielle & Sichere Zahlung',

    whyChooseTitle: 'Über 25.000 Creator Vertrauen Uns',
    feature1Title: '130+ Kuratierte Nischen',
    feature1Desc: 'Fitness, Luxus, KI, Motivation und mehr – sofort einsatzbereit.',
    feature2Title: 'Sofortige Drive-Lieferung',
    feature2Desc: 'Offizieller Google Drive-Link wird in 5 Sekunden freigeschaltet.',
    feature3Title: 'Kommerzielle Rechte',
    feature3Desc: 'Wasserzeichenfrei und unbegrenzt monetarisierbar.',
    feature4Title: 'Weltweit Sicher Bezahlen',
    feature4Desc: 'Reibungslose und vertrauenswürdige Zahlungsabwicklung.',

    howItWorksTitle: 'So Funktioniert Es',
    howItWorksSubtitle: 'In 3 einfachen Schritten zu viralem Content',
    step1Head: 'Nische Auswählen',
    step1Text: 'Wählen Sie aus über 130 Kategorien Ihren Wunsch-Content.',
    step2Head: '1-Klick-Sicherheitszahlung',
    step2Text: 'Bequem und ohne versteckte Gebühren bezahlen.',
    step3Head: 'Sofortiger Cloud-Zugriff',
    step3Text: 'Direkt über den Google Drive-Download-Ordner herunterladen.',

    reviewsTitle: 'Weltweit von Creatorn Geschätzt',
    verifiedBuyer: 'Verifizierter Creator',

    aboutStore: 'Über Cheap Reels',
    aboutStoreText: 'Die weltweit führende Plattform für professionelle vertikale 1080p-Videopakete ohne Wasserzeichen mit direktem Google Drive-Zugang.',
    paymentModesTitle: 'Unterstützte Zahlungsarten',
    allRightsReserved: 'Alle Rechte vorbehalten.'
  },

  ar: {
    home: 'الرئيسية',
    allBundles: 'جميع الحزم',
    categories: 'التصنيفات',
    searchPlaceholder: 'ابحث في أكثر من 130 مجال ريلز فيروسي...',
    myOrders: 'طلباتي',
    cart: 'السلة',
    support: 'دعم 24/7',
    switchCountry: 'البلد / اللغة',

    announcement: 'عرض لفترة محدودة: أكثر من 250,000 ريلز جاهزة بخصم 95%! وصول فوري إلى Google Drive',
    endsIn: 'ينتهي خلال',

    heroBadge: 'أكثر من 250,000 ريلز جاهزة للنشر',
    heroTitle1: 'ريلز فيروسية بدقة',
    heroTitle2: '1080p Full HD',
    heroTitle3: 'لمضاعفة نمو حساباتك',
    heroSubtitle: 'وصول فوري إلى سحابة Google Drive خلال 5 ثوانٍ. خالية 100% من العلامات المائية مع حقوق تجارية كاملة.',
    startingAt: 'ابتداءً من فقط',
    exploreCatalog: 'استكشف جميع الحزم',
    getMasterPack: 'احصل على الباقة الشاملة الكبرى',
    lifetimeAccess: 'وصول سحابي مدى الحياة مع تحديثات مستمرة',
    bestsellerVault: 'الخزنة الشاملة الأكثر مبيعاً',
    instantCloudAccess: 'فتح الوصول خلال 5 ثوانٍ',

    specialOfferBadge: '🔥 عرض خاص',
    only: 'فقط',
    gtaTitle: 'باقة ريلز سينمائية فائقة الدقة GTA 6 4K',
    gtaSubtitle: 'ريلز سينمائية عالية الإثارة من Vice City جاهزة للهيمنة على إنستغرام وشورتس.',
    claimOfferNow: 'احصل على العرض الآن',
    driveUnlocked: 'فتح Google Drive فوراً',

    watchPreview: 'مشاهدة المعاينة',
    pausePreview: 'إيقاف',
    addToCart: 'أضف إلى السلة',
    added: 'تمت الإضافة!',
    buyNow: 'شراء الآن',
    off: 'خصم',
    hdVerticalVideo: 'فيديو عمودي 1080p Full HD',
    noWatermark: 'بدون علامة مائية',
    fullRights: 'حقوق تجارية كاملة',
    clips: 'فيديو',

    yourCart: 'سلة المشتريات',
    emptyCartTitle: 'سلتك فارغة',
    emptyCartDesc: 'أضف باقات ريلز فيروسية لمضاعفة نمو حساباتك فوراً!',
    subtotal: 'المجموع الفرعي',
    totalPayable: 'المبلغ الإجمالي',
    proceedToCheckout: 'متابعة الدفع',
    clearCart: 'تفريغ السلة',
    secure256Bit: 'دفع آمن ومشفر بتشفير 256 بت',
    instantAccessGuaranteed: 'وصول فوري مضمون إلى Google Drive',

    secureCheckoutTitle: 'إتمام الطلب بأمان',
    step1Title: '1. معلومات الاتصال والتسليم',
    step2Title: '2. طريقة الدفع',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'أدخل اسمك الكامل',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'you@example.com (لاستلام الرابط)',
    whatsapp: 'رقم الواتساب',
    whatsappPlaceholder: 'لتسليم الرابط فوراً',
    countryLabel: 'البلد / المنطقة',
    stateLabel: 'الولاية / المقاطعة',
    cityLabel: 'المدينة',
    orderSummary: 'ملخص الطلب',
    originalValue: 'القيمة الأصلية للباقة',
    promotionalDiscount: 'خصم المتجر',
    delivery: 'التسليم',
    freeDelivery: 'مجاني (سحابي فوري)',
    continueToPayment: 'متابعة الدفع',
    continueToPayPal: 'الدفع عبر PayPal',
    backToReview: 'العودة لتفاصيل الطلب',
    safetyNotice: 'دفع رسمي وآمن 100%',

    whyChooseTitle: 'أكثر من 25,000 صانع محتوى يثقون بنا',
    feature1Title: 'أكثر من 130 مجال منوع',
    feature1Desc: 'اللياقة، الفخامة، الذكاء الاصطناعي، التحفيز والمزيد جاهزة للنشر.',
    feature2Title: 'تسليم فوري عبر Drive',
    feature2Desc: 'يتم فتح رابط Google Drive خلال 5 ثوانٍ على الشاشة وعبر الواتساب.',
    feature3Title: 'حقوق تجارية كاملة',
    feature3Desc: '100% بدون علامات مائية مع حرية كاملة في النشر والربح.',
    feature4Title: 'دفع عالمي آمن',
    feature4Desc: 'طرق دفع معتمدة وموثوقة عالمياً.',

    howItWorksTitle: 'كيف يعمل الموقع',
    howItWorksSubtitle: 'احصل على محتوى فيروسي في 3 خطوات بسيطة',
    step1Head: 'اختر مجالك',
    step1Text: 'تصفح أكثر من 130 تصنيفاً لمقاطع الفيديو العمودية.',
    step2Head: 'دفع آمن بنقرة واحدة',
    step2Text: 'ادفع بأمان وسهولة بدون أي رسوم خفية.',
    step3Head: 'وصول سحابي فوري',
    step3Text: 'حمّل فيديوهاتك مباشرة من مجلد Google Drive الرسمي.',

    reviewsTitle: 'محبوب من صناع المحتوى حول العالم',
    verifiedBuyer: 'صانع محتوى معتمد',

    aboutStore: 'عن Cheap Reels',
    aboutStoreText: 'المنصة العالمية الرائدة لباقات الفيديوهات العمودية 1080p عالية الدقة بدون علامات مائية مع تسليم فوري عبر Google Drive.',
    paymentModesTitle: 'طرق الدفع المدعومة',
    allRightsReserved: 'جميع الحقوق محفوظة.'
  },

  pt: {
    home: 'Início',
    allBundles: 'Todos os Pacotes',
    categories: 'Categorias',
    searchPlaceholder: 'Pesquise mais de 130 nichos de reels virais...',
    myOrders: 'Meus Pedidos',
    cart: 'Carrinho',
    support: 'Suporte 24/7',
    switchCountry: 'País / Idioma',

    announcement: 'OFERTA POR TEMPO LIMITADO: +250.000 Reels Prontos com 95% de Desconto! Acesso Imediato ao Google Drive',
    endsIn: 'Termina em',

    heroBadge: '+250.000 Reels Virais Prontos para Postar',
    heroTitle1: 'Reels Virais 1080p',
    heroTitle2: 'Em Qualidade Full HD',
    heroTitle3: 'Para Explodir Seu Crescimento',
    heroSubtitle: 'Acesso imediato à nuvem Google Drive em 5 segundos. 100% sem marcas d\'água com direitos comerciais completos.',
    startingAt: 'A Partir de Apenas',
    exploreCatalog: 'Explorar Todos os Pacotes',
    getMasterPack: 'Garantir Pacote Master Tudo-em-Um',
    lifetimeAccess: 'Acesso Vitalício à Nuvem e Novas Atualizações',
    bestsellerVault: 'COFRE MASTER TUDO-EM-UM',
    instantCloudAccess: 'Liberação em 5 Segundos',

    specialOfferBadge: '🔥 OFERTA ESPECIAL',
    only: 'APENAS',
    gtaTitle: 'Pacote de Reels Cinemáticos GTA 6 4K Ultra-HD',
    gtaSubtitle: 'Reels cinemáticos de alta velocidade prontos para viralizar no Instagram e YouTube Shorts.',
    claimOfferNow: 'Garantir Oferta Agora',
    driveUnlocked: 'Google Drive Liberado Imediatamente',

    watchPreview: 'Ver Prévia',
    pausePreview: 'Pausar',
    addToCart: 'Adicionar ao Carrinho',
    added: 'Adicionado!',
    buyNow: 'Comprar Agora',
    off: 'DE DESCONTO',
    hdVerticalVideo: 'Vídeo Vertical 1080p Full HD',
    noWatermark: 'Sem Marcas d\'Água',
    fullRights: 'Direitos Comerciais Inclusos',
    clips: 'Vídeos',

    yourCart: 'Seu Carrinho de Compras',
    emptyCartTitle: 'Seu carrinho está vazio',
    emptyCartDesc: 'Adicione pacotes de reels virais para acelerar o crescimento do seu perfil!',
    subtotal: 'Subtotal',
    totalPayable: 'Total a Pagar',
    proceedToCheckout: 'Finalizar Compra',
    clearCart: 'Limpar Carrinho',
    secure256Bit: 'Checkout Seguro com Criptografia de 256 Bits',
    instantAccessGuaranteed: 'Acesso Imediato ao Google Drive Garantido',

    secureCheckoutTitle: 'Checkout Seguro',
    step1Title: '1. Informações de Contato e Entrega',
    step2Title: '2. Forma de Pagamento',
    fullName: 'Nome Completo',
    fullNamePlaceholder: 'Digite seu nome completo',
    email: 'E-mail',
    emailPlaceholder: 'seu@email.com (para receber o link)',
    whatsapp: 'Número de WhatsApp',
    whatsappPlaceholder: 'Para envio imediato do link',
    countryLabel: 'País / Região',
    stateLabel: 'Estado',
    cityLabel: 'Cidade',
    orderSummary: 'Resumo do Pedido',
    originalValue: 'Valor Original do Pacote',
    promotionalDiscount: 'Desconto Promocional',
    delivery: 'Entrega',
    freeDelivery: 'GRÁTIS (Nuvem Instantânea)',
    continueToPayment: 'Continuar para Pagamento',
    continueToPayPal: 'Pagar com PayPal',
    backToReview: 'Voltar aos Detalhes',
    safetyNotice: 'Pagamento 100% Oficial e Seguro',

    whyChooseTitle: '+25.000 Criadores Confiam na Cheap Reels',
    feature1Title: '+130 Nichos Selecionados',
    feature1Desc: 'Fitness, luxo, IA, motivação e muito mais prontos para publicar.',
    feature2Title: 'Entrega Imediata no Drive',
    feature2Desc: 'Link oficial desbloqueado em 5 segundos na tela e pelo WhatsApp.',
    feature3Title: 'Direitos Comerciais Completos',
    feature3Desc: '100% sem marca d\'água, liberdade total para monetizar.',
    feature4Title: 'Checkout Global Seguro',
    feature4Desc: 'Processamento de pagamento rápido e confiável.',

    howItWorksTitle: 'Como Funciona',
    howItWorksSubtitle: 'Tenha conteúdo viral em 3 passos simples',
    step1Head: 'Escolha Seu Nicho',
    step1Text: 'Navegue por mais de 130 categorias de vídeos verticais prontos.',
    step2Head: 'Pagamento Seguro em 1 Clique',
    step2Text: 'Pague com total segurança e sem taxas adicionais.',
    step3Head: 'Acesso Imediato à Nuvem',
    step3Text: 'Baixe diretamente da pasta oficial do Google Drive.',

    reviewsTitle: 'Aprovado por Criadores no Mundo Todo',
    verifiedBuyer: 'Criador Verificado',

    aboutStore: 'Sobre a Cheap Reels',
    aboutStoreText: 'A plataforma líder mundial em pacotes de vídeos verticais 1080p sem marcas d\'água com entrega instantânea pelo Google Drive.',
    paymentModesTitle: 'Formas de Pagamento Aceitas',
    allRightsReserved: 'Todos os direitos reservados.'
  },

  ja: {
    home: 'ホーム',
    allBundles: '全バンドル',
    categories: 'カテゴリ',
    searchPlaceholder: '130以上のバイラルリールを検索...',
    myOrders: '購入履歴',
    cart: 'カート',
    support: '24時間サポート',
    switchCountry: '国 / 言語',

    announcement: '期間限定セール：250,000本以上のリールパックが95%OFF！Google Driveに5秒で即時アクセス',
    endsIn: '終了まで',

    heroBadge: '250,000本以上の投稿用バイラルリール',
    heroTitle1: 'バイラル 1080p フルHD',
    heroTitle2: 'リールバンドル',
    heroTitle3: 'SNSの成長を劇的に加速',
    heroSubtitle: 'Google Driveクラウドへ5秒で即時アクセス。透かし（ウォーターマーク）完全なし、商用利用・再販権付き。',
    startingAt: '最安価格',
    exploreCatalog: 'すべてのバンドルを見る',
    getMasterPack: 'オールインワン・マスターパックを入手',
    lifetimeAccess: '生涯クラウドアクセス＆無料アップデート',
    bestsellerVault: 'ベストセラー・マスター保管庫',
    instantCloudAccess: '5秒で即時クラウド解除',

    specialOfferBadge: '🔥 特別オファー',
    only: '限定',
    gtaTitle: 'GTA 6 4K シネマティック Ultra-HD リールバンドル',
    gtaSubtitle: 'InstagramやShortsで圧倒的な再生数を獲得できる迫力のシネマティック映像。',
    claimOfferNow: '今すぐ特典を適用',
    driveUnlocked: 'Google Drive即時アンロック',

    watchPreview: 'プレビューを見る',
    pausePreview: '一時停止',
    addToCart: 'カートに追加',
    added: '追加完了！',
    buyNow: '今すぐ購入',
    off: 'OFF',
    hdVerticalVideo: '1080p フルHD 縦型動画',
    noWatermark: 'ウォーターマークなし',
    fullRights: '商用利用権付き',
    clips: 'クリップ',

    yourCart: 'ショッピングカート',
    emptyCartTitle: 'カートは空です',
    emptyCartDesc: 'バイラルリールバンドルを追加して、SNSのフォロワーを急増させましょう！',
    subtotal: '小計',
    totalPayable: '合計支払額',
    proceedToCheckout: '購入手続きへ進む',
    clearCart: 'カートを空にする',
    secure256Bit: '256ビット暗号化による安心安全な決済',
    instantAccessGuaranteed: 'Google Drive即時アクセス保証',

    secureCheckoutTitle: '安全なチェックアウト',
    step1Title: '1. お客様情報と受け取り先',
    step2Title: '2. お支払い方法',
    fullName: '氏名',
    fullNamePlaceholder: 'お名前を入力してください',
    email: 'メールアドレス',
    emailPlaceholder: 'you@example.com（受信用）',
    whatsapp: '電話番号 / WhatsApp',
    whatsappPlaceholder: '即時アクセスのご案内用',
    countryLabel: '国 / 地域',
    stateLabel: '都道府県',
    cityLabel: '市区町村',
    orderSummary: 'ご注文内容',
    originalValue: '定価合計',
    promotionalDiscount: '特別割引',
    delivery: 'お届け方法',
    freeDelivery: '無料（即時クラウド配信）',
    continueToPayment: 'お支払いへ進む',
    continueToPayPal: 'PayPalでお支払い',
    backToReview: '内容確認に戻る',
    safetyNotice: '100%安全で公式な決済',

    whyChooseTitle: '世界25,000人以上のクリエイターが愛用',
    feature1Title: '130以上の厳選ジャンル',
    feature1Desc: 'フィットネス、ラグジュアリー、AI、モチベーションなど即投稿可能なパック。',
    feature2Title: 'Drive即時配信',
    feature2Desc: '決済完了後、5秒以内に画面とメール/WhatsAppでフォルダが開きます。',
    feature3Title: '完全商用利用可能',
    feature3Desc: 'ウォーターマークなしで、自由に投稿・収益化が可能です。',
    feature4Title: 'グローバル安心決済',
    feature4Desc: '安全で確実な国際決済に対応しています。',

    howItWorksTitle: 'ご利用の流れ',
    howItWorksSubtitle: '3つの簡単なステップでバイラルコンテンツを入手',
    step1Head: 'ジャンルを選択',
    step1Text: '130以上のカテゴリから好きな動画パックを選びます。',
    step2Head: '1クリック安全決済',
    step2Text: '手数料なしで安全にお支払いを完了します。',
    step3Head: 'クラウド即時解除',
    step3Text: 'Google Driveからすぐにダウンロードできます。',

    reviewsTitle: '世界中のクリエイターから高評価',
    verifiedBuyer: '認証クリエイター',

    aboutStore: 'Cheap Reelsについて',
    aboutStoreText: '透かしなし・1080p高品質縦型動画パックの世界最高峰プラットフォーム。Google Driveによる即時配信を提供します。',
    paymentModesTitle: '対応お支払い方法',
    allRightsReserved: 'All rights reserved.'
  },

  ru: {
    home: 'Главная',
    allBundles: 'Все Наборы',
    categories: 'Категории',
    searchPlaceholder: 'Поиск среди 130+ вирусных ниш рилс...',
    myOrders: 'Мои Заказы',
    cart: 'Корзина',
    support: 'Поддержка 24/7',
    switchCountry: 'Страна / Язык',

    announcement: 'ОГРАНИЧЕННОЕ ПРЕДЛОЖЕНИЕ: 250 000+ готовых Reels со скидкой 95%! Мгновенный доступ к Google Drive',
    endsIn: 'Заканчивается через',

    heroBadge: '250 000+ Готовых к Публикации Вирусных Reels',
    heroTitle1: 'Вирусные Reels 1080p',
    heroTitle2: 'В Качестве Full HD',
    heroTitle3: 'Для Взрывного Роста Охвата',
    heroSubtitle: 'Мгновенный доступ к облаку Google Drive за 5 секунд. 100% без водяных знаков с полными коммерческими правами.',
    startingAt: 'Всего От',
    exploreCatalog: 'Смотреть Все Наборы',
    getMasterPack: 'Получить Мастер-Пак Все-в-Одном',
    lifetimeAccess: 'Пожизненный Доступ и Регулярные Обновления',
    bestsellerVault: 'ГЛАВНОЕ ХРАНИЛИЩЕ ВСЕ-В-ОДНОМ',
    instantCloudAccess: 'Доступ за 5 Секунд',

    specialOfferBadge: '🔥 СПЕЦПРЕДЛОЖЕНИЕ',
    only: 'ТОЛЬКО',
    gtaTitle: 'Набор Кинематографичных Reels GTA 6 4K Ultra-HD',
    gtaSubtitle: 'Эпичные кинематографичные ролики Vice City для взрывного роста просмотров в Instagram и Shorts.',
    claimOfferNow: 'Забрать Предложение',
    driveUnlocked: 'Google Drive Открывается Мгновенно',

    watchPreview: 'Предпросмотр',
    pausePreview: 'Пауза',
    addToCart: 'В Корзину',
    added: 'Добавлено!',
    buyNow: 'Купить Сейчас',
    off: 'СКИДКА',
    hdVerticalVideo: 'Вертикальное Видео 1080p Full HD',
    noWatermark: 'Без Водяных Знаков',
    fullRights: 'Коммерческие Права',
    clips: 'Клипов',

    yourCart: 'Ваша Корзина',
    emptyCartTitle: 'Ваша корзина пуста',
    emptyCartDesc: 'Добавьте наборы вирусных рилс, чтобы взорвать охваты ваших соцсетей!',
    subtotal: 'Подытог',
    totalPayable: 'Итого к Оплате',
    proceedToCheckout: 'Перейти к Оплате',
    clearCart: 'Очистить Корзину',
    secure256Bit: '100% Безопасная Оплата с 256-битным Шифрованием',
    instantAccessGuaranteed: 'Мгновенный Доступ к Google Drive Гарантирован',

    secureCheckoutTitle: 'Безопасное Оформление',
    step1Title: '1. Контактные Данные и Доставка',
    step2Title: '2. Способ Оплаты',
    fullName: 'Полное Имя',
    fullNamePlaceholder: 'Введите ваше имя',
    email: 'Электронная Почта',
    emailPlaceholder: 'you@example.com (для отправки ссылки)',
    whatsapp: 'Номер WhatsApp / Телефон',
    whatsappPlaceholder: 'Для мгновенной доставки ссылки',
    countryLabel: 'Страна / Регион',
    stateLabel: 'Регион / Область',
    cityLabel: 'Город',
    orderSummary: 'Детали Заказа',
    originalValue: 'Начальная Стоимость',
    promotionalDiscount: 'Скидка Магазина',
    delivery: 'Доставка',
    freeDelivery: 'БЕСПЛАТНО (Облачный Доступ)',
    continueToPayment: 'Перейти к Оплате',
    continueToPayPal: 'Оплатить через PayPal',
    backToReview: 'Назад к Заказу',
    safetyNotice: '100% Официальная и Безопасная Оплата',

    whyChooseTitle: 'Более 25 000 Авторов Доверяют Нам',
    feature1Title: '130+ Отобранных Ниш',
    feature1Desc: 'Фитнес, роскошь, ИИ, мотивация и многое другое, готовое к публикации.',
    feature2Title: 'Мгновенная Доставка в Drive',
    feature2Desc: 'Ссылка на Google Drive открывается за 5 секунд на экране и в мессенджере.',
    feature3Title: 'Коммерческие Права',
    feature3Desc: 'Без водяных знаков и с возможностью свободной монетизации.',
    feature4Title: 'Безопасная Оплата по Всему Миру',
    feature4Desc: 'Надежные и проверенные международные платежи.',

    howItWorksTitle: 'Как Это Работает',
    howItWorksSubtitle: 'Получите вирусный контент за 3 простых шага',
    step1Head: 'Выберите Нишу',
    step1Text: 'Просмотрите более 130 категорий вертикальных видео.',
    step2Head: 'Быстрая Безопасная Оплата',
    step2Text: 'Оплатите заказ без скрытых комиссий.',
    step3Head: 'Мгновенный Доступ',
    step3Text: 'Скачивайте материалы напрямую из папки Google Drive.',

    reviewsTitle: 'Выбор Авторов по Всему Миру',
    verifiedBuyer: 'Проверенный Автор',

    aboutStore: 'О Cheap Reels',
    aboutStoreText: 'Ведущая мировая платформа вертикальных видеопаков 1080p без водяных знаков с мгновенным доступом к Google Drive.',
    paymentModesTitle: 'Способы Оплаты',
    allRightsReserved: 'Все права защищены.'
  }
};

/**
 * Detect User Language based on country or browser preferences
 */
export function detectUserLanguage() {
  if (typeof window === 'undefined') return 'en';

  try {
    // 1. URL parameter (?lang=es, ?lang=hi, etc.)
    const urlParams = new URLSearchParams(window.location.search);
    const qLang = (urlParams.get('lang') || '').toLowerCase();
    if (qLang && SUPPORTED_LANGUAGES.some(l => l.code === qLang)) {
      return qLang;
    }

    // 2. Saved user preference
    const saved = localStorage.getItem('cheap_reels_user_lang');
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      return saved;
    }

    // 3. Country-profile default language
    const country = detectUserCountry();
    const profile = COUNTRY_PROFILES.find(p => p.code === country);
    if (profile && profile.lang && SUPPORTED_LANGUAGES.some(l => l.code === profile.lang)) {
      return profile.lang;
    }

    // 4. Browser navigator language
    const navLang = (navigator.language || navigator.languages?.[0] || 'en').slice(0, 2).toLowerCase();
    if (SUPPORTED_LANGUAGES.some(l => l.code === navLang)) {
      return navLang;
    }

    return 'en';
  } catch (e) {
    return 'en';
  }
}

/**
 * Get translation for a key in the current language
 */
export function t(key, lang = null) {
  const activeLang = lang || (typeof window !== 'undefined' ? (window.__CHEAP_REELS_LANG__ || detectUserLanguage()) : 'en');
  const dict = TRANSLATIONS[activeLang] || TRANSLATIONS.en;
  return dict[key] !== undefined ? dict[key] : (TRANSLATIONS.en[key] || key);
}

/**
 * Change Language Manually
 */
export function setLanguage(langCode) {
  if (typeof window === 'undefined') return;
  try {
    const match = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    if (match) {
      window.__CHEAP_REELS_LANG__ = match.code;
      localStorage.setItem('cheap_reels_user_lang', match.code);

      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('lang')) {
          url.searchParams.delete('lang');
          window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        }
      } catch (e) {}
      
      // Update HTML dir for RTL (Arabic)
      if (document.documentElement) {
        document.documentElement.setAttribute('lang', match.code);
        document.documentElement.setAttribute('dir', match.rtl ? 'rtl' : 'ltr');
      }

      window.dispatchEvent(new CustomEvent('language_changed', { detail: match }));
    }
  } catch (e) {}
}
