import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { SlideTransition } from '../components/Transitions';
import { AnimatedButton } from '../components/AnimatedButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import { gameUtils } from '../data/gameData';

const { width, height } = Dimensions.get('window');

const TypingGameScreen = ({ level, world, onBack, onComplete }) => {
  const [inputText, setInputText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const targetText = level.text;
  const inputRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Focus automatique sur l'input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);

    // Timer pour calculer le temps
    let interval;
    if (isGameActive && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameActive, gameCompleted]);

  useEffect(() => {
    // Animation de progression
    const progress = currentIndex / targetText.length;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Vérification de fin de jeu
    if (currentIndex === targetText.length && inputText.length === targetText.length) {
      completeGame();
    }
  }, [currentIndex, inputText.length]);

  const startGame = () => {
    setStartTime(Date.now());
    setIsGameActive(true);
    setInputText('');
    setCurrentIndex(0);
    setErrors(0);
    setTimeElapsed(0);
    setGameCompleted(false);
    inputRef.current?.focus();
  };

  const completeGame = () => {
    if (gameCompleted) return;
    
    setIsGameActive(false);
    setGameCompleted(true);
    
    const timeInSeconds = timeElapsed || 1;
    const finalWpm = gameUtils.calculateWPM(targetText, timeInSeconds);
    const finalAccuracy = gameUtils.calculateAccuracy(targetText.length, errors);
    
    setWpm(finalWpm);
    setAccuracy(finalAccuracy);
    
    const stars = gameUtils.getStars(finalWpm, level.targetWPM, errors, level.maxErrors);
    const completed = gameUtils.isLevelCompleted(finalWpm, errors, level.targetWPM, level.maxErrors);
    
    // Animation de réussite
    if (completed) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Afficher les résultats après un délai
    setTimeout(() => {
      showResults(finalWpm, finalAccuracy, stars, completed);
    }, 1000);
  };

  const showResults = (finalWpm, finalAccuracy, stars, completed) => {
    const message = completed 
      ? `🎉 Niveau réussi !\n\nVitesse: ${finalWpm} MPM\nPrécision: ${finalAccuracy}%\nÉtoiles: ${stars}/3`
      : `😔 Niveau échoué\n\nVitesse: ${finalWpm} MPM (objectif: ${level.targetWPM})\nErreurs: ${errors}/${level.maxErrors}\nPrécision: ${finalAccuracy}%`;
    
    Alert.alert(
      completed ? 'Félicitations !' : 'Essayez encore',
      message,
      [
        {
          text: 'Recommencer',
          onPress: resetGame,
        },
        {
          text: completed ? 'Continuer' : 'Retour',
          onPress: () => onComplete({ 
            completed, 
            wpm: finalWpm, 
            accuracy: finalAccuracy, 
            stars,
            errors
          }),
          style: completed ? 'default' : 'cancel',
        },
      ]
    );
  };

  const resetGame = () => {
    setInputText('');
    setCurrentIndex(0);
    setErrors(0);
    setStartTime(null);
    setIsGameActive(false);
    setGameCompleted(false);
    setWpm(0);
    setAccuracy(100);
    setTimeElapsed(0);
    progressAnim.setValue(0);
    pulseAnim.setValue(1);
  };

  const handleTextChange = (text) => {
    if (!isGameActive && !startTime) {
      startGame();
    }

    // Système de correction obligatoire - logique stricte
    let validText = '';
    let hasError = false;
    
    // Vérifier chaque caractère au fur et à mesure
    for (let i = 0; i < text.length && i < targetText.length; i++) {
      if (text[i] === targetText[i]) {
        validText += text[i];
      } else {
        // Dès qu'il y a une erreur, on s'arrête là
        hasError = true;
        break;
      }
    }
    
    // Si l'utilisateur essaie de taper plus que ce qui est validé, on bloque
    if (text.length > validText.length) {
      // On ne met à jour l'input qu'avec le texte valide
      setInputText(validText);
      console.log('❌ Erreur détectée ! Impossible de continuer. Corrigez d\'abord l\'erreur.');
      return;
    }
    
    // Mettre à jour avec le texte valide uniquement
    setInputText(validText);
    setCurrentIndex(validText.length);
    
    // Compter les erreurs totales (uniquement les erreurs corrigées)
    let totalErrors = errors;
    if (hasError) {
      totalErrors++;
      setErrors(totalErrors);
    }
    
    // Calcul WPM en temps réel
    if (timeElapsed > 0) {
      const currentWpm = gameUtils.calculateWPM(validText, timeElapsed);
      setWpm(currentWpm);
      
      const currentAccuracy = gameUtils.calculateAccuracy(validText.length, totalErrors);
      setAccuracy(currentAccuracy);
    }
  };

  const renderText = () => {
    return targetText.split('').map((char, index) => {
      let style = styles.textDefault;
      
      if (index < inputText.length) {
        // Caractère déjà tapé correctement
        style = styles.textCorrect;
      } else if (index === inputText.length) {
        // Caractère actuel à taper
        style = styles.textCurrent;
      } else {
        // Caractères à venir
        style = styles.textDefault;
      }

      return (
        <Text key={index} style={style}>
          {char}
        </Text>
      );
    });
  };  const progressPercentage = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SlideTransition>
      <SafeAreaView style={[styles.container, { backgroundColor: world.color }]}>
        <StatusBar barStyle="light-content" backgroundColor={world.color} />
        
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

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{wpm}</Text>
            <Text style={styles.statLabel}>MPM</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Précision</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{errors}/{level.maxErrors}</Text>
            <Text style={styles.statLabel}>Erreurs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{timeElapsed}s</Text>
            <Text style={styles.statLabel}>Temps</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { width: progressPercentage, backgroundColor: 'rgba(255,255,255,0.8)' }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((currentIndex / targetText.length) * 100)}%
          </Text>
        </View>

        {/* Text to type */}
        <Animated.View style={[styles.textContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.textDisplay}>
            {renderText()}
          </View>
        </Animated.View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={inputText}
            onChangeText={handleTextChange}
            placeholder={!isGameActive ? "Commencez à taper pour démarrer..." : ""}
            placeholderTextColor="rgba(255,255,255,0.7)"
            multiline
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
          />
        </View>

        {/* Objectifs */}
        <View style={styles.objectivesContainer}>
          <Text style={styles.objectivesTitle}>Objectifs :</Text>
          <Text style={styles.objective}>• Vitesse: {level.targetWPM} MPM minimum</Text>
          <Text style={styles.objective}>• Erreurs: {level.maxErrors} maximum</Text>
          <Text style={styles.objective}>• Difficulté: {level.difficulty}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <AnimatedButton
            style={styles.resetButton}
            onPress={resetGame}
          >
            <Text style={styles.resetButtonText}>Recommencer</Text>
          </AnimatedButton>
        </View>
      </SafeAreaView>
    </SlideTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 15,
  },
  worldName: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  levelName: {
    fontSize: 20,
    color: 'white',
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  textContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    minHeight: 120,
  },
  textDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    lineHeight: 28,
  },
  textDefault: {
    fontSize: 18,
    color: '#666',
    lineHeight: 28,
  },
  textCorrect: {
    fontSize: 18,
    color: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    lineHeight: 28,
  },
  textError: {
    fontSize: 18,
    color: '#F44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    lineHeight: 28,
  },
  textCurrent: {
    fontSize: 18,
    color: '#333',
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    lineHeight: 28,
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: 'white',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  objectivesContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  objectivesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  objective: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resetButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TypingGameScreen;
