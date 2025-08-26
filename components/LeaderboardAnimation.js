import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  TouchableOpacity
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AnimatedButton } from './AnimatedButton';

const { width, height } = Dimensions.get('window');

const LeaderboardAnimation = ({ players, onClose, gameStats }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [animationValue] = useState(new Animated.Value(0));
  const [playerAnimations] = useState(
    players.map(() => new Animated.Value(0))
  );
  const [showAnimation, setShowAnimation] = useState(false);

  const styles = createStyles(theme);

  // Trier les joueurs par score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = async () => {
    setShowAnimation(true);

    // Animation d'entrée du panneau
    Animated.spring(animationValue, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Animation en cascade des joueurs
    const animatePlayer = (index) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          Animated.spring(playerAnimations[index], {
            toValue: 1,
            tension: 120,
            friction: 7,
            useNativeDriver: true,
          }).start(resolve);
        }, index * 300);
      });
    };

    // Animer chaque joueur un par un
    for (let i = 0; i < sortedPlayers.length; i++) {
      await animatePlayer(i);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🏆';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Or
      case 2:
        return '#C0C0C0'; // Argent
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPodiumHeight = (rank) => {
    switch (rank) {
      case 1:
        return 120;
      case 2:
        return 100;
      case 3:
        return 80;
      default:
        return 60;
    }
  };

  if (!showAnimation) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: animationValue,
            transform: [
              {
                scale: animationValue,
              },
            ],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🏁 {t('gameResults') || 'Résultats de la partie'}</Text>
          <Text style={styles.subtitle}>
            {t('finalRanking') || 'Classement final'}
          </Text>
        </View>

        {/* Podium pour le top 3 */}
        {sortedPlayers.length >= 3 && (
          <View style={styles.podiumContainer}>
            {/* 2ème place */}
            <Animated.View
              style={[
                styles.podiumPlayer,
                {
                  opacity: playerAnimations[1],
                  transform: [
                    {
                      translateY: playerAnimations[1].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[styles.podiumStep, { height: getPodiumHeight(2) }]}>
                <Text style={styles.podiumRank}>🥈</Text>
                <Text style={styles.podiumScore}>{sortedPlayers[1].score}</Text>
              </View>
              <PlayerCard player={sortedPlayers[1]} rank={2} compact />
            </Animated.View>

            {/* 1ère place */}
            <Animated.View
              style={[
                styles.podiumPlayer,
                {
                  opacity: playerAnimations[0],
                  transform: [
                    {
                      translateY: playerAnimations[0].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[styles.podiumStep, { height: getPodiumHeight(1) }]}>
                <Text style={styles.podiumRank}>🏆</Text>
                <Text style={styles.podiumScore}>{sortedPlayers[0].score}</Text>
              </View>
              <PlayerCard player={sortedPlayers[0]} rank={1} compact />
            </Animated.View>

            {/* 3ème place */}
            <Animated.View
              style={[
                styles.podiumPlayer,
                {
                  opacity: playerAnimations[2],
                  transform: [
                    {
                      translateY: playerAnimations[2].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[styles.podiumStep, { height: getPodiumHeight(3) }]}>
                <Text style={styles.podiumRank}>🥉</Text>
                <Text style={styles.podiumScore}>{sortedPlayers[2].score}</Text>
              </View>
              <PlayerCard player={sortedPlayers[2]} rank={3} compact />
            </Animated.View>
          </View>
        )}

        {/* Liste complète des joueurs */}
        <View style={styles.leaderboardList}>
          {sortedPlayers.map((player, index) => (
            <Animated.View
              key={player.id}
              style={[
                styles.playerRow,
                {
                  opacity: playerAnimations[index],
                  transform: [
                    {
                      translateX: playerAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <PlayerCard 
                player={player} 
                rank={index + 1} 
                detailed 
                gameStats={gameStats}
              />
            </Animated.View>
          ))}
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionButtons}>
          <AnimatedButton
            style={[styles.button, styles.closeButton]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>
              {t('continue') || 'Continuer'}
            </Text>
          </AnimatedButton>
        </View>
      </Animated.View>
    </View>
  );
};

// Composant pour afficher un joueur
const PlayerCard = ({ player, rank, compact = false, detailed = false, gameStats }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🏆';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank.toString();
    }
  };

  return (
    <View style={[styles.playerCard, compact && styles.playerCardCompact]}>
      <View style={styles.playerInfo}>
        <View style={[styles.rankContainer, { backgroundColor: getRankColor(rank) }]}>
          <Text style={styles.rankText}>{getRankIcon(rank)}</Text>
        </View>
        
        <View style={styles.playerDetails}>
          {player.profileImage ? (
            <Image source={{ uri: player.profileImage }} style={styles.playerAvatar} />
          ) : (
            <View style={styles.defaultPlayerAvatar}>
              <Text style={styles.defaultPlayerText}>
                {player.username ? player.username.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          
          <View style={styles.playerTextInfo}>
            <Text style={styles.playerName} numberOfLines={1}>
              {player.username}
            </Text>
            {detailed && (
              <Text style={styles.playerStats}>
                WPM: {player.wpm || 0} • Précision: {player.accuracy || 0}%
              </Text>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{player.score}</Text>
        <Text style={styles.scoreLabel}>points</Text>
      </View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    maxWidth: width * 0.95,
    maxHeight: height * 0.9,
    width: '95%',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 20,
    height: 160,
  },
  podiumPlayer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  podiumStep: {
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 10,
  },
  podiumRank: {
    fontSize: 20,
    marginBottom: 5,
  },
  podiumScore: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  leaderboardList: {
    maxHeight: 300,
  },
  playerRow: {
    marginBottom: 10,
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  playerCardCompact: {
    padding: 10,
    minWidth: 100,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  playerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  defaultPlayerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  defaultPlayerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  playerTextInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  playerStats: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  scoreLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  actionButtons: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 120,
  },
  closeButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LeaderboardAnimation;
