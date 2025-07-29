// Convertisseur automatique de références publiques vers codes internes
export const referenceConverter = {
  // Homme (basé sur les vraies données de parfumsHomme.js)
  'DSH-001': '1',     // One Million
  'DSH-002': '2',     // Acqua Di Gio  
  'DSH-003': '3',     // Fahrenheit
  'DSH-004': '4',     // The One
  'DSH-005': '205',   // Hugo
  'DSH-006': '12',    // Eau Sauvage
  'DSH-007': '15',    // Roma
  'DSH-008': '16',    // Le Male
  'DSH-009': '217',   // Guilty
  'DSH-010': '18',    // Déclaration
  'DSH-011': '20',    // La Nuit de l'Homme
  'DSH-012': '21',    // Light Blue
  'DSH-013': '22',    // Terre d'Hermès
  'DSH-014': '30',    // Black XS
  'DSH-015': '32',    // Spice Bomb
  'DSH-016': '33',    // Black Code
  'DSH-017': '37',    // Man
  'DSH-018': '38',    // Bleu
  'DSH-019': '48',    // Allure Homme
  'DSH-020': '250',   // Burberry for Men
  'DSH-021': '52',    // Pasha 150
  'DSH-022': '61',    // Invictus
  'DSH-023': '62',    // Intenso
  'DSH-024': '265',   // The Scent
  'DSH-025': '69',    // Acqua di Sale
  'DSH-026': '79',    // MYSLF
  'DSH-027': '283',   // Uomo
  'DSH-028': '84',    // Dylan Blue
  'DSH-029': '86',    // Legend
  'DSH-030': '87',    // Wanted
  'DSH-031': '88',    // Man in Black
  'DSH-032': '91',    // Chrome
  'DSH-033': '292',   // Mr. Burberry
  'DSH-034': '140',   // Eros

  // Femme (basé sur les vraies données de parfumsFemme.js)  
  'DSF-001': '6',     // OPIUM
  'DSF-002': '7',     // J'ADORE
  'DSF-003': '10',    // ALIEN
  'DSF-004': '11',    // LIGHT BLUE
  'DSF-005': '213',   // GUILTY
  'DSF-006': '14',    // MANIFESTO
  'DSF-007': '19',    // LADY MILLION
  'DSF-008': '23',    // HYPNOTIC POISON
  'DSF-009': '24',    // CHANEL N°5
  'DSF-010': '25',    // FOR HER
  'DSF-011': '26',    // FLOWER
  'DSF-012': '27',    // TRÉSOR
  'DSF-013': '28',    // ANGEL
  'DSF-014': '30',    // L'EAU D'ISSEY
  'DSF-015': '29',    // MISS DIOR CHÉRIE
  'DSF-016': '40',    // HYPNOSE
  'DSF-017': '241',   // CHLOE
  'DSF-018': '242',   // LA VIE EST BELLE
  'DSF-019': '243',   // LOVE CHLOE
  'DSF-020': '47',    // CRYSTAL NOIR
  'DSF-021': '49',    // DOLCE
  'DSF-022': '51',    // COCO MADEMOISELLE
  'DSF-023': '52',    // NARCISO
  'DSF-024': '53',    // BLACK OPIUM
  'DSF-025': '56',    // ANGE OU DEMON
  'DSF-026': '57',    // OMNIA AMETHYSTE
  'DSF-027': '263',   // HUGO
  'DSF-028': '64',    // OMNIA INDIAN GARNET
  'DSF-029': '67',    // OLYMPEA
  'DSF-030': '70',    // THE ONE
  'DSF-031': '71',    // ALLURE
  'DSF-032': '72',    // ACQUA DI GIOIA
  'DSF-033': '277',   // FLORA
  'DSF-034': '73',    // SI
  'DSF-035': '81',    // CLASSIQUE ESSENCE
  'DSF-036': '82',    // SIGNORINA
  'DSF-037': '84',    // CHANCE
  'DSF-038': '85',    // MON PARIS
  'DSF-039': '86',    // POISON GIRL
  'DSF-040': '295',   // BURBERRY WOMEN
  'DSF-041': '97',    // GABRIELLE
  'DSF-042': '98',    // AMO
  'DSF-043': '99',    // JOY
  'DSF-044': '115',   // IDOLE
  'DSF-045': '116',   // YES I AM
  'DSF-046': '119',   // SCANDAL
  'DSF-047': '120',   // LA PETITE ROBE NOIRE
  'DSF-048': '121',   // L'INTERDIT
  'DSF-049': '133',   // PARADOXE
  'DSF-050': '145',   // DEVOTION

  // Mixte
  'DSM-001': '246',  // CK ONE
  'DSM-002': '54',   // BLACK ORCHID
  'DSM-003': '72',   // PATCHOULI
  'DSM-004': '100',  // WHITE AOUD
  'DSM-005': '105',  // INTENSE CAFE

  // Luxe
  'DSL-001': '93',   // AVENTUS FOR HER
  'DSL-002': '122',  // LIBRE
  'DSL-003': '131',  // GOOD GIRL
  'DSL-004': '132',  // MY WAY
  'DSL-005': '68',   // AVENTUS
  'DSL-006': '94',   // SAUVAGE
  'DSL-007': '113',  // SUR LA ROUTE
  'DSL-008': '136',  // DIOR HOMME INTENSE
  'DSL-009': '44',   // SILVER MOUNTAIN
  'DSL-010': '73',   // HIMALAYA
  'DSL-011': '99',   // MANDARINO DI AMALFI
  'DSL-012': '110',  // KIRKE
  'DSL-013': '114',  // OMBRE NOMADE
  'DSL-014': '135',  // BOIS D'ARGENT
  'DSL-015': '142',  // OMBRE LEATHER

  // Luxury
  'DSX-001': '109',  // J'ADORE L'OR
  'DSX-002': '123',  // GOOD GIRL GONE BAD
  'DSX-003': '74',   // BLACK AFGANO
  'DSX-004': '75',   // X FOR MEN
  'DSX-005': '101',  // VELVET AMBER SKIN
  'DSX-006': '102',  // VELVET AMBER SUN
  'DSX-007': '106',  // FUCKING FABULOUS
  'DSX-008': '111',  // LOST CHERRY
  'DSX-009': '112',  // NEROLI PORTOFINO
  'DSX-010': '117',  // TOBACCO VANILLE
  'DSX-011': '124',  // BACCARAT ROUGE 540
  'DSX-012': '125',  // ZETA
  'DSX-013': '126',  // SOLE DI POSITANO ACQUA
  'DSX-014': '127',  // SOLEIL BLANC
  'DSX-015': '128',  // OUD WOOD
  'DSX-016': '129',  // VANILLE FATALE
  'DSX-017': '130',  // ERBA PURA
  'DSX-018': '137',  // MEGAMARE
  'DSX-019': '138',  // BITTER PEACH
  'DSX-020': '139',  // XJ 1861NAXOS
  'DSX-021': '140',  // WOOD WHISPER
  'DSX-022': '141',  // LES SABLES ROSES
  'DSX-023': '143',  // TURATH
  'DSX-024': '144',  // VANILLA POWDER
  'DSX-025': '145',  // BIANCO LATTE

  // Enfant
  'DSE-001': '045',  // Garçon
  'DSE-002': '058',  // Fille
  'DSE-003': '059',  // Bébé

  // Création
  'DSC-001': 'EVENT23W', // Séduction
  'DSC-002': 'EVENT23M', // Mystère
  'DSC-003': 'EVENT22',  // Epicé boisé
  'DSC-004': 'MULTIVERSE', // Epicé boisé
  'DSC-005': 'ASTRAL24', // Fruité frais

  // Étuis
  'DST-001': 'TCOV001', // Étui Vagues Violet
  'DST-002': 'TCOV004', // Étui Cœurs Rouge
  'DST-003': 'TCOV005', // Étui Chevrons Turquoise
  'DST-004': 'TCOV006', // Étui Losanges Doré
};

// Fonction pour convertir une référence publique en code interne
export const convertToInternalRef = (publicRef) => {
  return referenceConverter[publicRef] || publicRef;
};

// Fonction pour convertir un message complet
export const convertMessageToInternal = (message) => {
  let convertedMessage = message;
  
  // Remplacer toutes les références publiques par les codes internes
  Object.keys(referenceConverter).forEach(publicRef => {
    const internalRef = referenceConverter[publicRef];
    const regex = new RegExp(`Référence: ${publicRef}`, 'g');
    convertedMessage = convertedMessage.replace(regex, `Référence: ${internalRef}`);
  });
  
  return convertedMessage;
};
