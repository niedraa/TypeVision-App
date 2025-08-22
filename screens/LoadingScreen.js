import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const LoadingScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation du logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de rotation continue
    const rotateAnimation = () => {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => rotateAnimation());
    };
    rotateAnimation();

    // Animation de la barre de progression
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.7],
  });

  return (
    <View style={styles.container}>
      {/* Logo animé */}
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logo}>
          <View style={styles.logoLine1} />
          <View style={styles.logoLine2} />
          <View style={styles.logoLine3} />
        </View>
      </Animated.View>

      {/* Titre */}
      <Animated.Text 
        style={[styles.title, { opacity: fadeAnim }]}
      >
        TypeVision
      </Animated.Text>

      {/* Spinner de chargement */}
      <Animated.View 
        style={[
          styles.spinner,
          {
            transform: [{ rotate: spin }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.spinnerInner} />
      </Animated.View>

      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            { width: progressWidth },
          ]}
        />
      </View>

      {/* Texte de chargement */}
      <Animated.Text 
        style={[styles.loadingText, { opacity: fadeAnim }]}
      >
        Chargement en cours...
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLine1: {
    width: 50,
    height: 8,
    backgroundColor: '#4299E1',
    marginBottom: 4,
    borderRadius: 4,
  },
  logoLine2: {
    width: 40,
    height: 8,
    backgroundColor: '#48BB78',
    marginBottom: 4,
    borderRadius: 4,
  },
  logoLine3: {
    width: 30,
    height: 8,
    backgroundColor: '#ED8936',
    borderRadius: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 60,
    textAlign: 'center',
  },
  spinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#4299E1',
    marginBottom: 40,
  },
  spinnerInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRightColor: '#48BB78',
  },
  progressContainer: {
    width: width * 0.7,
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    marginBottom: 30,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4299E1',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});

export default LoadingScreen;
