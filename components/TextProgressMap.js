import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TextProgressMap = ({ gameText, players, currentPlayerId, currentIndex }) => {
  if (!gameText || gameText.length === 0) return null;
  
  const textLength = gameText.length;
  const segmentCount = 20; // Diviser le texte en 20 segments
  const segmentSize = Math.ceil(textLength / segmentCount);
  
  const renderSegments = () => {
    const segments = [];
    
    for (let i = 0; i < segmentCount; i++) {
      const segmentStart = i * segmentSize;
      const segmentEnd = Math.min((i + 1) * segmentSize, textLength);
      
      // Vérifier quels joueurs sont dans ce segment
      const playersInSegment = [];
      
      // Joueur actuel
      if (currentIndex >= segmentStart && currentIndex < segmentEnd) {
        playersInSegment.push({
          id: currentPlayerId,
          color: '#3B82F6',
          name: 'Vous',
          position: currentIndex
        });
      }
      
      // Adversaires
      Object.values(players).forEach(player => {
        if (player.id !== currentPlayerId && 
            player.typingState && 
            player.typingState.position >= segmentStart && 
            player.typingState.position < segmentEnd) {
          playersInSegment.push({
            id: player.id,
            color: player.color || '#666',
            name: player.name,
            position: player.typingState.position
          });
        }
      });
      
      // Couleur du segment
      let segmentColor = '#E5E7EB'; // Gris par défaut
      if (currentIndex > segmentEnd) {
        segmentColor = '#10B981'; // Vert si déjà tapé par le joueur actuel
      }
      
      segments.push(
        <View key={i} style={styles.segmentContainer}>
          <View 
            style={[
              styles.segment, 
              { backgroundColor: segmentColor }
            ]} 
          >
            {playersInSegment.map((player, index) => (
              <View 
                key={player.id}
                style={[
                  styles.playerDot,
                  { 
                    backgroundColor: player.color,
                    top: index * 3 // Décaler verticalement s'il y a plusieurs joueurs
                  }
                ]}
              />
            ))}
          </View>
        </View>
      );
    }
    
    return segments;
  };
  
  const progress = textLength > 0 ? (currentIndex / textLength * 100).toFixed(1) : 0;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ Carte de progression ({progress}%)</Text>
      <View style={styles.mapContainer}>
        {renderSegments()}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Vous</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Déjà tapé</Text>
        </View>
        {Object.values(players)
          .filter(p => p.id !== currentPlayerId)
          .slice(0, 3) // Afficher max 3 adversaires dans la légende
          .map(player => (
            <View key={player.id} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: player.color || '#666' }]} />
              <Text style={styles.legendText}>{player.name}</Text>
            </View>
          ))
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  mapContainer: {
    flexDirection: 'row',
    height: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  segmentContainer: {
    flex: 1,
    position: 'relative',
  },
  segment: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 2,
    position: 'relative',
  },
  playerDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    left: '50%',
    marginLeft: -3,
    borderWidth: 1,
    borderColor: 'white',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#666',
  },
});

export default TextProgressMap;
