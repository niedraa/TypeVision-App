import { Audio } from 'expo-av';

class AudioService {
  constructor() {
    this.clickSound = null;
    this.isLoaded = false;
  }

  async loadClickSound() {
    try {
      if (this.clickSound) {
        return; // Already loaded
      }

      // Configuration audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Charger le son de clic
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/audio/music/click.mp3'),
        {
          shouldPlay: false,
          isLooping: false,
          volume: 0.7,
        }
      );

      this.clickSound = sound;
      this.isLoaded = true;
      console.log('🔊 Click sound loaded successfully');
    } catch (error) {
      console.warn('⚠️ Could not load click sound:', error);
      this.isLoaded = false;
    }
  }

  async playClickSound() {
    try {
      if (!this.isLoaded) {
        await this.loadClickSound();
      }

      if (this.clickSound) {
        // Rembobiner le son au début et le jouer
        await this.clickSound.replayAsync();
      }
    } catch (error) {
      console.warn('⚠️ Could not play click sound:', error);
    }
  }

  async unloadClickSound() {
    try {
      if (this.clickSound) {
        await this.clickSound.unloadAsync();
        this.clickSound = null;
        this.isLoaded = false;
        console.log('🔊 Click sound unloaded');
      }
    } catch (error) {
      console.error('Error unloading click sound:', error);
    }
  }
}

// Créer une instance singleton
const audioService = new AudioService();

export default audioService;