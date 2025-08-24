import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SlideTransition } from '../components/Transitions';
import { AnimatedButton } from '../components/AnimatedButton';
import { gameData } from '../data/gameData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WorldLevelsScreen from './WorldLevelsScreen';

const { width } = Dimensions.get('window');

const StoryScreen = ({ onBack }) => {
  const [worldUnlockStatus, setWorldUnlockStatus] = useState({});
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [worldProgress, setWorldProgress] = useState({});
  const fadeAnim = new Animated.Value(0);

  // Données de fallback au cas où gameData ne serait pas disponible
  const fallbackWorlds = {
    volcanic: {
      id: 'volcanic',
      name: 'Royaume des Flammes',
      icon: '🌋',
      color: '#FF6B35',
      description: '🔥 Défiez les volcans en éruption ! Tapez plus vite que la lave qui dévale !',
      levels: Array.from({length: 5}, (_, i) => ({
        id: i + 1,
        difficulty: Math.min(i + 1, 3),
        words: ['test', 'mot', 'niveau']
      }))
    },
    aquatic: {
      id: 'aquatic',
      name: 'Océan Mystérieux',
      icon: '🌊',
      color: '#4FC3F7',
      description: '🐠 Plongez dans les abysses et découvrez les secrets des profondeurs !',
      levels: Array.from({length: 5}, (_, i) => ({
        id: i + 1,
        difficulty: Math.min(i + 1, 3),
        words: ['test', 'mot', 'niveau']
      }))
    },
    cloudy: {
      id: 'cloudy',
      name: 'Citadelle Céleste',
      icon: '☁️',
      color: '#9E9E9E',
      description: '⚡ Volez parmi les nuages magiques et maîtrisez les vents divins !',
      levels: Array.from({length: 5}, (_, i) => ({
        id: i + 1,
        difficulty: Math.min(i + 1, 3),
        words: ['test', 'mot', 'niveau']
      }))
    },
    forest: {
      id: 'forest',
      name: 'Forêt Enchantée',
      icon: '🌲',
      color: '#4CAF50',
      description: '🧚‍♀️ Explorez la forêt mystique où chaque mot révèle un sortilège !',
      levels: Array.from({length: 5}, (_, i) => ({
        id: i + 1,
        difficulty: Math.min(i + 1, 3),
        words: ['test', 'mot', 'niveau']
      }))
    },
    crystal: {
      id: 'crystal',
      name: 'Grotte de Cristal',
      icon: '💎',
      color: '#9C27B0',
      description: '✨ Découvrez les gemmes cachées dans les cavernes scintillantes !',
      levels: Array.from({length: 5}, (_, i) => ({
        id: i + 1,
        difficulty: Math.min(i + 1, 3),
        words: ['test', 'mot', 'niveau']
      }))
    }
  };


  useEffect(() => {
    loadUnlockStatus();
    loadProgress();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadUnlockStatus = async () => {
    try {
      const status = {};
      
      // Vérification de sécurité
      if (!gameData || !gameData.worlds) {
        console.log('gameData non disponible, utilisation des données par défaut');
        setWorldUnlockStatus({ volcanic: true, aquatic: false, cloudy: false });
        return;
      }
      
      const worldIds = Object.keys(gameData.worlds);
      console.log('worldIds trouvés:', worldIds);
      
      for (const worldId of worldIds) {
        if (worldId === 'volcanic') {
          status[worldId] = true; // Premier monde toujours débloqué
        } else {
          const unlocked = await AsyncStorage.getItem(`world_${worldId}_unlocked`);
          status[worldId] = unlocked === 'true';
        }
      }
      
      console.log('Status des mondes:', status);
      setWorldUnlockStatus(status);
    } catch (error) {
      console.log('Erreur chargement statut:', error);
      // Par défaut, seul le monde volcanique est débloqué
      setWorldUnlockStatus({ volcanic: true, aquatic: false, cloudy: false });
    }
  };

  const loadProgress = async () => {
    try {
      const progress = {};
      
      // Vérification de sécurité
      if (!gameData || !gameData.worlds) {
        setWorldProgress({});
        return;
      }
      
      const worldIds = Object.keys(gameData.worlds);
      
      for (const worldId of worldIds) {
        const worldProgress = await AsyncStorage.getItem(`progress_${worldId}`);
        if (worldProgress) {
          const parsed = JSON.parse(worldProgress);
          const completedLevels = Object.values(parsed).filter(p => p.completed).length;
          const totalStars = Object.values(parsed).reduce((sum, p) => sum + (p.stars || 0), 0);
          const totalLevels = gameData.worlds[worldId].levels.length;
          
          progress[worldId] = {
            completedLevels,
            totalLevels,
            totalStars,
            completion: Math.round((completedLevels / totalLevels) * 100),
          };
        } else {
          progress[worldId] = {
            completedLevels: 0,
            totalLevels: gameData.worlds[worldId].levels.length,
            totalStars: 0,
            completion: 0,
          };
        }
      }
      
      setWorldProgress(progress);
    } catch (error) {
      console.log('Erreur chargement progression:', error);
    }
  };

  const selectWorld = (worldId) => {
    const isUnlocked = worldUnlockStatus[worldId];
    if (isUnlocked) {
      setSelectedWorld(worldId);
    }
  };

  const renderWorld = (worldId) => {
    // Utiliser les données principales ou de fallback
    const world = (gameData && gameData.worlds && gameData.worlds[worldId]) 
      ? gameData.worlds[worldId] 
      : fallbackWorlds[worldId];
      
    if (!world) {
      return null;
    }
    
    const isUnlocked = worldUnlockStatus[worldId] !== false; // Par défaut débloqué si pas d'info
    const progress = worldProgress[worldId] || { completedLevels: 0, totalLevels: 5, totalStars: 0, completion: 0 };

    // Couleurs thématiques pour chaque monde
    const worldColors = {
      world1: { primary: '#4CAF50', secondary: '#E8F5E8', accent: '#2E7D32' },
      world2: { primary: '#2196F3', secondary: '#E3F2FD', accent: '#1565C0' },
      world3: { primary: '#FF9800', secondary: '#FFF3E0', accent: '#E65100' },
      world4: { primary: '#9C27B0', secondary: '#F3E5F5', accent: '#6A1B9A' },
      world5: { primary: '#F44336', secondary: '#FFEBEE', accent: '#C62828' },
    };

    const colors = worldColors[worldId] || { primary: '#6c757d', secondary: '#f8f9fa', accent: '#495057' };

    return (
      <TouchableOpacity
        key={worldId}
        style={[
          styles.worldCard,
          !isUnlocked && styles.worldCardLocked,
          isUnlocked && { 
            borderLeftWidth: 5, 
            borderLeftColor: colors.primary,
            backgroundColor: colors.secondary
          }
        ]}
        onPress={() => selectWorld(worldId)}
        disabled={!isUnlocked}
        activeOpacity={0.8}
      >
        <View style={styles.worldHeader}>
          <View style={[styles.worldIconContainer, { 
            backgroundColor: isUnlocked ? colors.primary : '#e9ecef' 
          }]}>
            <Text style={[styles.worldIcon, { 
              color: isUnlocked ? '#ffffff' : '#6c757d' 
            }]}>
              {world.icon}
            </Text>
          </View>
          {!isUnlocked && (
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={20} color="#6c757d" />
            </View>
          )}
        </View>
        
        <Text style={[
          styles.worldName,
          !isUnlocked && styles.worldNameLocked
        ]}>
          {world.name}
        </Text>
        
        <Text style={[
          styles.worldDescription,
          !isUnlocked && styles.worldDescriptionLocked
        ]}>
          {world.description}
        </Text>

        {isUnlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressRow}>
              <Text style={[styles.progressText, { color: colors.accent }]}>
                {progress.completedLevels}/{progress.totalLevels} niveaux
              </Text>
              <Text style={[styles.progressText, { color: colors.primary }]}>
                ⭐ {progress.totalStars}
              </Text>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${progress.completion}%`,
                    backgroundColor: colors.primary
                  }
                ]} 
              />
            </View>
            
            <Text style={[styles.completionText, { color: colors.accent }]}>
              {progress.completion}% terminé
            </Text>
          </View>
        )}

        {!isUnlocked && (
          <View style={styles.lockedContainer}>
            <Text style={styles.lockedText}>
              Terminez le monde précédent pour débloquer
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (selectedWorld) {
    // Vérifier si WorldLevelsScreen existe et si le monde est disponible
    const worldExists = (gameData && gameData.worlds && gameData.worlds[selectedWorld]) 
      || fallbackWorlds[selectedWorld];
      
    if (worldExists) {
      return (
        <WorldLevelsScreen
          worldId={selectedWorld}
          onBack={() => {
            setSelectedWorld(null);
            loadProgress(); // Recharger la progression
          }}
        />
      );
    } else {
      // Si le monde n'existe pas, retourner à la sélection
      setSelectedWorld(null);
    }
  }

  return (
    <SlideTransition>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Mode Histoire</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Worlds */}
        <ScrollView 
          style={styles.worldsContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ opacity: 1 }}>
            {(gameData && gameData.worlds 
              ? Object.keys(gameData.worlds) 
              : Object.keys(fallbackWorlds)
            ).map((worldId) => renderWorld(worldId))}
          </View>
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </SlideTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 22,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
  introContainer: {
    paddingHorizontal: 20,
    marginBottom: 5,
    marginTop: 5,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 6,
  },
  introText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 18,
  },
  worldsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  worldCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.84,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  worldCardLocked: {
    opacity: 0.6,
    backgroundColor: '#f8f9fa',
  },
  worldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  worldIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  worldIcon: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  lockIcon: {
    backgroundColor: 'rgba(108, 117, 125, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  worldName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  worldNameLocked: {
    color: '#6c757d',
  },
  worldDescription: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 20,
  },
  worldDescriptionLocked: {
    color: '#adb5bd',
  },
  progressContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  completionText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  lockedContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  lockedText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 20,
  },
  bottomSpacing: {
    height: 30,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default StoryScreen;
