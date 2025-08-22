import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Animated } from 'react-native';
import { SlideTransition } from '../components/Transitions';
import { AnimatedButton } from '../components/AnimatedButton';

// Composant pour l'icône volcanique
const VolcanicIcon = () => (
  <View style={[styles.iconContainer, { backgroundColor: '#FF6B35' }]}>
    <View style={styles.volcanicBase} />
    <View style={styles.volcanicPeak} />
    <View style={styles.volcanicSmoke1} />
    <View style={styles.volcanicSmoke2} />
    <View style={styles.volcanicSmoke3} />
  </View>
);

// Composant pour l'icône aquatique
const AquaticIcon = () => (
  <View style={[styles.iconContainer, { backgroundColor: '#00B4DB' }]}>
    <View style={styles.aquaticFish} />
    <View style={styles.aquaticCoral1} />
    <View style={styles.aquaticCoral2} />
    <View style={styles.aquaticBubble1} />
    <View style={styles.aquaticBubble2} />
    <View style={styles.aquaticBubble3} />
  </View>
);

// Composant pour l'icône nuageuse
const CloudyIcon = () => (
  <View style={[styles.iconContainer, { backgroundColor: '#74b9ff' }]}>
    <View style={styles.cloudMain} />
    <View style={styles.cloudLeft} />
    <View style={styles.cloudRight} />
    <View style={styles.cloudSmall} />
  </View>
);

const StoryScreen = ({ onBack }) => {
  const storyModes = [
    {
      id: 1,
      title: 'Volcanique',
      bgGradient: {
        colors: ['#FF6B35', '#F7931E'],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 }
      }
    },
    {
      id: 2,
      title: 'Aquatique',
      bgGradient: {
        colors: ['#00B4DB', '#0083B0'],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 }
      }
    },
    {
      id: 3,
      title: 'Nuageux',
      bgGradient: {
        colors: ['#74b9ff', '#a29bfe'],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 }
      }
    }
  ];

  const handleStorySelect = (story) => {
    console.log('Histoire sélectionnée:', story.title);
    // Ici on pourrait naviguer vers l'histoire spécifique
  };

  return (
    <SlideTransition direction="right">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
        
        {/* Bouton retour */}
        <AnimatedButton 
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backArrow}>{'<'}</Text>
        </AnimatedButton>

        <View style={styles.header}>
          <Text style={styles.title}>Story Mode</Text>
        </View>

        <View style={styles.storiesContainer}>
          {storyModes.map((story, index) => {
            let IconComponent;
            if (index === 0) IconComponent = VolcanicIcon;
            else if (index === 1) IconComponent = AquaticIcon;
            else IconComponent = CloudyIcon;

            return (
              <AnimatedButton
                key={story.id}
                style={styles.storyItem}
                onPress={() => handleStorySelect(story)}
              >
                <IconComponent />
                
                <View style={styles.textContainer}>
                  <Text style={styles.storyTitle}>{story.title}</Text>
                </View>
                
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>{'>'}</Text>
                </View>
              </AnimatedButton>
            );
          })}
        </View>
      </SafeAreaView>
    </SlideTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'left',
  },
  storiesContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  storyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  // Styles pour l'icône volcanique
  volcanicBase: {
    position: 'absolute',
    bottom: 10,
    width: 50,
    height: 30,
    backgroundColor: '#8B4513',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  volcanicPeak: {
    position: 'absolute',
    bottom: 30,
    width: 20,
    height: 20,
    backgroundColor: '#FF4500',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  volcanicSmoke1: {
    position: 'absolute',
    top: 10,
    left: 35,
    width: 8,
    height: 8,
    backgroundColor: '#FFE4B5',
    borderRadius: 4,
    opacity: 0.8,
  },
  volcanicSmoke2: {
    position: 'absolute',
    top: 15,
    left: 40,
    width: 6,
    height: 6,
    backgroundColor: '#FFFF99',
    borderRadius: 3,
    opacity: 0.6,
  },
  volcanicSmoke3: {
    position: 'absolute',
    top: 8,
    left: 30,
    width: 5,
    height: 5,
    backgroundColor: '#FFFACD',
    borderRadius: 2.5,
    opacity: 0.7,
  },
  // Styles pour l'icône aquatique
  aquaticFish: {
    position: 'absolute',
    left: 15,
    top: 25,
    width: 16,
    height: 10,
    backgroundColor: '#FF8C42',
    borderRadius: 8,
  },
  aquaticCoral1: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    width: 12,
    height: 25,
    backgroundColor: '#2E8B57',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  aquaticCoral2: {
    position: 'absolute',
    bottom: 10,
    right: 25,
    width: 8,
    height: 20,
    backgroundColor: '#32CD32',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  aquaticBubble1: {
    position: 'absolute',
    top: 15,
    right: 20,
    width: 6,
    height: 6,
    backgroundColor: '#E0F6FF',
    borderRadius: 3,
    opacity: 0.8,
  },
  aquaticBubble2: {
    position: 'absolute',
    top: 10,
    right: 30,
    width: 4,
    height: 4,
    backgroundColor: '#F0F8FF',
    borderRadius: 2,
    opacity: 0.9,
  },
  aquaticBubble3: {
    position: 'absolute',
    top: 20,
    right: 35,
    width: 3,
    height: 3,
    backgroundColor: '#F8F8FF',
    borderRadius: 1.5,
    opacity: 0.7,
  },
  // Styles pour l'icône nuageuse
  cloudMain: {
    position: 'absolute',
    top: 25,
    width: 35,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
  },
  cloudLeft: {
    position: 'absolute',
    top: 30,
    left: 15,
    width: 15,
    height: 15,
    backgroundColor: '#F0F8FF',
    borderRadius: 7.5,
  },
  cloudRight: {
    position: 'absolute',
    top: 30,
    right: 15,
    width: 15,
    height: 15,
    backgroundColor: '#F0F8FF',
    borderRadius: 7.5,
  },
  cloudSmall: {
    position: 'absolute',
    top: 15,
    right: 25,
    width: 12,
    height: 8,
    backgroundColor: '#E6F3FF',
    borderRadius: 6,
  },
  storyIcon: {
    fontSize: 40,
  },
  textContainer: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
  },
  arrowContainer: {
    marginLeft: 10,
  },
  arrow: {
    fontSize: 20,
    color: '#7F8C8D',
    fontWeight: '600',
  },
});

export default StoryScreen;
