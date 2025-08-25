import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { globalMultiplayerService } from '../services/globalMultiplayerService';

const InlineCountdown = ({ roomId, onCountdownEnd }) => {
  const [countdown, setCountdown] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    let interval;
    
    const checkCountdown = async () => {
      try {
        const status = await globalMultiplayerService.getCountdownStatus(roomId);
        
        if (status && status.active) {
          setCountdown(status.remaining);
          setIsActive(true);
          
          // Animation du nombre
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.2,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
          
          // Si le countdown est fini, appeler le callback
          if (status.remaining <= 0) {
            setIsActive(false);
            if (onCountdownEnd) {
              onCountdownEnd();
            }
          }
        } else {
          setIsActive(false);
          setCountdown(null);
        }
      } catch (error) {
        console.error('❌ Erreur vérification countdown:', error);
      }
    };

    // Vérifier immédiatement
    checkCountdown();
    
    // Puis vérifier toutes les secondes
    interval = setInterval(checkCountdown, 1000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [roomId]);

  if (!isActive || countdown === null) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.countdownBanner}>
        <View style={styles.iconContainer}>
          <Animated.Text style={[styles.countdownNumber, { transform: [{ scale: scaleAnim }] }]}>
            {countdown}
          </Animated.Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.countdownTitle}>Partie commence dans</Text>
          <Text style={styles.countdownSubtitle}>
            {countdown > 1 ? `${countdown} secondes` : 'Préparez-vous !'}
          </Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${Math.max(0, (15 - countdown) / 15 * 100)}%` }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  countdownNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  textContainer: {
    flex: 1,
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  countdownSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
});

export default InlineCountdown;
