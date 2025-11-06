import FREE_CONFIG from '../free/config';

const CONFIG = {
  "tier": "pro",
  "themes": [
    ...FREE_CONFIG.themes,
    "dreamy_lights",
    "club_stage",
    "retro_wave",
    "neon_city",
    "concert_hall"
  ],
  "background_animations": [
    ...FREE_CONFIG.background_animations,
    "particles_fall",
    "smoke_pulse",
    "electric_grid",
    "color_spectrum",
    "laser_beam"
  ],
  "overlay_animations": [
    ...FREE_CONFIG.overlay_animations,
    "audio_pulse",
    "vinyl_spin",
    "beat_flash",
    "light_rings",
    "frequency_wave"
  ],
  "image_animations": [
    ...FREE_CONFIG.image_animations,
    "pan_diagonal_up",
    "tilt_sway",
    "depth_focus",
    "pulse_soft",
    "vibe_subtle"
  ]
};

export default CONFIG;
