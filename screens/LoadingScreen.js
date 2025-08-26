import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const { width, height } = Dimensions.get('window');

const LoadingScreen = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const logoTextAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  // Styles dynamiques basés sur le thème
  const styles = createStyles(theme);

  useEffect(() => {
    // Animation du logo principal
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Animation du texte avec délai
      Animated.timing(logoTextAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de pulsation continue
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulseAnimation());
    };
    
    // Animation des points de chargement
    const dotAnimation = () => {
      Animated.sequence([
        Animated.timing(dot1Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(dot1Anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => dotAnimation());
    };
    
    // Démarrer les animations avec délai
    setTimeout(pulseAnimation, 1000);
    setTimeout(dotAnimation, 1500);
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo Principal TypeVision */}
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) }
            ]
          }
        ]}
      >
        {/* Icône stylisée identique au menu principal */}
        <View style={styles.logoIcon}>
          <View style={styles.logo}>
            <View style={styles.logoLine1} />
            <View style={styles.logoLine2} />
            <View style={styles.logoLine3} />
          </View>
        </View>
        
        {/* Texte TypeVision */}
        <Animated.View 
          style={[
            styles.logoTextContainer,
            {
              opacity: logoTextAnim,
              transform: [{
                translateY: logoTextAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }
          ]}
        >
          <Text style={styles.logoText}>TypeVision</Text>
          <Text style={styles.logoSubtext}>{t('masterTyping')}</Text>
        </Animated.View>
      </Animated.View>

      {/* Indicateur de chargement */}
      <Animated.View 
        style={[
          styles.loadingIndicator,
          { opacity: logoTextAnim }
        ]}
      >
        <View style={styles.loadingDots}>
          <Animated.View style={[
            styles.dot, 
            { 
              transform: [{ 
                scale: dot1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1.2]
                })
              }],
              opacity: dot1Anim 
            }
          ]} />
          <Animated.View style={[
            styles.dot, 
            { 
              transform: [{ 
                scale: dot2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1.2]
                })
              }],
              opacity: dot2Anim 
            }
          ]} />
          <Animated.View style={[
            styles.dot, 
            { 
              transform: [{ 
                scale: dot3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1.2]
                })
              }],
              opacity: dot3Anim 
            }
          ]} />
        </View>
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </Animated.View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Même fond que le menu principal
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoIcon: {
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLine1: {
    width: 60,
    height: 12,
    backgroundColor: theme.colors.text, // Même couleur que le menu
    borderRadius: 6,
    marginBottom: 6,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoLine2: {
    width: 45,
    height: 12,
    backgroundColor: theme.colors.text,
    borderRadius: 6,
    marginBottom: 6,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoLine3: {
    width: 30,
    height: 12,
    backgroundColor: theme.colors.text,
    borderRadius: 6,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoTextContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.text, // Même couleur que le menu
    marginBottom: 8,
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 16,
    color: theme.colors.textSecondary, // Gris cohérent avec le menu
    fontWeight: '300',
    letterSpacing: 1,
  },
  loadingIndicator: {
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.textTertiary, // Gris pour les points de chargement
    marginHorizontal: 4,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary, // Gris cohérent
    fontWeight: '300',
  },
});

export default LoadingScreen;
