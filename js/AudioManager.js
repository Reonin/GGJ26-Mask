export class AudioManager {
  constructor(Babylon, scene) {
    this.BABYLON = Babylon;
    this.scene = scene;
    this.pingFX;
    this.warmPiano;
    this.error;

  // Initialize the alphabet keys as an object
  this.keys = {};
  "abcdefghijklmnopqrstuvwxyz".split("").forEach(char => {
    this.keys[char] = null;
  });
    this.loadSounds();
  }

  async loadSounds() {
      const audioEngine = await this.BABYLON.CreateAudioEngineAsync();
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

    /***Alphabet Sounds */

    this.a = new this.BABYLON.CreateSoundAsync("a", "./audio/8128__bliss__brownnoiseperc3.wav",{
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.b = new this.BABYLON.CreateSoundAsync("b", "./audio/22785__franciscopadilla__blow.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.c = new this.BABYLON.CreateSoundAsync("c", "./audio/22786__franciscopadilla__clap-hollow.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.d = new this.BABYLON.CreateSoundAsync("d", "./audio/35905__syna-max__bbop.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.e = new this.BABYLON.CreateSoundAsync("e", "./audio/35906__syna-max__bing.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.f = new this.BABYLON.CreateSoundAsync("f", "./audio/68134__robinhood76__00888-gride-2.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.g = new this.BABYLON.CreateSoundAsync("g", "./audio/121386__soundbytez__claves_hit04.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.h = new this.BABYLON.CreateSoundAsync("h", "./audio/174167__robinhood76__hh-istanbul-open-pedal-mid.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.i = new this.BABYLON.CreateSoundAsync("i", "./audio/177911__medetix__pc-sloppy-bass.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.j = new this.BABYLON.CreateSoundAsync("j", "./audio/231238__akshaylaya__thom_e_132.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.k = new this.BABYLON.CreateSoundAsync("k", "./audio/321806__lloydevans09__plunger_pop_2.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.l = new this.BABYLON.CreateSoundAsync("l", "./audio/322218__liamg_sfx__arrow-fly-by-2.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.m = new this.BABYLON.CreateSoundAsync("m", "./audio/328251__reklamacja__warsztat-13.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.n = new this.BABYLON.CreateSoundAsync("n", "./audio/347403__fotis_p__light-switch.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.o = new this.BABYLON.CreateSoundAsync("o", "./audio/377594__yudena__hm_bymondfisch89.ogg", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.p = new this.BABYLON.CreateSoundAsync("p", "./audio/391627__relachi__burp.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.q = new this.BABYLON.CreateSoundAsync("q", "./audio/394507__raularaujo__sample-1.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.r = new this.BABYLON.CreateSoundAsync("r", "./audio/394508__raularaujo__sample-2.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.s = new this.BABYLON.CreateSoundAsync("s", "./audio/399252__javierjdf26__handbrake.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.t = new this.BABYLON.CreateSoundAsync("t", "./audio/427069__dannaye__doors-open-outside.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.u = new this.BABYLON.CreateSoundAsync("u", "./audio/429373__carolinagg__3-ahh.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.v = new this.BABYLON.CreateSoundAsync("v", "./audio/458484__lidem_soundfx__claque_melon_moyen_mono_maxence_moogin.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.w = new this.BABYLON.CreateSoundAsync("w", "./audio/566099__dundalkkirk__softhit2.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.x = new this.BABYLON.CreateSoundAsync("x", "./audio/589862__bakhmutzki__fart-16bit-in-d.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.y = new this.BABYLON.CreateSoundAsync("y", "./audio/221493__lloydevans09__paper_rub.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

    this.z = new this.BABYLON.CreateSoundAsync("z", "./audio/791314__abominablemusic__rolandcr78_tamb2_6000.wav", {
      loop: false,
      autoplay: false,
      volume: 1.0,
    });

  }

  playKey(key){
    // console.warn(key);
    this[key].then(s => s.play());
  }
}