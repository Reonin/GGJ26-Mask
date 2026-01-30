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

    const soundMap = {
    a: "8128__bliss__brownnoiseperc3.wav",
    b: "22785__franciscopadilla__blow.wav",
    c: "22786__franciscopadilla__clap-hollow.wav",
    d: "35905__syna-max__bbop.wav",
    e: "35906__syna-max__bing.wav",
    f: "68134__robinhood76__00888-gride-2.wav",
    g: "121386__soundbytez__claves_hit04.wav",
    h: "174167__robinhood76__hh-istanbul-open-pedal-mid.wav",
    i: "177911__medetix__pc-sloppy-bass.wav",
    j: "231238__akshaylaya__thom_e_132.wav",
    k: "321806__lloydevans09__plunger_pop_2.wav",
    l: "322218__liamg_sfx__arrow-fly-by-2.wav",
    m: "328251__reklamacja__warsztat-13.wav",
    n: "347403__fotis_p__light-switch.wav",
    o: "377594__yudena__hm_bymondfisch89.ogg",
    p: "391627__relachi__burp.wav",
    q: "394507__raularaujo__sample-1.wav",
    r: "394508__raularaujo__sample-2.wav",
    s: "399252__javierjdf26__handbrake.wav",
    t: "427069__dannaye__doors-open-outside.wav",
    u: "429373__carolinagg__3-ahh.wav",
    v: "458484__lidem_soundfx__claque_melon_moyen_mono_maxence_moogin.wav",
    w: "566099__dundalkkirk__softhit2.wav",
    x: "589862__bakhmutzki__fart-16bit-in-d.wav",
    y: "221493__lloydevans09__paper_rub.wav",
    z: "791314__abominablemusic__rolandcr78_tamb2_6000.wav"
  };

  const options = { loop: false, autoplay: false, volume: 1.0 };

  // Loop through the map and assign to this[key]
  Object.entries(soundMap).forEach(([key, fileName]) => {
    this[key] = new this.BABYLON.CreateSoundAsync(key, `./audio/${fileName}`, options);
  });

  }

  playKey(key){
    // console.warn(key);
    this[key].then(s => s.play());
  }
}