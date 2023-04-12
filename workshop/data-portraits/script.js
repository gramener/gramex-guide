/* exported portraitData, portraitRules */
var portraitData = {
  glass: '',
  continentLiving: '',
  continentBorn: '',
  age: '',
  morning: '',
  sing: '',
  dogorcat: '',
  pets: '',
  phone: '',
  keepPhone: '',
  pencilPen: '',
  introvert: '',
  friends: '',
  money: ''
}
var portraitRules = {
  '.age-0-29': {
    visibility: d => d.age.match(/0-29|30-44|45-59|60\+/) ? 'visible' : 'hidden'
  },
  '.age-30-44': {
    visibility: d => d.age.match(/30-44|45-59|60\+/) ? 'visible' : 'hidden'
  },
  '.age-45-59': {
    visibility: d => d.age.match(/45-59|60\+/) ? 'visible' : 'hidden'
  },
  '.age-60': {
    visibility: d => d.age.match(/60\+/) ? 'visible' : 'hidden'
  },
  '.continent-born': {
    fill: d => continentColor[d.continentBorn] || '#fff'
  },
  '.continent-living': {
    fill: d => continentColor[d.continentLiving] || '#fff'
  },
  '.half-empty': {
    visibility: d => d.glass == 'half-empty' ? 'visible' : 'hidden'
  },
  '.half-full': {
    visibility: d => d.glass == 'half-full' ? 'visible' : 'hidden'
  },
  '.morning-person': {
    visibility: d => d.morning.match(/Morning person|Both/) ? 'visible' : 'hidden'
  },
  '.night-owl': {
    visibility: d => d.morning.match(/Night owl|Both/) ? 'visible' : 'hidden'
  },
  '.shower-sing': {
    visibility: d => d.sing == 'Yes' ? 'visible' : 'hidden'
  },
  '.shower-no-sing': {
    visibility: d => d.sing == 'No' ? 'visible' : 'hidden'
  },
  '.dog': {
    visibility: d => d.dogorcat.match(/Dog|Both/) ? 'visible' : 'hidden'
  },
  '.cat': {
    visibility: d => d.dogorcat.match(/Cat|Both/) ? 'visible' : 'hidden'
  },
  '.pets-0': {
    visibility: d => d.pets.match(/None|1-3|4-9|10\+/) ? 'visible' : 'hidden'
  },
  '.pets-1-3': {
    visibility: d => d.pets.match(/1-3|4-9|10\+/) ? 'visible' : 'hidden'
  },
  '.pets-4-9': {
    visibility: d => d.pets.match(/4-9|10\+/) ? 'visible' : 'hidden'
  },
  '.pets-10': {
    visibility: d => d.pets.match(/10\+/) ? 'visible' : 'hidden'
  },
  '.phone': {
    fill: d => d.phone == 'iPhone' ? '#F8D34F' : d.phone == 'Android' ? '#72C7B6' : '#fff'
  },
  '.phone-in-bed': {
    visibility: d => d.keepPhone == 'In bed' ? 'visibile' : 'hidden'
  },
  '.phone-arms-reach': {
    visibility: d => d.keepPhone == 'Within arm reach' ? 'visibile' : 'hidden'
  },
  '.phone-same-room': {
    visibility: d => d.keepPhone == 'In the same room but far' ? 'visibile' : 'hidden'
  },
  '.phone-another-room': {
    visibility: d => d.keepPhone == 'In another room' ? 'visibile' : 'hidden'
  },
  '.pencil-pen': {
    'stroke-dasharray': d => d.pencilPen == 'Pen' ? '0 0' : '4 7',
    'stroke': d => d.pencilPen == 'Pen' ? '#333' : d.pencilPen == 'Pencil' ? '#888' : '#fff',
  },
  '.introvert': {
    visibility: d => d.introvert == 'Introvert' ? 'visibile' : 'hidden'
  },
  '.extrovert': {
    visibility: d => d.introvert == 'Extrovert' ? 'visibile' : 'hidden'
  },
  '.friends-0': {
    visibility: d => d.friends.match(/None|1-3|4-9|10\+/) ? 'visible' : 'hidden'
  },
  '.friends-1-3': {
    visibility: d => d.friends.match(/1-3|4-9|10\+/) ? 'visible' : 'hidden'
  },
  '.friends-4-9': {
    visibility: d => d.friends.match(/4-9|10\+/) ? 'visible' : 'hidden'
  },
  '.friends-10': {
    visibility: d => d.friends.match(/10\+/) ? 'visible' : 'hidden'
  },
  '.money': {
    stroke: d => d.money == 'Save it' ? '#3B3B3B' : d.money == 'Spend it' ? '#E28060' : d.money == 'Give it away' ? '#EDC22A' : '#fff'
  }
}
var continentColor = {
  'Africa': '#353BC4',
  'Asia': '#A2A2A2',
  'Europe': '#F04D59',
  'North America': '#EEBE0D',
  'South America': '#FD7310',
  'Oceania': '#49B49E'
}
