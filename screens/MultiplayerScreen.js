import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AnimatedButton } from '../components/AnimatedButton';
import { SlideTransition } from '../components/Transitions';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// Utiliser le service multijoueur mondial
import { globalMultiplayerService } from '../services/globalMultiplayerService';
import MultiplayerLobbyScreen from './MultiplayerLobbyScreen';
import MultiplayerGameScreen from './MultiplayerGameScreen';

export default function MultiplayerScreen({ onBack, currentUser }) {
  const [currentScreen, setCurrentScreen] = useState('menu'); // menu, lobby, game
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState(currentUser?.username || 'Joueur');
  const [loading, setLoading] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);

  useEffect(() => {
    // Obtenir les statistiques mondiales
    loadGlobalStats();
    
    // Nettoyage périodique des salles expirées
    globalMultiplayerService.cleanupExpiredRooms();
    
    // Mettre à jour les stats toutes les 30 secondes
    const statsInterval = setInterval(loadGlobalStats, 30000);
    
    return () => clearInterval(statsInterval);
  }, []);

  const loadGlobalStats = async () => {
    try {
      const stats = await globalMultiplayerService.getGlobalStats();
      setGlobalStats(stats);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const handleQuickMatch = async () => {
    setLoading(true);
    try {
      const result = await globalMultiplayerService.findGlobalQuickMatch(playerName, 'medium');
      
      if (result.success) {
        setRoomData(result.roomData);
        setCurrentScreen('lobby');
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de trouver une partie mondiale');
      }
    } catch (error) {
      console.error('Erreur partie rapide:', error);
      Alert.alert('Erreur', 'Problème de connexion au serveur mondial');
    }
    setLoading(false);
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const result = await globalMultiplayerService.createGlobalRoom(playerName, {
        maxPlayers: 4,
        gameMode: 'race',
        difficulty: 'medium',
        isPublic: true
      });
      
      if (result.success) {
        setRoomData(result.roomData);
        setCurrentScreen('lobby');
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de créer la salle mondiale');
      }
    } catch (error) {
      console.error('Erreur création salle:', error);
      Alert.alert('Erreur', 'Problème de connexion au serveur mondial');
    }
    setLoading(false);
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un code de salle');
      return;
    }
    
    setLoading(true);
    try {
      const result = await globalMultiplayerService.joinGlobalRoom(roomCode.trim(), playerName);
      
      if (result.success) {
        setRoomData(result.roomData);
        setCurrentScreen('lobby');
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de rejoindre la salle mondiale');
      }
    } catch (error) {
      console.error('Erreur rejoindre salle:', error);
      Alert.alert('Erreur', 'Problème de connexion au serveur mondial');
    }
    setLoading(false);
  };

  const handleStartGame = (gameRoomData) => {
    setRoomData(gameRoomData);
    setCurrentScreen('game');
  };

  const handleGameComplete = () => {
    setCurrentScreen('menu');
    setRoomData(null);
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
    setRoomData(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Connexion...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'lobby' && roomData) {
    return (
      <MultiplayerLobbyScreen
        roomData={roomData}
        onStartGame={handleStartGame}
        onBack={handleBackToMenu}
      />
    );
  }

  if (currentScreen === 'game' && roomData) {
    return (
      <MultiplayerGameScreen
        roomData={roomData}
        onGameComplete={handleGameComplete}
        onBack={handleBackToMenu}
      />
    );
  }

  return (
    <SlideTransition>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        {/* Header avec bouton retour */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Titre principal */}
          <Text style={styles.mainTitle}>Multijoueur Mondial</Text>
          
          {/* Badge Multijoueur Mondial */}
          <View style={styles.globalBadge}>
            <Text style={styles.globalText}>🌍 Multijoueur Mondial</Text>
            <Text style={styles.globalSubtext}>
              Jouez avec des joueurs du monde entier
            </Text>
          </View>

          {/* Statistiques mondiales */}
          {globalStats && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{globalStats.totalPlayers}</Text>
                <Text style={styles.statLabel}>Joueurs en ligne</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{globalStats.waitingRooms}</Text>
                <Text style={styles.statLabel}>Salles en attente</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{globalStats.playingRooms}</Text>
                <Text style={styles.statLabel}>Parties en cours</Text>
              </View>
            </View>
          )}

          {/* Section Nom du joueur */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Votre nom</Text>
            <TextInput
              style={styles.nameInput}
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="Entrez votre nom"
              placeholderTextColor="#999"
              maxLength={20}
            />
          </View>

          {/* Section Options de jeu */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Options de jeu</Text>
            
            {/* Partie rapide */}
            <TouchableOpacity style={styles.optionCard} onPress={handleQuickMatch}>
              <View style={styles.optionContent}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="flash-on" size={32} color="#10B981" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionText}>Partie rapide</Text>
                  <Text style={styles.optionDescription}>
                    Trouvez rapidement des adversaires
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Créer un salon */}
            <TouchableOpacity style={styles.optionCard} onPress={handleCreateRoom}>
              <View style={styles.optionContent}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="add-circle" size={32} color="#3B82F6" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionText}>Créer une salle</Text>
                  <Text style={styles.optionDescription}>
                    Invitez vos amis à jouer
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Section Rejoindre */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rejoindre une salle</Text>
            
            {/* Zone de saisie du code de salon */}
            <View style={styles.roomCodeContainer}>
              <TextInput
                style={styles.roomCodeInput}
                value={roomCode}
                onChangeText={setRoomCode}
                placeholder="Code de salle (6 chiffres)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
            
            {/* Bouton Rejoindre */}
            <TouchableOpacity 
              style={[styles.joinButton, !roomCode.trim() && styles.joinButtonDisabled]}
              onPress={handleJoinRoom}
              disabled={!roomCode.trim()}
            >
              <Text style={[styles.joinButtonText, !roomCode.trim() && styles.joinButtonTextDisabled]}>
                Rejoindre
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SlideTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  globalBadge: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  globalText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  globalSubtext: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  hybridBadge: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  hybridText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  hybridSubtext: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
  },
  optionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  roomCodeContainer: {
    marginBottom: 16,
  },
  roomCodeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    textAlign: 'center',
    letterSpacing: 2,
  },
  joinButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  joinButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  joinButtonTextDisabled: {
    color: '#999',
  },
});
