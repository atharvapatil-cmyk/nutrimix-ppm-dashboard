// Single spreadsheet: contains both LJ (complaints) and Live Sales Data sheets
export const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1D2cR7PylAvoXB-wex4h9CgvPzt-s7GAVCho95H2hV5A'

export const START_YEAR = 2026
export const START_WEEK = 1

export const PACKAGING_ORDER = ['350g Jar','350g Pouch','700g Pouch','1kg Pouch','400g Pouch','Mini','Pack']

export const ALL_ISSUE_TYPES = [
  'Infestation','Health Issue','Foreign Object',
  'Product Quality Issue','Taste Issue','Mixability Issue',
  'Secondary Packaging Issue','Primary Packaging Issue',
  'Wrong/Missing Product','Delivery Issue','Technical Issue'
]

export const EXCLUDE_FROM_PPM = ['Wrong/Missing Product','Technical Issue']
export const CRITICAL_ISSUES  = ['Infestation','Health Issue','Foreign Object']

// Image column header names to search for (checks ALL of them, not just the first)
export const IMAGE_COL_NAMES = [
  'upload images/videos','upload images','image 1','image 2','image 3','image 4','image 5'
]

/**
 * Classification rules — exactly matching the App Script v7 RULES array in order.
 * Product Quality Issue is position 4 (before Taste/Mixability) so taste/smell/quality
 * keywords are caught there first, and Taste/Mixability get the simpler catch-all keywords.
 */
