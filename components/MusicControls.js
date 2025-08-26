import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import musicService from '../services/MusicService';

const MusicControls = ({ style = {} }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Synchroniser l'état avec le service
    setIsPlaying(musicService.getPlayingStatus());
  }, []);

  const toggleMusic = async () => {
    await musicService.toggleMusic();
    setIsPlaying(musicService.getPlayingStatus());
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.button} onPress={toggleMusic}>
        <Text style={styles.buttonText}>
          {isPlaying ? '⏸️' : '▶️'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    padding: 5,
    margin: 10,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
  },
});

export default MusicControls;
