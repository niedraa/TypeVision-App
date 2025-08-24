// Données des mondes et niveaux pour le mode histoire
export const gameData = {
  worlds: {
    volcanic: {
      id: 'volcanic',
      name: 'Monde Volcanique',
      icon: '🌋',
      color: '#FF6B35',
      description: 'Tapez rapidement avant que la lave ne vous rattrape !',
      levels: [
        {
          id: 1,
          name: 'Cratère Débutant',
          text: 'Le volcan gronde sous nos pieds tandis que la lave coule lentement vers la vallée. Les flammes dansent dans la nuit étoilée et illuminent le cratère rocheux de leur éclat orange.',
          difficulty: 'Facile',
          targetWPM: 20,
          maxErrors: 3,
        },
        {
          id: 2,
          name: 'Coulée de Lave',
          text: 'Les flammes dansent dans la nuit étoilée. Le magma brûlant illumine le cratère rocheux.',
          difficulty: 'Facile',
          targetWPM: 25,
          maxErrors: 2,
        },
        {
          id: 3,
          name: 'Éruption Majeure',
          text: 'Une explosion retentissante secoue la montagne. Des roches incandescentes pleuvent du ciel fumant.',
          difficulty: 'Moyen',
          targetWPM: 30,
          maxErrors: 2,
        },
        {
          id: 4,
          name: 'Forge Volcanique',
          text: 'La température extrême déforme les métaux précieux. Les artisans travaillent malgré la chaleur suffocante.',
          difficulty: 'Moyen',
          targetWPM: 35,
          maxErrors: 1,
        },
        {
          id: 5,
          name: 'Maître du Feu',
          text: 'Domptez les flammes éternelles du cœur volcanique. Seuls les plus rapides survivront à cette épreuve ultime.',
          difficulty: 'Difficile',
          targetWPM: 40,
          maxErrors: 0,
        },
      ],
    },
    aquatic: {
      id: 'aquatic',
      name: 'Monde Aquatique',
      icon: '🌊',
      color: '#4FC3F7',
      description: 'Nagez à travers les mots dans les profondeurs océaniques.',
      levels: [
        {
          id: 'aquatic_1',
          name: 'Lagon Tranquille',
          text: 'Les vagues caressent doucement le rivage sablonneux. Les poissons colorés nagent paisiblement.',
          difficulty: 'Facile',
          targetWPM: 22,
          maxErrors: 3,
        },
        {
          id: 'aquatic_2',
          name: 'Récif Corallien',
          text: 'Les coraux multicolores abritent une vie marine extraordinaire. Les dauphins jouent entre les algues ondulantes.',
          difficulty: 'Facile',
          targetWPM: 27,
          maxErrors: 2,
        },
        {
          id: 'aquatic_3',
          name: 'Courants Profonds',
          text: 'Les courants marins transportent les navigateurs vers des horizons inconnus. Les baleines chantent leurs mélodies mystérieuses.',
          difficulty: 'Moyen',
          targetWPM: 32,
          maxErrors: 2,
        },
        {
          id: 'aquatic_4',
          name: 'Tempête Océanique',
          text: 'Les vagues titanesques déferlent sur le navire courageux. Les marins luttent contre les éléments déchaînés.',
          difficulty: 'Moyen',
          targetWPM: 37,
          maxErrors: 1,
        },
        {
          id: 'aquatic_5',
          name: 'Abysses Mystérieux',
          text: 'Dans les profondeurs insondables, les créatures bioluminescentes illuminent l obscurité éternelle des abysses océaniques.',
          difficulty: 'Difficile',
          targetWPM: 42,
          maxErrors: 0,
        },
      ],
    },
    cloudy: {
      id: 'cloudy',
      name: 'Monde Nuageux',
      icon: '☁️',
      color: '#9E9E9E',
      description: 'Volez parmi les nuages en tapant avec précision.',
      levels: [
        {
          id: 'cloudy_1',
          name: 'Nuage Cotonneux',
          text: 'Les nuages blancs flottent paisiblement dans le ciel azur. Le vent doux murmure des secrets.',
          difficulty: 'Facile',
          targetWPM: 24,
          maxErrors: 3,
        },
        {
          id: 'cloudy_2',
          name: 'Cumulus Dansant',
          text: 'Les formations nuageuses changent constamment de forme. Les oiseaux migrateurs tracent leur route céleste.',
          difficulty: 'Facile',
          targetWPM: 29,
          maxErrors: 2,
        },
        {
          id: 'cloudy_3',
          name: 'Orage Électrique',
          text: 'Les éclairs zèbrent le ciel sombre et menaçant. Le tonnerre résonne à travers les vallées montagneuses.',
          difficulty: 'Moyen',
          targetWPM: 34,
          maxErrors: 2,
        },
        {
          id: 'cloudy_4',
          name: 'Tornade Céleste',
          text: 'Le vent tourbillonnant soulève tout sur son passage. Les nuages spiralent dans une danse apocalyptique.',
          difficulty: 'Moyen',
          targetWPM: 39,
          maxErrors: 1,
        },
        {
          id: 'cloudy_5',
          name: 'Maître des Cieux',
          text: 'Dominez les éléments atmosphériques dans cette épreuve finale. Seule la perfection vous mènera à la victoire céleste.',
          difficulty: 'Difficile',
          targetWPM: 45,
          maxErrors: 0,
        },
      ],
    },
  },
};

// Fonctions utilitaires pour le jeu
export const gameUtils = {
  // Calculer les mots par minute
  calculateWPM: (text, timeInSeconds) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = timeInSeconds / 60;
    return Math.round(words / minutes);
  },

  // Calculer la précision
  calculateAccuracy: (totalChars, errors) => {
    if (totalChars === 0) return 100;
    return Math.round(((totalChars - errors) / totalChars) * 100);
  },

  // Calculer les étoiles (1-3) basé sur la performance
  getStars: (wpm, targetWPM, errors, maxErrors) => {
    if (errors > maxErrors) return 0;
    if (wpm >= targetWPM * 1.5) return 3;
    if (wpm >= targetWPM * 1.2) return 2;
    if (wpm >= targetWPM) return 1;
    return 0;
  },

  // Vérifier si le niveau est réussi
  isLevelCompleted: (wpm, errors, targetWPM, maxErrors) => {
    return wpm >= targetWPM && errors <= maxErrors;
  },

  // Débloquer le niveau suivant
  unlockNextLevel: (currentLevelId, worldId) => {
    const world = gameData.worlds[worldId];
    const currentIndex = world.levels.findIndex(level => level.id === currentLevelId);
    
    if (currentIndex >= 0 && currentIndex < world.levels.length - 1) {
      return world.levels[currentIndex + 1].id;
    }
    
    return null; // Dernier niveau du monde
  },
};