export const RULES: Array<{name: string; kw: string[]}> = [
  { name: 'Infestation', kw: [
    'infestation','infested','bugs','bug','insects','insect','pests','vermin',
    'worm','worms','larva','larvae','maggot','maggots',
    'ant','ants','weevil','weevils','beetle','beetles','cockroach','cockroaches',
    'dead insect','dead bug','crawling','moving','alive','wriggling',
    'mouse','mice','rat','rats','rodent','rodents','gnawed',
    'fungus','fungal','mold','mould','mildew','white fungus',
    'mold growth','fungal infestation','severe mold','severe mould','mould growth',
    'keeda','keede','kide','kida','buggs','bugz','inscts','wrm','wrms'
  ]},
  { name: 'Health Issue', kw: [
    'medical','doctor','physician','hospital','severe reaction',
    'consulted doctor','went to doctor','medical emergency','urgent medical',
    'rash','swelling','throat infection','breathing issue','chest pain',
    'food poisoning','contamination','medical report','prescription',
    'admitted','hospitalized','hospitalised','ambulance',
    'digestion','digestive','bloating','bloated','gas','acidity','acid reflux',
    'gut','gut health','stomach','stomach ache','stomach pain','upset stomach',
    'potty','toilet','loose motion','loose stool','diarrhea','diarrhoea','constipation','motions',
    'bowel','nausea','vomit','vomiting','feeling sick','uneasy feeling',
    'not suiting','allergic reaction','allergy','allergic',
    'health issue','pet ki','pet dard','dast','ulti','ulti aa','chakkar'
  ]},
  { name: 'Foreign Object', kw: [
    'foreign','foreign particles','foreign object','foreign matter',
    'hair found','hairs','strand','hair strand','hair-like strand',
    'plastic piece','plastic found','blue plastic','plastic inside',
    'stone','stones','metal','metal piece','wire','thread','fiber','glass',
    'foreign body','something found','not safe','unsafe','health risk'
  ]},
  // Product Quality Issue is 4th — catches taste/smell/quality before the simpler Taste/Mixability rules
  { name: 'Product Quality Issue', kw: [
    'bad taste','off taste','weird taste','strange taste',
    'bitter','sour','metallic taste','chemical taste','plastic taste',
    'bad smell','foul smell','rancid','stink','stinky','smell','smells','badbu',
    'texture','consistency','clumpy','lumpy','grainy','gritty','powdery',
    'color','colour','discoloration','discolored','different color',
    'expired','expiry','near expiry','old batch','stale','spoiled',
    'kharab quality','bekaar quality','taste kharab','smell buri',
    'sweetness','too sweet','very sweet',
    'safe to give','safe for kids','safe for consumption','safe to eat',
    'lecithin','ingredient','add ingredient','formula',
    'quantity shortage','less quantity','less powder','short quantity',
    'half filled','half full','less weight','underweight','kam powder',
    'curdle','curdled','curdling','milk curdle','doodh phat',
    'dirty','old product','old looking','looks old','contaminated','impurity'
  ]},
  { name: 'Taste Issue', kw: [
    'taste is bad','taste is horrible','taste is off','taste changed',
    'flavor is bad','flavour is bad','awful taste','terrible taste',
    'very bad taste','weird after taste','bad after taste','bitter taste',
    'taste like plastic','taste like chemical',
    'taste','tasting','taste issue','facing taste issue','bad taste product'
  ]},
  { name: 'Mixability Issue', kw: [
    'mixability issue','mixing issue','not mixing well','does not mix',
    'too many lumps','forming lumps','clumping','wont dissolve',"won't dissolve",
    'floats','settles at bottom','powder floating','hard to mix',
    'needs mixer','blender required','shaker not working',
    'foam','foamy','bubbles','froth','too much foam',
    "not mixing","doesn't mix","won't mix",'mixibility problem',"doesn't dissolve",
    'mix','mixing','mixability'
  ]},
  { name: 'Secondary Packaging Issue', kw: [
    'box damaged','box broken','box torn','box crushed','box dented',
    'carton damaged','carton broken','torn carton','crushed carton',
    'package damaged','damaged packaging','poor packaging','bad packaging',
    'outer box','outer packaging','outer carton','dented','squashed',
    'smashed','crushed','crumpled',
    'wet box','wet carton','soaked box','damp box','box wet',
    'box open','carton open','tape open','tape removed','tampered box',
    'transit damage','damaged in transit','shipping damage','rough handling',
    'box toota hua','carton damaged hai','dibba damage','box phata hua',
    'bx','cartn','packging','dammaged','crusht'
  ]},
  { name: 'Primary Packaging Issue', kw: [
    'torn','torned','tore','ripped','tear','tearing','packet torn',
    'packet damaged','packet cut','packet opened','pack torn','pack damaged',
    'torn from bottom','torn from side','cut from side','hole in packet',
    'seal open','seal opened','seal missing','seal broken','seal damaged',
    'unsealed','not sealed','seal tampered','seal loose','seal removed',
    'leak','leaked','leaking','leakage','leaky','product leaked',
    'spill','spilled','spilling','spillage','powder leaked','protein spilled',
    'spilled out','spilled all over','coming out','powder coming out',
    'damaged','damage','damaged product','product damaged',
    'moist','moisture','damp','humid','soggy','product moist',
    'cap broken','cap missing','cap loose','cap open','lid broken','lid missing',
    'broken','cracked','damaged bottle','bottle broken','bottle cracked',
    'container broken','container cracked','jar broken','jar cracked',
    'qr code tempered','qr damaged','qr not working','scan issue',
    'label torn','label damaged','label missing','batch not visible',
    'expiry missing','no expiry','date not printed','details missing',
    'used product','already used','seems used','tampered','tampered product',
    'packet phata hua','seal khula hua','leak ho raha','gila ho gaya',
    'packt','pakcet','leeking','spilld','seel','tamperd',
    'phata hua','phata','tuta hua','tuta','toota','packing damage','pack damage'
  ]},
  { name: 'Wrong/Missing Product', kw: [
    'wrong product','wrong item','different product','incorrect product',
    "not what i ordered","didn't order this",'received different','got different',
    'wrong order','wrong delivery','mix up','mixed up','metal shaker instead',
    'received little joys','received salt','salt instead','different brand',
    "else's product",'wrong flavor','wrong variant','chocolate instead',
    'galat product','alag product','dusra product mila','worng','diferent',
    'missing','missed','not included','not there','not present',
    "didn't get","didn't find","couldn't find",
    'ordered 2 but received 1','ordered 2 kg but received','ordered 1 kg but received',
    'only received 1','received only one','got only one',
    'received 1 instead of 2','got 1 instead of 2',
    'half missing','half kg missing','pack missing','packet missing',
    'quantity missing','items missing','product missing','pcs missing',
    'metal shaker missing','shaker missing','bottle missing','protein missing',
    'missing insert','missing pamphlet','missing scoop','no scoop',
    'sugar board missing','braille text missing',
    'incomplete order','incomplete pack',
    'where is my protein','only got a bottle','where is my 1 kg',
    'kam mila','pura nahi mila','adhura mila','ek hi mila','missing hai',
    'cx ordered','he ordered','they ordered','we ordered'
  ]},
  { name: 'Delivery Issue', kw: [
    'rto','rtoed',"rto'd",'r.t.o','return to origin','returned to origin',
    'order rto','order rtoed','rtoed from logistic','order has been rtoed',
    'porter','porter request','porter needed','need porter','arrange porter',
    'reship','reshipped','reshipping','re-ship','re-delivery','redelivery','redeliver',
    'not received','not delivered','didnt receive',"didn't receive",
    'never received','never got','missing delivery','missing order','order missing',
    'where is my order','order not received','product not received',
    'fake delivery','false delivery','false delover','marked delivered but not received',
    'marked as delivered','shows delivered','delivery marked','fake attempt',
    "delivery boy didn't come",'nobody came','no one came',"courier didn't come",
    'delay','delayed','late delivery','delay in delivery','taking too long',
    'stuck','stuck in transit','stuck at hub','not moving','pending',
    'order canceled','order cancelled','seller cancelled','shipment refused',
    'lost','lost in transit','lost package','lost shipment','misplaced',
    'misrouted','wrong location','wrong hub','sent to wrong',
    'wrong address','address issue','address change','incorrect address',
    'delivery boy','delivery person','rude delivery','misbehave','misbehaved',
    'tracking not working','tracking issue','no tracking','tracking not updated',
    'courier issue','logistics','lsp','delhivery','bluedart','ekart',
    'delivery attempt','failed attempt','unsuccessful delivery','no attempt',
    'hub','warehouse','facility','stuck at warehouse','bhiwandi',
    'out for delivery','ofd','marked out for delivery',
    'deliver today','deliver tomorrow','urgent delivery','need urgently',
    'expedite','kindly deliver','nahi mila','kab milega','courier wala',
    'delivary','diliv','curier','deliverd',
    'empty box','empty package','nothing inside','box was empty',
    'parcel empty','khali box','khali packet'
  ]},
  { name: 'Technical Issue', kw: [
    'website','web site','webpage','page error','website error',
    'app','application','mobile app','app error','app crash','payment failure',
    'payment error','checkout error','transaction failed','card declined',
    "order issue","can't place order",'change name','billing address',
    'website nahi khul raha','app crash ho raha','payment fail','trackin',
    'coupon','coupon code','discount','promo','promo code','voucher',
    'refund','cancel order','cancellation'
  ]}
]
