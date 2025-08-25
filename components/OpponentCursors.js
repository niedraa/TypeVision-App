import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OpponentCursors = ({ players, currentPlayerId, textLength, currentIndex }) => {
  const opponents = Object.values(players).filter(player => 
    player.id !== currentPlayerId && 
    player.typingState && 
    typeof player.typingState.position === 'number'
  );

  if (opponents.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Position des adversaires :</Text>
      {opponents.map((opponent, index) => {
        const position = opponent.typingState.position;
        const progress = textLength > 0 ? (position / textLength * 100).toFixed(1) : 0;
        const isAhead = position > currentIndex;
        
        return (
          <View key={opponent.id} style={styles.opponentInfo}>
            <View 
              style={[
                styles.colorDot, 
                { backgroundColor: opponent.color || '#666' }
              ]} 
            />
            <Text style={styles.opponentName}>{opponent.name}</Text>
            <Text style={[
              styles.opponentProgress,
              isAhead ? styles.aheadProgress : styles.behindProgress
            ]}>
              {progress}% {isAhead ? '🚀' : ''}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  opponentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  opponentName: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  opponentProgress: {
    fontSize: 12,
    fontWeight: '500',
  },
  aheadProgress: {
    color: '#EF4444', // Rouge pour ceux qui sont devant
  },
  behindProgress: {
    color: '#10B981', // Vert pour ceux qui sont derrière
  },
});

export default OpponentCursors;
