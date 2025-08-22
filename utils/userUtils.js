// Utilitaires pour la gestion des utilisateurs

export const generateGuestUsername = () => {
  const randomNumbers = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `user_${randomNumbers}`;
};

export const createGuestUser = () => {
  return {
    id: Date.now().toString(),
    username: generateGuestUsername(),
    email: null,
    isGuest: true,
    createdAt: new Date().toISOString(),
    settings: {
      notifications: true,
      soundEnabled: true,
      vibrationEnabled: true,
    },
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalPlayTime: 0,
      highScore: 0,
    },
    achievements: [],
  };
};

export const createRegisteredUser = (email, username) => {
  return {
    id: Date.now().toString(),
    username: username,
    email: email,
    isGuest: false,
    createdAt: new Date().toISOString(),
    settings: {
      notifications: true,
      soundEnabled: true,
      vibrationEnabled: true,
    },
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalPlayTime: 0,
      highScore: 0,
    },
    achievements: [],
  };
};

export const updateUserStats = (user, gameResult) => {
  return {
    ...user,
    stats: {
      ...user.stats,
      gamesPlayed: user.stats.gamesPlayed + 1,
      gamesWon: gameResult.won ? user.stats.gamesWon + 1 : user.stats.gamesWon,
      totalPlayTime: user.stats.totalPlayTime + gameResult.playTime,
      highScore: Math.max(user.stats.highScore, gameResult.score),
    },
  };
};

export const unlockAchievement = (user, achievementId) => {
  if (user.achievements.includes(achievementId)) {
    return user;
  }
  
  return {
    ...user,
    achievements: [...user.achievements, achievementId],
  };
};
