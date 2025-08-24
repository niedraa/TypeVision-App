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
import { Ionicons } from '@expo/vector-icons';
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
      let progress = {};
      
      if (saved) {
        progress = JSON.parse(saved);
      }
      
      // S'assurer que le premier niveau est toujours débloqué
      if (world.levels.length > 0) {
        const firstLevelId = world.levels[0].id;
        if (!progress[firstLevelId]) {
          progress[firstLevelId] = { unlocked: true };
        }
      }
      
      setLevelProgress(progress);
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
          unlocked: true
        }
      };
      
      // Si le niveau est complété, débloquer le niveau suivant
      if (results.completed) {
        const currentLevelIndex = world.levels.findIndex(l => l.id === levelId);
        if (currentLevelIndex >= 0 && currentLevelIndex < world.levels.length - 1) {
          const nextLevel = world.levels[currentLevelIndex + 1];
          newProgress[nextLevel.id] = {
            ...newProgress[nextLevel.id],
            unlocked: true
          };
        }
      }
      
      setLevelProgress(newProgress);
      await AsyncStorage.setItem(`progress_${worldId}`, JSON.stringify(newProgress));
    } catch (error) {
      console.log('Erreur de sauvegarde:', error);
    }
  };

  // Positions des niveaux en grille 4x4 comme dans l'image
  const getLevelPosition = (levelIndex) => {
    const row = Math.floor(levelIndex / 4);
    const col = levelIndex % 4;
    
    const startX = 12; // Pourcentage de marge gauche
    const startY = 20; // Pourcentage de marge haute après le titre
    const spacingX = 25; // Espacement horizontal entre les cercles
    const spacingY = 18; // Espacement vertical entre les rangées
    
    return {
      left: `${startX + (col * spacingX)}%`,
      top: `${startY + (row * spacingY)}%`
    };
  };

  if (showLevelPrep && selectedLevel) {
    return (
      <LevelPrepScreen
        level={selectedLevel}
        world={world}
        onBack={() => {
          setShowLevelPrep(false);
          setSelectedLevel(null);
        }}
        onStartLevel={() => {
          setShowLevelPrep(false);
          setShowTypingGame(true);
        }}
      />
    );
  }

  if (showTypingGame && selectedLevel) {
    return (
      <TypingGameScreen
        level={selectedLevel}
        world={world}
        onComplete={(results) => {
          saveProgress(selectedLevel.id, results);
          setShowTypingGame(false);
          setSelectedLevel(null);
        }}
        onBack={() => {
          setShowTypingGame(false);
          setSelectedLevel(null);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header avec flèche retour et titre */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.worldTitle}>MONDE VOLCANIQUE</Text>
      </SafeAreaView>
      
      {/* Grille des niveaux */}
      <View style={styles.levelsContainer}>
        {world.levels.slice(0, 16).map((level, index) => {
          const position = getLevelPosition(index);
          const progress = levelProgress[level.id];
          const isUnlocked = index === 0 || 
                           (levelProgress[level.id]?.unlocked) || 
                           (index > 0 && levelProgress[world.levels[index - 1].id]?.completed);
          
          // Déterminer les couleurs et styles selon l'état du niveau
          let buttonStyle = { ...styles.levelButton };
          let numberColor = 'white';
          let showStars = false;
          
          if (progress?.completed) {
            // Niveau complété - vert avec étoile
            buttonStyle.backgroundColor = '#4CAF50';
            showStars = true;
          } else if (isUnlocked) {
            if (index === 2) {
              // Niveau 3 - orange avec bordure (niveau en cours)
              buttonStyle.backgroundColor = 'white';
              buttonStyle.borderWidth = 3;
              buttonStyle.borderColor = '#FF6B35';
              numberColor = '#FF6B35';
            } else {
              // Niveaux débloqués - orange plein
              buttonStyle.backgroundColor = '#FF6B35';
            }
          } else {
            // Niveaux verrouillés - gris
            buttonStyle.backgroundColor = '#B0B0B0';
          }
          
          return (
            <TouchableOpacity
              key={level.id}
              style={[
                buttonStyle,
                {
                  position: 'absolute',
                  left: position.left,
                  top: position.top,
                },
              ]}
              onPress={() => isUnlocked && selectLevel(level)}
              disabled={!isUnlocked}
            >
              {!isUnlocked ? (
                <Ionicons name="lock-closed" size={20} color="white" />
              ) : showStars ? (
                <Ionicons name="star" size={24} color="white" />
              ) : (
                <Text style={[styles.levelNumber, { color: numberColor }]}>
                  {level.id}
                </Text>
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
    backgroundColor: '#F8F9FA', // Fond gris clair comme dans l'image
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 20,
    padding: 8,
  },
  worldTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginRight: 48, // Compenser la largeur du bouton retour pour centrer le texte
  },
  levelsContainer: {
    flex: 1,
    position: 'relative',
    paddingTop: 20,
  },
  levelButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ translateX: -35 }, { translateY: -35 }], // Centrer le bouton sur sa position
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default WorldLevelsScreen;
