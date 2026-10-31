export const openingConfig = {
 projectTitle: '2027年买新房还是二手房',
 background: {libraryId:39,name:'大厂深空质感背景'},
 durationInFrames:184,
 fps:50,
 source:{timingBasis:'随包示例时间码，未配音；制作时换成用户的真实SRT',openingStartMs:0,openingEndMs:3683},
 assets:{
  newHouse:'assets/示例/现代住宅_透明.png',
  resaleHouse:'assets/示例/成熟社区住宅_透明.png',
 },
 timingMs:{yearSettled:440,buy:620,turn:1231,divide:1640,negation:2100,newHouse:2380,and:2860,resaleHouse:3140},
 text:{fullCopy:'2027年买房，真正的分水岭，不是新房和二手房。',identity:'极限小滕 房产科普'},
 colors:{background:'#07090f',accent:'#7aa2ff',silver:'#c5b89a',mist:'#a8b4c8',ink:'#0c1220'},
} as const;
