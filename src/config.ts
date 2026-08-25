export const APP = {
  shortName: "TDCTF",
  fullName: "Tradevis CTF",
  title: "TDCTF - Capture The Flag Platform & Cybersecurity Competition Arena",
  description: "TDCTF (Tradevis CTF) adalah platform kompetisi Capture The Flag (CTF) dan cybersecurity training modern. Selesaikan tantangan Web Exploitation, Cryptography, Reverse Engineering, Forensics, Binary Exploitation (Pwn), dan Blockchain.",

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
