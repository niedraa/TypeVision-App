import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Alert,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Utiliser le service multijoueur mondial
import { globalMultiplayerService } from '../services/globalMultiplayerService';
import { gameData } from '../data/gameData';
import InlineCountdown from '../components/InlineCountdown';

const MultiplayerLobbyScreen = ({ roomData, onStartGame, onBack }) => {
  const [players, setPlayers] = useState({});
  const [room, setRoom] = useState(roomData || {});
  const [isReady, setIsReady] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    // Vérifier si roomData existe et a les bonnes propriétés
    if (!roomData || !roomData.settings || !roomData.settings.maxPlayers) {
      console.error('❌ Données de salle invalides:', roomData);
      Alert.alert('Erreur', 'Données de salle invalides');
      onBack();
      return;
    }

    // Mettre à jour l'état de la salle avec les nouvelles données
    setRoom(roomData);

    // Vérifier si l'utilisateur est l'host
    const currentPlayerId = globalMultiplayerService.currentPlayerId;
    setIsHost(roomData.host === currentPlayerId);

    // Initialiser les joueurs
    setPlayers(roomData.players || {});
    
    // Écouter les changements de la salle
    globalMultiplayerService.addGlobalRoomListener(roomData.id, (updatedRoomData) => {
      if (updatedRoomData) {
        setRoom(updatedRoomData);
        setPlayers(updatedRoomData.players || {});
        
        // Détecter le début du compte à rebours pour les parties rapides
        if (updatedRoomData.status === 'countdown' && updatedRoomData.settings?.isPublic) {
          setShowCountdown(true);
        }
        
        // Auto-start quand le jeu commence réellement
        if (updatedRoomData.status === 'playing') {
          onStartGame(updatedRoomData);
        }
      }
    });

    // Cleanup au démontage
    return () => {
      globalMultiplayerService.removeGlobalRoomListener(roomData.id);
    };
  }, [roomData]);

  const toggleReady = async () => {
    const newReadyState = !isReady;
    const result = await globalMultiplayerService.setPlayerReady(roomData.id, newReadyState);
    if (result.success) {
      setIsReady(newReadyState);
    } else {
      Alert.alert('Erreur', 'Impossible de changer l\'état');
    }
  };

  const startGame = async () => {
    if (!isHost) return;
    
    const playersList = Object.values(players);
    const allReady = playersList.every(player => player.ready || player.isHost);
    
    if (playersList.length < 2) {
      Alert.alert('Erreur', 'Il faut au moins 2 joueurs pour commencer');
      return;
    }
    
    if (!allReady) {
      Alert.alert('Erreur', 'Tous les joueurs doivent être prêts');
      return;
    }

    // Choisir un texte aléatoire
    const randomWorld = Object.values(gameData.worlds)[0];
    const randomLevel = randomWorld.levels[Math.floor(Math.random() * randomWorld.levels.length)];
    
    const textData = {
      id: randomLevel.id,
      text: randomLevel.text,
      title: randomLevel.name,
      difficulty: room.settings.difficulty
    };

    const success = await globalMultiplayerService.startGame(room.id, textData);
    if (!success) {
      Alert.alert('Erreur', 'Impossible de démarrer la partie');
    }
  };

  const shareRoomCode = async () => {
    try {
      await Share.share({
        message: `Rejoins ma partie TypeVision ! Code: ${room.code}`,
        title: 'Invitation TypeVision'
      });
    } catch (error) {
      console.log('Erreur partage:', error);
    }
  };

  const handleCountdownEnd = () => {
    setShowCountdown(false);
    // Le jeu devrait commencer automatiquement grâce au listener
  };

  const leaveRoom = async () => {
    Alert.alert(
      'Quitter la salle',
      'Êtes-vous sûr de vouloir quitter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Quitter', 
          style: 'destructive',
          onPress: async () => {
            await globalMultiplayerService.leaveRoom(room.id);
            onBack();
          }
        }
      ]
    );
  };

  const renderPlayer = ({ item }) => {
    const player = item;
    const isCurrentPlayer = player.id === globalMultiplayerService.currentPlayerId;
    
    return (
      <View style={[styles.playerCard, isCurrentPlayer && styles.currentPlayerCard]}>
        <View style={styles.playerInfo}>
          <View style={styles.playerAvatar}>
            <Text style={styles.avatarText}>
              {player.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.playerDetails}>
            <Text style={styles.playerName}>
              {player.name}
              {player.isHost && ' 👑'}
              {isCurrentPlayer && ' (Vous)'}
            </Text>
            <Text style={styles.playerStatus}>
              {player.ready ? '✅ Prêt' : '⏳ En attente'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const playersArray = Object.values(players);
  const readyCount = playersArray.filter(p => p.ready || p.isHost).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={leaveRoom}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Salle Multijoueur</Text>
        <TouchableOpacity style={styles.shareButton} onPress={shareRoomCode}>
          <Ionicons name="share-outline" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Room Info */}
      <View style={styles.roomInfo}>
        <Text style={styles.roomCode}>Code de la salle: {room.code || 'Chargement...'}</Text>
        <Text style={styles.roomStats}>
          {playersArray.length}/{room.settings?.maxPlayers || 4} joueurs • {readyCount} prêt(s)
        </Text>
      </View>

      {/* Countdown pour les parties rapides */}
      {showCountdown && room.settings?.isPublic && (
        <View style={styles.countdownSection}>
          <InlineCountdown 
            roomId={room.id} 
            onCountdownEnd={handleCountdownEnd}
          />
        </View>
      )}

      {/* Players List */}
      <View style={styles.playersSection}>
        <Text style={styles.sectionTitle}>Joueurs</Text>
        <FlatList
          data={playersArray}
          renderItem={renderPlayer}
          keyExtractor={(item) => item.id}
          style={styles.playersList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Game Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Paramètres</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Mode de jeu:</Text>
          <Text style={styles.settingValue}>
            {room.settings.gameMode === 'race' ? 'Course' : 'Endurance'}
          </Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Difficulté:</Text>
          <Text style={styles.settingValue}>
            {room.settings.difficulty === 'easy' ? 'Facile' : 
             room.settings.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        {isHost ? (
          <TouchableOpacity 
            style={[
              styles.startButton, 
              (playersArray.length < 2 || readyCount < playersArray.length) && styles.disabledButton
            ]}
            onPress={startGame}
            disabled={playersArray.length < 2 || readyCount < playersArray.length}
          >
            <Text style={styles.startButtonText}>Commencer la partie</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.readyButton, isReady && styles.readyButtonActive]}
            onPress={toggleReady}
          >
            <Text style={[styles.readyButtonText, isReady && styles.readyButtonTextActive]}>
              {isReady ? '✅ Prêt' : 'Je suis prêt'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  shareButton: {
    padding: 8,
  },
  roomInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  roomStats: {
    fontSize: 16,
    color: '#666',
  },
  playersSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  playersList: {
    flex: 1,
  },
  playerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentPlayerCard: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  playerStatus: {
    fontSize: 14,
    color: '#666',
  },
  settingsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3B82F6',
  },
  countdownSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  startButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  readyButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  readyButtonActive: {
    backgroundColor: '#3B82F6',
  },
  readyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
  },
  readyButtonTextActive: {
    color: 'white',
  },
});

export default MultiplayerLobbyScreen;
