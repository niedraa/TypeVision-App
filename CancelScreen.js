import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function CancelScreen({ onBack }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.cancelIcon}>
          <Text style={styles.cross}>✕</Text>
        </View>
        <Text style={styles.title}>Paiement Annulé</Text>
        <Text style={styles.message}>
          Votre paiement a été annulé. Aucun montant n'a été débité.
        </Text>
        <TouchableOpacity style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Retour au Shop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  content: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F56565',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cross: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#4299E1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
