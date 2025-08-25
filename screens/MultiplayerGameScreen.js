import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Animated,
  Alert
} from 'react-native';
// Utiliser le service multijoueur mondial
import { globalMultiplayerService } from '../services/globalMultiplayerService';

const MultiplayerGameScreen = ({ roomData, onGameComplete, onBack }) => {
  const [gameText, setGameText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [players, setPlayers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [errors, setErrors] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  useEffect(() => {
    console.log('📊 RoomData reçue:', JSON.stringify(roomData, null, 2));
    
    if (roomData?.gameState?.currentText) {
      setGameText(roomData.gameState.currentText.text || '');
      
      console.log('🚀 Démarrage immédiat du jeu - suppression du countdown');
      
      // Toujours démarrer directement le jeu, peu importe le type de partie
      setGameStarted(true);
      setStartTime(Date.now());
      
      // Focus sur l'input après un petit délai
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }

    // Écouter les changements des joueurs
    const unsubscribePlayers = globalMultiplayerService.addGlobalRoomListener(roomData.id, (updatedRoomData) => {
      if (updatedRoomData && updatedRoomData.players) {
        setPlayers(updatedRoomData.players || {});
        
        // Vérifier si tous les joueurs ont terminé
        const playersList = Object.values(updatedRoomData.players || {});
        const finishedPlayers = playersList.filter(p => p.finished);
        
        if (finishedPlayers.length === playersList.length) {
          setTimeout(() => {
            setShowResults(true);
          }, 2000);
        }
      }
    });

    return () => {
      if (unsubscribePlayers) unsubscribePlayers();
    };
  }, [roomData]);

  const calculateStats = () => {
    if (!startTime || currentIndex === 0) return { wpm: 0, accuracy: 100 };
    
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // en minutes
    const charactersTyped = currentIndex;
    const wordsTyped = charactersTyped / 5; // 5 caractères = 1 mot
    const wpm = Math.round(wordsTyped / timeElapsed) || 0;
    const accuracy = Math.round(((charactersTyped - errors) / charactersTyped) * 100) || 100;
    
    return { wpm, accuracy };
  };

  const updateProgress = async () => {
    const progress = (currentIndex / gameText.length) * 100;
    const stats = calculateStats();
    
    // Pour l'instant, on peut commenter cette ligne car la méthode n'existe pas encore
    // await globalMultiplayerService.updatePlayerProgress(progress, stats.wpm, stats.accuracy);
    
    // Animation de la barre de progression
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleTextChange = async (text) => {
    if (!gameStarted || isFinished) return;
    
    setUserInput(text);
    
    const newIndex = text.length;
    let newErrors = errors;
    
    // Vérifier les erreurs
    for (let i = 0; i < newIndex; i++) {
      if (text[i] !== gameText[i]) {
        // Ne pas permettre la progression avec des erreurs
        return;
      }
    }
    
    setCurrentIndex(newIndex);
    setErrors(newErrors);
    
    await updateProgress();
    
    // Vérifier si le texte est terminé
    if (newIndex >= gameText.length) {
      finishGame();
    }
  };

  const finishGame = async () => {
    if (isFinished) return;
    
    setIsFinished(true);
    const finalStats = calculateStats();
    
    // Pour l'instant, on peut commenter cette ligne car la méthode n'existe pas encore
    // await globalMultiplayerService.finishGame({
    //   wpm: finalStats.wpm,
    //   accuracy: finalStats.accuracy,
    //   completionTime: Date.now() - startTime
    // });
  };

  const renderText = () => {
    return gameText.split('').map((char, index) => {
      let style = styles.textChar;
      
      if (index < currentIndex) {
        style = [styles.textChar, styles.typedChar];
      } else if (index === currentIndex) {
        style = [styles.textChar, styles.currentChar];
      }
      
      return (
        <Text key={index} style={style}>
          {char}
        </Text>
      );
    });
  };

  const renderPlayerProgress = () => {
    const playersList = Object.values(players);
    const currentPlayerId = globalMultiplayerService.currentPlayerId;
    
    return playersList.map((player) => {
      const isCurrentPlayer = player.id === currentPlayerId;
      const progressWidth = `${player.progress || 0}%`;
      
      return (
        <View key={player.id} style={[
          styles.playerProgressCard,
          isCurrentPlayer && styles.currentPlayerProgress
        ]}>
          <View style={styles.playerProgressHeader}>
            <Text style={styles.playerProgressName}>
              {player.name}
              {isCurrentPlayer && ' (Vous)'}
              {player.finished && ' 🏁'}
            </Text>
            <Text style={styles.playerProgressStats}>
              {player.wpm || 0} WPM • {player.accuracy || 100}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
        </View>
      );
    });
  };

  const renderResults = () => {
    const playersList = Object.values(players)
      .filter(p => p.finished)
      .sort((a, b) => (a.finishTime || Infinity) - (b.finishTime || Infinity));
    
    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Résultats de la partie</Text>
        {playersList.map((player, index) => (
          <View key={player.id} style={styles.resultItem}>
            <Text style={styles.resultPosition}>#{index + 1}</Text>
            <Text style={styles.resultName}>{player.name}</Text>
            <Text style={styles.resultStats}>
              {player.finalWpm || 0} WPM • {player.finalAccuracy || 100}%
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (showResults) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        {renderResults()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Players Progress */}
      <ScrollView 
        style={styles.playersProgress}
        showsVerticalScrollIndicator={false}
      >
        {renderPlayerProgress()}
      </ScrollView>
      
      {/* Game Text */}
      <View style={styles.textContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.gameText}>
            {renderText()}
          </Text>
        </ScrollView>
      </View>
      
      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={userInput}
          onChangeText={handleTextChange}
          multiline
          placeholder={gameStarted ? "Commencez à taper..." : ""}
          editable={gameStarted && !isFinished}
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  playersProgress: {
    maxHeight: 200,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  playerProgressCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentPlayerProgress: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  playerProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerProgressName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  playerProgressStats: {
    fontSize: 12,
    color: '#666',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  textContainer: {
    flex: 1,
    margin: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
  },
  textChar: {
    fontSize: 18,
    lineHeight: 28,
  },
  typedChar: {
    backgroundColor: '#10B981',
    color: 'white',
  },
  currentChar: {
    backgroundColor: '#3B82F6',
    color: 'white',
  },
  inputContainer: {
    margin: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    fontSize: 16,
    padding: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    color: '#333',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultPosition: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginRight: 15,
    minWidth: 40,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  resultStats: {
    fontSize: 14,
    color: '#666',
  },
});

export default MultiplayerGameScreen;
