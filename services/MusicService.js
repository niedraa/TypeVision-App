import { Audio } from 'expo-av';

class MusicService {
  constructor() {
    this.sound = null;
    this.isPlaying = false;
    this.volume = 0.5;
    this.isLooping = true;
  }

  async loadMusic() {
    try {
      // Configuration audio simple et compatible
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Tenter de charger le fichier audio
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/audio/music/music.mp3'),
          {
            shouldPlay: false,
            isLooping: this.isLooping,
            volume: this.volume,
          }
        );

        this.sound = sound;
        console.log('🎵 Music loaded successfully');
      } catch (fileError) {
        console.warn('⚠️ Music file not found. Please add music.mp3 to assets/audio/music/ folder');
        // Ne pas lancer d'erreur, juste loguer l'avertissement
        this.sound = null;
      }
    } catch (error) {
      console.error('❌ Error configuring audio:', error);
    }
  }

  async playMusic() {
    try {
      if (!this.sound) {
        await this.loadMusic();
      }

      if (this.sound && !this.isPlaying) {
        await this.sound.playAsync();
        this.isPlaying = true;
        console.log('🎵 Music started playing');
      } else if (!this.sound) {
        console.warn('⚠️ Cannot play music: No audio file loaded');
      }
    } catch (error) {
      console.error('❌ Error playing music:', error);
    }
  }

  async pauseMusic() {
    try {
      if (this.sound && this.isPlaying) {
        await this.sound.pauseAsync();
        this.isPlaying = false;
        console.log('⏸️ Music paused');
      }
    } catch (error) {
      console.error('❌ Error pausing music:', error);
    }
  }

  async stopMusic() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        this.isPlaying = false;
        console.log('⏹️ Music stopped');
      }
    } catch (error) {
      console.error('❌ Error stopping music:', error);
    }
  }

  async setVolume(volume) {
    try {
      this.volume = Math.max(0, Math.min(1, volume)); // Clamp entre 0 et 1
      if (this.sound) {
        await this.sound.setVolumeAsync(this.volume);
        console.log(`Volume set to: ${this.volume}`);
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  async setLooping(isLooping) {
    try {
      this.isLooping = isLooping;
      if (this.sound) {
        await this.sound.setIsLoopingAsync(isLooping);
        console.log(`Looping set to: ${isLooping}`);
      }
    } catch (error) {
      console.error('Error setting looping:', error);
    }
  }

  async toggleMusic() {
    if (this.isPlaying) {
      await this.pauseMusic();
    } else {
      await this.playMusic();
    }
  }

  getPlayingStatus() {
    return this.isPlaying;
  }

  getVolume() {
    return this.volume;
  }

  async unloadMusic() {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
        console.log('Music unloaded');
      }
    } catch (error) {
      console.error('Error unloading music:', error);
    }
  }
}

// Créer une instance singleton
const musicService = new MusicService();

export default musicService;