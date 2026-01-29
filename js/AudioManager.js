export class AudioManager {
  constructor(Babylon, scene) {
    this.BABYLON = Babylon;
    this.scene = scene;
    this.pingFX;
    this.warmPiano;
    this.error;

    this.loadSounds();
  }

  async loadSounds() {
      const audioEngine = await BABYLON.CreateAudioEngineAsync();
      // Wait for the audio engine to unlock
      await audioEngine.unlockAsync();

    this.pingFX = new this.BABYLON.CreateSoundAsync("Ping", "./audio/ping.mp3", {
      loop: false,
      autoplay: false,
    });

    this.warmPiano = new this.BABYLON.CreateSoundAsync("WarmPiano", "./audio/warm-piano.mp3",{
      loop: true,
      autoplay: false,
      volume: 0.3,
    });

    this.error = new this.BABYLON.CreateSoundAsync("error", "./audio/error.mp3",{
      loop: false,
      autoplay: false,
      volume: 1.0,
    });
  }

}