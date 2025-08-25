import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const LiveTypingIndicator = ({ players, currentPlayerId }) => {
  const [animations] = useState({});
  
  const opponents = Object.values(players).filter(player => 
    player.id !== currentPlayerId && 
    player.typingState && 
    player.typingState.currentText
  );

  useEffect(() => {
    // Animer l'apparition de nouveaux caractères
    opponents.forEach(opponent => {
      if (!animations[opponent.id]) {
        animations[opponent.id] = new Animated.Value(0);
      }
      
      Animated.sequence([
        Animated.timing(animations[opponent.id], {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animations[opponent.id], {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    });
  }, [opponents]);

  if (opponents.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🖥️ Frappes en temps réel</Text>
      {opponents.map((opponent) => {
        const lastChars = opponent.typingState.currentText?.slice(-15) || '';
        
        return (
          <Animated.View 
            key={opponent.id} 
            style={[
              styles.typingRow,
              {
                opacity: animations[opponent.id] || 1,
                transform: [{
                  scale: animations[opponent.id] ? 
                    animations[opponent.id].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1.05]
                    }) : 1
                }]
              }
            ]}
          >
            <View style={styles.playerInfo}>
              <View 
                style={[
                  styles.colorDot, 
                  { backgroundColor: opponent.color || '#666' }
                ]} 
              />
              <Text style={styles.playerName}>{opponent.name}</Text>
            </View>
            <View style={styles.typingDisplay}>
              <Text style={styles.typingText}>
                {lastChars}
                <Text style={[styles.cursor, { color: opponent.color || '#666' }]}>|</Text>
              </Text>
            </View>
          </Animated.View>
        );
      })}
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
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingVertical: 4,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  playerName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  typingDisplay: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  typingText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
  cursor: {
    fontWeight: 'bold',
    opacity: 0.8,
  },
});

export default LiveTypingIndicator;
