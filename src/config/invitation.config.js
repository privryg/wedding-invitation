/**
 * Invitation content configuration.
 *
 * This is the single source of truth for the wedding's data. Every bounded
 * context (cover, couple, event, gift, rsvp, guestbook, …) reads the slice it
 * needs from here, so re-skinning the invitation for another couple means
 * editing only this file.
 */

export const couple = {
  displayNames: 'Ryan & Eci',
  shortMonogram: 'R & E',
  heading: 'Bride & Groom',
  intro:
    'Kami akan segera melangsungkan pernikahan, dan kami akan sangat berbahagia apabila Anda berkenan hadir untuk menjadi bagian dari hari istimewa kami.',
  groom: {
    nick: 'Ryan',
    photo: '/assets/groom.jpg',
    full: 'Ryan Garnet Andrianto',
    parentsLabel: 'Putra dari',
    parents: 'Bapak Andreas Mauw<br>& Ibu Nurhasanah',
  },
  bride: {
    nick: 'Eci',
    photo: '/assets/bride.jpg',
    full: 'Eka Dessy Indah Fitriani',
    parentsLabel: 'Putri dari',
    parents: 'Bapak Eko Agus Mulyono<br>& Ibu Paramita',
  },
}

export const event = {
  // Used by the countdown + calendar link.
  dateISO: '2026-08-08T11:00:00+07:00',
  dayLabel: 'SABTU · 08 · 08 · 2026',
  longDate: 'Sabtu, 8 Agustus 2026',
  cardTitle: 'Akad & Resepsi',
  when: 'Sabtu, 08 Agustus 2026',
  time: 'Pukul 11.00 – 14.00 WIB',
  venue: 'Grand Javanila',
  address: 'Tuban, Jawa Timur',
  mapsUrl: 'https://www.google.com/maps/search/Grand+Javanila+Tuban',
  copyAddress: 'Grand Javanila, Tuban, Jawa Timur',
  calendar: {
    text: 'Akad & Resepsi — Ryan & Eci',
    // 11.00-14.00 WIB == 04:00-07:00 UTC
    dates: '20260808T040000Z/20260808T070000Z',
    details: 'Undangan pernikahan Ryan & Eci',
    location: 'Grand Javanila, Tuban, Jawa Timur',
  },
}

export const greeting = {
  salam: 'Assalamu’alaikum Wr. Wb.',
  intro:
    'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.',
  ayat:
    '“Dan di antara tanda-tanda kekuasaan-Nya, Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.”',
  ayatSource: '— QS. Ar-Rum : 21 —',
}

export const storyIntro =
  'Every love story is beautiful, but ours is my favorite.'

export const storyClosing =
  'Dan kini, kami siap untuk menulis babak baru dalam cinta kami selamanya.'

/** Transcribed from the Love Story artwork so the copy stays readable and editable. */
export const story = [
  {
    step: '01',
    head: 'Awal Bertemu',
    text: 'Sebuah pertemuan sederhana di sebuah cafe. Kita berpapasan tanpa sengaja, namun ada rasa yang membuat kita saling memperhatikan.',
    illustration: '/assets/story-1.png',
  },
  {
    step: '02',
    head: 'Tertarik & Berkenalan',
    text: 'Rasa penasaran berubah menjadi ketertarikan. Kami memberanikan diri untuk berkenalan, memulai percakapan kecil yang terasa begitu hangat.',
    illustration: '/assets/story-2.png',
  },
  {
    step: '03',
    head: 'Bertukar Sosial Media',
    text: 'Percakapan berlanjut, dan kami bertukar sosial media untuk tetap terhubung. Dari sana, kisah kami mulai tumbuh.',
    illustration: '/assets/story-3.png',
  },
  {
    step: '04',
    head: 'Perjalanan Bersama',
    text: 'Dari pertemuan tak terduga, menjadi pilihan hati yang tak terpisahkan. Terima kasih Tuhan, kami dipertemukan untuk saling melengkapi.',
    illustration: '/assets/story-4.png',
  },
]


export const gallery = [
  '/assets/gallery-1.jpg',
  '/assets/gallery-2.jpg',
  '/assets/gallery-4.jpg',
  '/assets/gallery-8.jpg',
]

export const gifts = [
  {
    bank: 'Bank BCA',
    logo: '/assets/bca.png',
    number: '1851514282',
    holder: 'a.n. Ryan Garnet Andrianto',
    copyValue: '1851514282',
    copyLabel: 'Salin No. Rekening',
  },
  {
    bank: 'Bank BRI',
    logo: '/assets/bri.png',
    number: '657901029994532',
    holder: 'a.n. Eka Dessy Indah Fitriani',
    copyValue: '657901029994532',
    copyLabel: 'Salin No. Rekening',
  },
]

/** Sub-headings that split the gift section into transfer vs. parcel. */
export const giftHeadings = {
  transfer: 'Amplop Digital :',
  parcel: 'Kirim Kado :',
}

/** Physical address for guests who prefer to send a gift rather than transfer. */
export const giftAddress = {
  icon: '/assets/kado.png',
  // `address` renders on the card: non-breaking spaces keep "Gg. 1",
  // "RT 2 / RW 1" and "No. 57" from splitting across lines.
  // `copyValue` stays plain so pasted text has ordinary spaces.
  address: 'Jl. Panglima Sudirman, Desa Sukolilo, Gg. 1, RT 2 / RW 1, No. 57, Tuban',
  recipient: 'a.n. Eka Dessy Indah Fitriani',
  copyValue: 'Jl. Panglima Sudirman, Desa Sukolilo, Gg. 1, RT 2 / RW 1, No. 57, Tuban',
  copyLabel: 'Salin Alamat',
}

export const invitedFamilies = [
  'Keluarga Bapak Andreas Mauw',
  'Keluarga Ibu Nurhasanah',
  'Keluarga Bapak Eko Agus Mulyono',
  'Keluarga Ibu Paramita',
  'Sahabat & Rekan',
]

export const closing = {
  body:
    'Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.',
  wassalam: 'Wassalamu’alaikum Wr. Wb.',
  sign: 'Ryan & Eci',
  footDate: '08 · 08 · 2026',
  footNote: 'with love, Ryan & Eci',
}

export const defaultGuestName = 'Tamu Undangan'
