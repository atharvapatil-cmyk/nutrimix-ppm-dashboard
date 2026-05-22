export const LJ_SPREADSHEET_ID = '1D2cR7PylAvoXB-wex4h9CgvPzt-s7GAVCho95H2hV5A'
export const DRR_SPREADSHEET_ID = '1sNRNAH2Wv22qnAwoaP8CVM9p21TDw382jGcqABjz3z8'
export const START_YEAR = 2026
export const START_WEEK = 1

export const PACKAGING_ORDER = ['350g Jar', '350g Pouch', '700g Pouch', '1kg Pouch', '400g Pouch', 'Mini', 'Pack']

export const ALL_ISSUE_TYPES = [
  'Infestation', 'Health Issue', 'Foreign Object', 'Product Quality Issue',
  'Taste Issue', 'Mixability Issue', 'Secondary Packaging Issue', 'Primary Packaging Issue',
  'Wrong/Missing Product', 'Delivery Issue', 'Technical Issue'
]

export const EXCLUDE_FROM_PPM = ['Wrong/Missing Product', 'Technical Issue']
export const CRITICAL_ISSUES = ['Infestation', 'Health Issue', 'Foreign Object']

export const RULES: Array<{ name: string; kw: string[] }> = [
  {
    name: 'Infestation',
    kw: ['infestation', 'infested', 'bugs', 'bug', 'insects', 'insect', 'worm', 'worms', 'larva', 'larvae', 'maggot', 'maggots', 'ant', 'ants', 'weevil', 'weevils', 'beetle', 'beetles', 'cockroach', 'cockroaches', 'mold', 'mould', 'mildew', 'fungus', 'fungal', 'keeda', 'keede', 'kida', 'buggs']
  },
  {
    name: 'Health Issue',
    kw: ['medical', 'doctor', 'physician', 'hospital', 'rash', 'swelling', 'throat infection', 'breathing issue', 'chest pain', 'food poisoning', 'contamination', 'digestion', 'digestive', 'bloating', 'bloated', 'gas', 'acidity', 'acid reflux', 'gut health', 'stomach ache', 'stomach pain', 'upset stomach', 'potty', 'loose motion', 'loose stool', 'diarrhea', 'diarrhoea', 'constipation', 'nausea', 'vomit', 'vomiting', 'feeling sick', 'not suiting', 'allergic', 'allergy', 'health issue', 'pet ki', 'pet dard', 'dast', 'ulti', 'chakkar']
  },
  {
    name: 'Foreign Object',
    kw: ['foreign particles', 'foreign object', 'foreign matter', 'hair found', 'hair strand', 'plastic piece', 'plastic found', 'stone', 'stones', 'metal piece', 'wire', 'thread', 'fiber', 'glass', 'foreign body', 'something found']
  },
  {
    name: 'Taste Issue',
    kw: ['taste is bad', 'taste is horrible', 'taste is off', 'taste changed', 'flavor is bad', 'flavour is bad', 'awful taste', 'terrible taste', 'weird after taste', 'bad after taste', 'bitter taste', 'taste like plastic', 'taste like chemical']
  },
  {
    name: 'Mixability Issue',
    kw: ['mixability issue', 'mixing issue', 'not mixing well', 'does not mix', 'too many lumps', 'forming lumps', 'clumping', 'wont dissolve', "won't dissolve", 'floats', 'settles at bottom', 'powder floating', 'hard to mix', 'needs mixer', 'blender required', 'foamy', 'too much foam', 'mixibility']
  },
  {
    name: 'Secondary Packaging Issue',
    kw: ['box damaged', 'box broken', 'box torn', 'box crushed', 'box dented', 'carton damaged', 'carton broken', 'torn carton', 'crushed carton', 'package damaged', 'damaged packaging', 'outer box', 'outer packaging', 'dented', 'squashed', 'smashed', 'crushed', 'wet box', 'soaked box', 'damp box', 'box open', 'carton open', 'tape open', 'tape removed', 'tampered box', 'transit damage', 'damaged in transit', 'shipping damage', 'dibba damage']
  },
  {
    name: 'Primary Packaging Issue',
    kw: ['torn', 'torned', 'tore', 'ripped', 'tear', 'packet torn', 'packet damaged', 'packet cut', 'packet opened', 'pack torn', 'torn from bottom', 'hole in packet', 'seal open', 'seal opened', 'seal missing', 'seal broken', 'seal damaged', 'unsealed', 'not sealed', 'seal tampered', 'seal loose', 'seal removed', 'leak', 'leaked', 'leaking', 'leakage', 'leaky', 'spill', 'spilled', 'spilling', 'spillage', 'moist', 'moisture', 'damp', 'humid', 'soggy', 'cap broken', 'cap missing', 'cap loose', 'lid broken', 'broken', 'cracked', 'damaged bottle', 'qr code tempered', 'qr damaged', 'label torn', 'label damaged', 'label missing', 'expiry missing', 'no expiry', 'date not printed', 'used product', 'already used', 'tampered', 'phata hua', 'phata', 'tuta hua', 'toota', 'packing damage', 'pack damage']
  },
  {
    name: 'Product Quality Issue',
    kw: ['bad smell', 'foul smell', 'rancid', 'stink', 'stinky', 'expired', 'expiry', 'near expiry', 'old batch', 'stale', 'spoiled', 'discoloration', 'discolored', 'different color', 'kharab quality', 'bekaar quality', 'quantity shortage', 'less quantity', 'less powder', 'short quantity', 'half filled', 'half full', 'less weight', 'underweight', 'kam powder', 'curdle', 'curdled', 'curdling', 'dirty', 'contaminated', 'impurity', 'looks old', 'smell buri', 'sweetness', 'too sweet']
  },
  {
    name: 'Wrong/Missing Product',
    kw: ['wrong product', 'wrong item', 'different product', 'incorrect product', 'not what i ordered', 'received different', 'got different', 'wrong order', 'wrong delivery', 'mix up', 'mixed up', 'received little joys', 'received salt', 'different brand', 'wrong flavor', 'wrong variant', 'missing', 'missed', 'not included', 'not there', 'not present', "didn't get", "didn't find", "couldn't find", 'ordered 2 but received 1', 'only received 1', 'received only one', 'got only one', 'incomplete order', 'no scoop', 'missing scoop', 'where is my protein', 'kam mila', 'pura nahi mila', 'adhura mila', 'missing hai', 'cx ordered', 'he ordered', 'they ordered']
  },
  {
    name: 'Delivery Issue',
    kw: ['rto', 'rtoed', 'return to origin', 'returned to origin', 'not received', 'not delivered', 'didnt receive', "didn't receive", 'never received', 'never got', 'missing delivery', 'missing order', 'where is my order', 'fake delivery', 'false delivery', 'marked delivered but not received', 'marked as delivered', 'shows delivered', 'fake attempt', 'delivery boy', 'nobody came', 'no one came', 'delay', 'delayed', 'late delivery', 'taking too long', 'stuck', 'stuck in transit', 'stuck at hub', 'not moving', 'order canceled', 'order cancelled', 'seller cancelled', 'shipment refused', 'lost', 'lost in transit', 'lost package', 'misrouted', 'wrong address', 'address issue', 'courier issue', 'logistics', 'lsp', 'delhivery', 'bluedart', 'ekart', 'nahi mila', 'kab milega', 'courier wala', 'empty box', 'empty package', 'nothing inside', 'box was empty', 'khali box', 'khali packet']
  },
  {
    name: 'Technical Issue',
    kw: ['website', 'web site', 'webpage', 'page error', 'app error', 'app crash', 'payment failure', 'payment error', 'checkout error', 'transaction failed', 'card declined', 'order issue', "can't place order", 'coupon', 'coupon code', 'discount', 'promo', 'promo code', 'refund', 'cancel order', 'cancellation']
  }
]
