import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { gameData } from '../data/gameData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TypingGameScreen from './TypingGameScreen';
import LevelPrepScreen from './LevelPrepScreen';

const { width, height } = Dimensions.get('window');

const WorldLevelsScreen = ({ worldId, onBack }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelProgress, setLevelProgress] = useState({});
  const [showTypingGame, setShowTypingGame] = useState(false);
  const [showLevelPrep, setShowLevelPrep] = useState(false);
  
  const world = gameData.worlds[worldId];

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem(`progress_${worldId}`);
      if (saved) {
        setLevelProgress(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Erreur de chargement:', error);
    }
  };

  const selectLevel = (level) => {
    setSelectedLevel(level);
    setShowLevelPrep(true);
  };

  const saveProgress = async (levelId, results) => {
    try {
      const newProgress = {
        ...levelProgress,
        [levelId]: {
          completed: results.completed,
          bestWpm: Math.max(levelProgress[levelId]?.bestWpm || 0, results.wpm),
          bestAccuracy: Math.max(levelProgress[levelId]?.bestAccuracy || 0, results.accuracy),
          stars: Math.max(levelProgress[levelId]?.stars || 0, results.stars),
          attempts: (levelProgress[levelId]?.attempts || 0) + 1,
          lastPlayed: Date.now(),
        }
      };
      
      setLevelProgress(newProgress);
      await AsyncStorage.setItem(`progress_${worldId}`, JSON.stringify(newProgress));
    } catch (error) {
      console.log('Erreur de sauvegarde:', error);
    }
  };

  // Positions des niveaux sur le chemin volcanique
  const getLevelPosition = (levelIndex) => {
    const positions = [
      { left: '20%', top: '75%' },  // Niveau 1
      { left: '35%', top: '65%' },  // Niveau 2
      { left: '25%', top: '55%' },  // Niveau 3
      { left: '50%', top: '45%' },  // Niveau 4
      { left: '65%', top: '35%' },  // Niveau 5
    ];
    return positions[levelIndex] || { left: '50%', top: '50%' };
  };

  const VolcanicBackground = () => (
    <View style={styles.volcanicBackground}>
      {/* Dégradé de fond volcanique */}
      <View style={styles.gradientBackground} />
      
      {/* Volcan en arrière-plan */}
      <View style={styles.volcano}>
        <View style={styles.volcanoBase} />
        <View style={styles.volcanoTop} />
        <View style={styles.lava1} />
        <View style={styles.lava2} />
        <View style={styles.smoke} />
      </View>
      
      {/* Rivières de lave */}
      <View style={styles.lavaPath1} />
      <View style={styles.lavaPath2} />
      <View style={styles.lavaPath3} />
    </View>
  );

  if (showLevelPrep && selectedLevel) {
    return (
      <LevelPrepScreen
        worldId={worldId}
        levelId={selectedLevel.id}
        levelNumber={selectedLevel.id}
        worldName={world.name}
        onStart={() => {
          setShowLevelPrep(false);
          setShowTypingGame(true);
        }}
        onBack={() => {
          setShowLevelPrep(false);
          setSelectedLevel(null);
        }}
      />
    );
  }

  if (showTypingGame && selectedLevel) {
    return (
      <TypingGameScreen
        level={selectedLevel}
        worldId={worldId}
        onComplete={(results) => {
          saveProgress(selectedLevel.id, results);
          setShowTypingGame(false);
          setSelectedLevel(null);
        }}
        onExit={() => {
          setShowTypingGame(false);
          setSelectedLevel(null);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B4513" />
      
      <VolcanicBackground />
      
      {/* Header avec titre STORY MODE */}
      <SafeAreaView style={styles.header}>
        <Text style={styles.storyModeTitle}>STORY MODE</Text>
      </SafeAreaView>
      
      {/* Niveaux positionnés sur le chemin */}
      <View style={styles.levelsContainer}>
        {world.levels.map((level, index) => {
          const position = getLevelPosition(index);
          const progress = levelProgress[level.id];
          const isUnlocked = index === 0 || levelProgress[world.levels[index - 1].id]?.completed;
          
          return (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelButton,
                {
                  position: 'absolute',
                  left: position.left,
                  top: position.top,
                  transform: [{ translateX: -30 }, { translateY: -30 }], // Centrer le bouton
                },
                !isUnlocked && styles.levelButtonLocked
              ]}
              onPress={() => isUnlocked && selectLevel(level)}
              disabled={!isUnlocked}
            >
              <Text style={[
                styles.levelNumber,
                !isUnlocked && styles.levelNumberLocked
              ]}>
                {level.id}
              </Text>
              {progress?.stars > 0 && (
                <View style={styles.starsContainer}>
                  {Array.from({ length: progress.stars }, (_, i) => (
                    <Text key={i} style={styles.star}>⭐</Text>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B4513',
  },
  volcanicBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradientBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#8B4513',
  },
  volcano: {
    position: 'absolute',
    top: '10%',
    left: '30%',
    width: 120,
    height: 100,
  },
  volcanoBase: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 120,
    height: 80,
    backgroundColor: '#4A4A4A',
    borderRadius: 60,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  volcanoTop: {
    position: 'absolute',
    top: 0,
    left: 45,
    width: 30,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  lava1: {
    position: 'absolute',
    top: 20,
    left: 50,
    width: 20,
    height: 25,
    backgroundColor: '#FF4500',
    borderRadius: 10,
  },
  lava2: {
    position: 'absolute',
    top: 15,
    left: 55,
    width: 10,
    height: 20,
    backgroundColor: '#FF6347',
    borderRadius: 5,
  },
  smoke: {
    position: 'absolute',
    top: -10,
    left: 40,
    width: 40,
    height: 30,
    backgroundColor: 'rgba(169, 169, 169, 0.7)',
    borderRadius: 20,
  },
  lavaPath1: {
    position: 'absolute',
    top: '35%',
    left: '15%',
    width: 180,
    height: 25,
    backgroundColor: '#FF4500',
    borderRadius: 12,
    transform: [{ rotate: '-15deg' }],
  },
  lavaPath2: {
    position: 'absolute',
    top: '50%',
    left: '25%',
    width: 200,
    height: 20,
    backgroundColor: '#FF6347',
    borderRadius: 10,
    transform: [{ rotate: '10deg' }],
  },
  lavaPath3: {
    position: 'absolute',
    top: '65%',
    left: '10%',
    width: 220,
    height: 30,
    backgroundColor: '#FF4500',
    borderRadius: 15,
    transform: [{ rotate: '-5deg' }],
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  storyModeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F5DEB3',
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  levelsContainer: {
    flex: 1,
    position: 'relative',
  },
  levelButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  levelButtonLocked: {
    backgroundColor: '#696969',
    borderColor: '#A9A9A9',
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  levelNumberLocked: {
    color: '#D3D3D3',
  },
  starsContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    flexDirection: 'row',
  },
  star: {
    fontSize: 12,
  },
});

export default WorldLevelsScreen;
