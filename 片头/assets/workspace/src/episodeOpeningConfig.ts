export const episodeOpeningConfig={
 projectTitle:'选楼层口诀',fps:50,
 source:{timingBasis:'时间码字幕2.0 · 配音v2.mp4 第1句',openingStartMs:0,openingEndMs:3807},
 durationInFrames:190,
 // 绝对 tokens.startMs：选560 照1640 很2480 可能2800 把3060 带3400
 timingMs:{slam:560,tilt:1640,x0:2480,x1:2800,x2:3060,title:3400},
 text:{identity:'极限小滕 房产科普'},
 colors:{background:'#07090f',accent:'#7aa2ff',silver:'#c5b89a',mist:'#a8b4c8',ink:'#0c1220'},
} as const;
