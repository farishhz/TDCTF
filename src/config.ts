export const APP = {
  shortName: "TDCTF",
  fullName: "TDCTF",
  description: "Platform CTF dengan integrasi Next.js dan Supabase, dikembangkan khusus oleh Alfarisi Tenka Developer",

  image_icon: "favicon.ico",
  image_logo: "logo.png",
  image_preview: "og-image.png",

  /* Setting Config */
  notifSolves: true, // notifikasi global saat ada yang solve challenge

  teams: {
    enabled: true,
    hideScoreboardIndividual: false,
    hidescoreboardTotal: false,
  },

  difficultyStyles: {
    Baby: 'cyan',
    Easy: 'green',
    Medium: 'yellow',
    Hard: 'red',
    Insane: 'purple',
  },
}

export default APP
