export const ABILITIES:{[key: string]: string} = {
    "cha": "Charisma", 
    "con": "Constitution", 
    "dex": "Dexterity",
    "int": "Intellegence",
    "str": "Strength", 
    "wis": "Wisdom",
  }

export const ABILITY_BONUS:{[key:number]: string} = {
    1: '-5',
    2: '-4',
    3: '-4',
    4: '-3',
    5: '-3',
    6: '-2',
    7: '-2',
    8: '-1',
    9: '-1',
    10: '+0',
    11: '+0',
    12: '+1',
    13: '+1',
    14: '+2',
    15: '+2',
    16: '+3',
    17: '+3',
    18: '+4',
    19: '+4',
    20: '+5'
};

export const SKILLS_ABILITY:{[key:string]: string} = {
  'skill-athletics': 'str',
  'skill-acrobatics': 'dex',
  'skill-sleight-of-hand': 'dex',
  'skill-stealth': 'dex',
  'skill-arcana': 'int',
  'skill-history': 'int',
  'skill-investigation': 'int',
  'skill-nature': 'int',
  'skill-religion': 'int',
  'skill-animal-handling': 'wis',
  'skill-insight': 'wis',
  'skill-medicine': 'wis',
  'skill-perception': 'wis',
  'skill-survival': 'wis',
  'skill-deception': 'cha',
  'skill-intimidation': 'cha',
  'skill-performance': 'cha',
  'skill-persuasion': 'cha'
};