import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';
import { AnimatedButton } from '../components/AnimatedButton';
import { SlideTransition } from '../components/Transitions';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function MultiplayerScreen({ onBack }) {
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
          <Text style={styles.mainTitle}>Multijoueur</Text>

          {/* Section Options de jeu */}
          <View style={styles.section}>
            {/* Partie rapide */}
            <TouchableOpacity style={styles.optionCard}>
              <View style={styles.optionContent}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="people" size={32} color="#333" />
                </View>
                <Text style={styles.optionText}>Partie rapide</Text>
              </View>
            </TouchableOpacity>

            {/* Créer/Rejoindre un salon */}
            <TouchableOpacity style={styles.optionCard}>
              <View style={styles.optionContent}>
                <View style={styles.iconContainer}>
                  <View style={styles.gridIcon}>
                    <View style={[styles.gridDot, { top: 4, left: 4 }]} />
                    <View style={[styles.gridDot, { top: 4, right: 4 }]} />
                    <View style={[styles.gridDot, { bottom: 4, left: 4 }]} />
                    <View style={[styles.gridDot, { bottom: 4, right: 4 }]} />
                  </View>
                </View>
                <Text style={styles.optionText}>Créer/Rejoindre un salon</Text>
              </View>
            </TouchableOpacity>

            {/* Inviter un ami */}
            <TouchableOpacity style={styles.optionCard}>
              <View style={styles.optionContent}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="person-add" size={32} color="#333" />
                </View>
                <Text style={styles.optionText}>Inviter un ami</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Section Salons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Salons</Text>
            
            {/* Zone de saisie du code de salon */}
            <View style={styles.roomCodeContainer}>
              <TextInput
                style={styles.roomCodeInput}
                placeholder="Code de salon"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Bouton Rejoindre */}
          <View style={styles.joinButtonContainer}>
            <AnimatedButton
              style={styles.joinButton}
              onPress={() => {}}
            >
              <Text style={styles.joinButtonText}>Rejoindre</Text>
            </AnimatedButton>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333',
    marginBottom: 40,
    marginTop: 20,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  gridIcon: {
    width: 32,
    height: 32,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  gridDot: {
    width: 8,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 2,
    position: 'absolute',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  roomCodeContainer: {
    marginBottom: 20,
  },
  roomCodeInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  joinButtonContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
