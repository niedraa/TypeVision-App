import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SlideTransition } from '../components/Transitions';
import { AnimatedButton } from '../components/AnimatedButton';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const LevelPrepScreen = ({ 
  level, 
  world, 
  onBack, 
  onStartLevel 
}) => {
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const countdownAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      // Animation du compte à rebours
      Animated.sequence([
        Animated.timing(countdownAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(countdownAnim, {
          toValue: 0.8,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      // Démarrer le niveau
      onStartLevel();
    }
  }, [showCountdown, countdown]);

  const handleStartCountdown = () => {
    setShowCountdown(true);
    setCountdown(3);
  };

  if (showCountdown) {
    return (
      <SafeAreaView style={styles.countdownContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <View style={styles.countdownBackground}>
          <Animated.View 
            style={[
              styles.countdownCircle,
              {
                transform: [{ scale: countdownAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.countdownText}>
              {countdown > 0 ? countdown : 'GO!'}
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SlideTransition>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.worldName}>{world.name}</Text>
            <Text style={styles.levelName}>{level.name}</Text>
          </View>
        </View>

        {/* Contenu principal */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Icône du monde */}
          <View style={[styles.worldIconContainer, { backgroundColor: world.color }]}>
            <Text style={styles.worldIcon}>{world.icon}</Text>
          </View>

          {/* Information du niveau */}
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>
              {level.name || `Niveau ${level.id}`}
            </Text>
            <Text style={styles.levelDescription}>
              {level.description || 'Préparez-vous à taper avec précision et rapidité !'}
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Difficulté</Text>
                <Text style={styles.statValue}>
                  {level.difficulty || 'Facile'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Objectif WPM</Text>
                <Text style={styles.statValue}>
                  {level.targetWPM || '20'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Erreurs max</Text>
                <Text style={styles.statValue}>
                  {level.maxErrors || '3'}
                </Text>
              </View>
            </View>
          </View>

          {/* Message de préparation */}
          <View style={styles.prepMessage}>
            <Text style={styles.prepTitle}>Prêt à commencer ?</Text>
            <Text style={styles.prepText}>
              Assurez-vous d'être dans une position confortable pour taper. 
              Le niveau commencera après un compte à rebours de 3 secondes.
            </Text>
          </View>

          {/* Bouton de démarrage */}
          <AnimatedButton 
            style={[styles.startButton, { backgroundColor: world.color }]}
            onPress={handleStartCountdown}
          >
            <Text style={styles.startButtonText}>Commencer</Text>
          </AnimatedButton>
        </Animated.View>
      </SafeAreaView>
    </SlideTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  worldName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  levelName: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: 'center',
  },
  worldIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  worldIcon: {
    fontSize: 50,
  },
  levelInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  levelDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  prepMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 40,
    width: '100%',
  },
  prepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  prepText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  startButton: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Styles pour le compte à rebours
  countdownContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  countdownBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  countdownCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default LevelPrepScreen;
