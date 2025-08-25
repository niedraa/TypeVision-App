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
  Alert,
  TouchableOpacity
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
  const [playersTypingState, setPlayersTypingState] = useState({});
  const [finalRanking, setFinalRanking] = useState([]);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  useEffect(() => {
    console.log('📊 RoomData reçue:', JSON.stringify(roomData, null, 2));
    
    if (roomData?.gameState?.text) {
      setGameText(roomData.gameState.text);
      
      console.log('🚀 Démarrage immédiat du jeu');
      
      setGameStarted(true);
      setStartTime(Date.now());
      
      // Focus sur l'input après un petit délai
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }

    // Écouter les changements des joueurs et leur état de frappe
    const unsubscribeTyping = globalMultiplayerService.addTypingListener(roomData.id, (updatedPlayers) => {
      if (updatedPlayers) {
        setPlayers(updatedPlayers);
        setPlayersTypingState(updatedPlayers);
        
        // Vérifier si tous les joueurs ont terminé
        const playersList = Object.values(updatedPlayers);
        const finishedPlayers = playersList.filter(p => p.finished);
        
        if (finishedPlayers.length === playersList.length && finishedPlayers.length > 0) {
          setTimeout(async () => {
            const ranking = await globalMultiplayerService.getFinalRanking(roomData.id);
            setFinalRanking(ranking);
            setShowResults(true);
          }, 2000);
        }
      }
    });

    return () => {
      if (unsubscribeTyping) unsubscribeTyping();
    };
  }, [roomData]);

  const calculateStats = () => {
    if (!startTime || currentIndex === 0) return { wpm: 0, accuracy: 100, currentPosition: 0 };
    
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // en minutes
    const charactersTyped = currentIndex;
    const wordsTyped = charactersTyped / 5; // 5 caractères = 1 mot
    const wpm = Math.round(wordsTyped / timeElapsed) || 0;
    const accuracy = Math.round(((charactersTyped - errors) / charactersTyped) * 100) || 100;
    
    return { wpm, accuracy, currentPosition: currentIndex };
  };

  const updateProgress = async () => {
    const progress = (currentIndex / gameText.length) * 100;
    const stats = calculateStats();
    
    // Mettre à jour le progrès dans Firebase
    await globalMultiplayerService.updatePlayerProgress(roomData.id, progress, stats);
    
    // Mettre à jour l'état de frappe
    await globalMultiplayerService.updatePlayerTyping(
      roomData.id, 
      userInput, 
      currentIndex, 
      errors
    );
    
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
    
    const gameResult = {
      wpm: finalStats.wpm,
      accuracy: finalStats.accuracy,
      completionTime: Date.now() - startTime
    };
    
    await globalMultiplayerService.finishPlayerGame(roomData.id, gameResult);
    
    // Vérifier si tous ont terminé
    const allFinished = await globalMultiplayerService.checkAllPlayersFinished(roomData.id);
    if (allFinished) {
      setTimeout(async () => {
        const ranking = await globalMultiplayerService.getFinalRanking(roomData.id);
        setFinalRanking(ranking);
        setShowResults(true);
      }, 1000);
    }
  };

  const renderTextWithOpponentProgress = () => {
    const currentPlayerId = globalMultiplayerService.currentPlayerId;
    
    return gameText.split('').map((char, index) => {
      let style = styles.textChar;
      
      // Style pour le joueur actuel
      if (index < currentIndex) {
        style = [styles.textChar, styles.typedChar];
      } else if (index === currentIndex) {
        style = [styles.textChar, styles.currentChar];
      }
      
      // Superposition pour montrer la position des adversaires
      const opponentPositions = [];
      Object.values(playersTypingState).forEach((player) => {
        if (player.id !== currentPlayerId && 
            player.typingState && 
            player.typingState.position === index) {
          opponentPositions.push({
            color: player.color || '#666',
            name: player.name
          });
        }
      });
      
      return (
        <View key={index} style={styles.charContainer}>
          <Text style={style}>
            {char}
          </Text>
          {opponentPositions.map((opponent, opIndex) => (
            <View 
              key={opIndex}
              style={[
                styles.opponentCursor,
                { backgroundColor: opponent.color }
              ]}
            />
          ))}
        </View>
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
          isCurrentPlayer && styles.currentPlayerProgress,
          { borderLeftColor: player.color || '#ccc', borderLeftWidth: 4 }
        ]}>
          <View style={styles.playerProgressHeader}>
            <View style={styles.playerNameContainer}>
              <View 
                style={[
                  styles.playerColorDot, 
                  { backgroundColor: player.color || '#ccc' }
                ]} 
              />
              <Text style={styles.playerProgressName}>
                {player.name}
                {isCurrentPlayer && ' (Vous)'}
                {player.finished && ' 🏁'}
              </Text>
            </View>
            <Text style={styles.playerProgressStats}>
              {player.wpm || 0} WPM • {player.accuracy || 100}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[
              styles.progressBar, 
              { 
                width: progressWidth,
                backgroundColor: player.color || '#10B981'
              }
            ]} />
          </View>
          {player.typingState && (
            <Text style={styles.playerTypingIndicator}>
              Tape: "{player.typingState.currentText?.slice(-10) || ''}..."
            </Text>
          )}
        </View>
      );
    });
  };

  const renderResults = () => {
    const currentPlayerId = globalMultiplayerService.currentPlayerId;
    
    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>🏆 Résultats de la partie</Text>
        {finalRanking.map((player, index) => {
          const isCurrentPlayer = player.id === currentPlayerId;
          return (
            <View key={player.id} style={[
              styles.resultItem,
              isCurrentPlayer && styles.currentPlayerResult,
              { borderLeftColor: player.color || '#ccc', borderLeftWidth: 4 }
            ]}>
              <View style={styles.resultRankContainer}>
                <Text style={[
                  styles.resultPosition,
                  index === 0 && styles.firstPlace,
                  index === 1 && styles.secondPlace,
                  index === 2 && styles.thirdPlace
                ]}>
                  #{player.rank}
                </Text>
                {index === 0 && <Text style={styles.crownEmoji}>👑</Text>}
              </View>
              <View style={styles.resultPlayerInfo}>
                <View style={styles.resultNameContainer}>
                  <View 
                    style={[
                      styles.playerColorDot, 
                      { backgroundColor: player.color || '#ccc' }
                    ]} 
                  />
                  <Text style={styles.resultName}>
                    {player.name}
                    {isCurrentPlayer && ' (Vous)'}
                  </Text>
                </View>
                <Text style={styles.resultStats}>
                  {player.finalWpm || 0} WPM • {player.finalAccuracy || 100}% • 
                  {Math.round((player.completionTime || 0) / 1000)}s
                </Text>
              </View>
            </View>
          );
        })}
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>Retour au lobby</Text>
        </TouchableOpacity>
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
          <View style={styles.gameTextContainer}>
            {renderTextWithOpponentProgress()}
          </View>
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
  playerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
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
  playerTypingIndicator: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
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
  gameTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  charContainer: {
    position: 'relative',
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
  opponentCursor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8,
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
    textAlign: 'center',
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
  currentPlayerResult: {
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  resultRankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    minWidth: 60,
  },
  resultPosition: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  firstPlace: {
    color: '#FFD700',
  },
  secondPlace: {
    color: '#C0C0C0',
  },
  thirdPlace: {
    color: '#CD7F32',
  },
  crownEmoji: {
    fontSize: 16,
    marginLeft: 4,
  },
  resultPlayerInfo: {
    flex: 1,
  },
  resultNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resultStats: {
    fontSize: 14,
    color: '#666',
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MultiplayerGameScreen;
