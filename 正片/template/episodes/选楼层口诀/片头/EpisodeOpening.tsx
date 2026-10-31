import {GlassBloom,GlassLightFx} from './GlassLight';
import React,{useEffect,useState} from 'react';
import {AbsoluteFill,cancelRender,continueRender,delayRender,Easing,Img,interpolate,spring,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {episodeOpeningConfig as config} from './episodeOpeningConfig';

const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const ease=Easing.bezier(.2,.7,.2,1);
const useFonts=()=>{
 const [handle]=useState(()=>delayRender('加载片头字体'));
 useEffect(()=>{Promise.all([
  new FontFace('Headline',`url(${staticFile('fonts/JiangChengLvDongSong.ttf')})`,{weight:'400'}).load(),
  new FontFace('Support',`url(${staticFile('fonts/AlibabaHealth-Bold.ttf')})`,{weight:'700'}).load(),
  new FontFace('Text',`url(${staticFile('fonts/AlibabaHealth-Regular.ttf')})`,{weight:'400'}).load(),
 ]).then(fonts=>{fonts.forEach(font=>document.fonts.add(font));continueRender(handle);}).catch(cancelRender);},[handle]);
};

/** 大厂冷银 / 冷香槟标题材质（去土黄） */
const Display:React.FC<{children:React.ReactNode;size:number;warm?:boolean;style?:React.CSSProperties;name?:string}>=({children,size,warm=false,style,name})=><div data-title={name} style={{position:'absolute',fontFamily:'Headline',fontWeight:400,fontSize:size,lineHeight:1.12,letterSpacing:-4,whiteSpace:'nowrap',...style}}>
 <div aria-hidden style={{position:'absolute',inset:0,color:warm?'#2a3348':'#1c2434',transform:'translate(3px,6px)',textShadow:'0 14px 28px rgba(0,0,0,.55)'}}>{children}</div>
 <div style={{position:'relative',color:'transparent',background:warm?'linear-gradient(180deg,#f4f0e6 0%,#e4d7bc 28%,#c5b89a 58%,#8a8070 100%)':'linear-gradient(180deg,#f7fbff 0%,#e8eef8 32%,#c5d0e0 62%,#7a8799 100%)',backgroundClip:'text',WebkitBackgroundClip:'text'}}>{children}</div>
</div>;

/** 玻璃卡片：半透明冷边 + 外柔影，无倾斜拼贴土味 */
const GlassCard:React.FC<{
 children:React.ReactNode;width:number;height:number;opacity:number;
 translateX?:number;scale?:number;
}>=({children,width,height,opacity,translateX=0,scale=1})=>(<>
 <GlassBloom width={width} height={height} opacity={opacity} translateX={translateX} scale={scale}/>
 <div style={{
  position:'absolute',width,height,opacity,
  transform:`translateX(${translateX}px) scale(${scale})`,
  transformOrigin:'50% 65%',
  borderRadius:22,
  background:'linear-gradient(145deg,rgba(255,255,255,.10) 0%,rgba(255,255,255,.03) 40%,rgba(122,162,255,.04) 100%)',
  border:'1px solid rgba(200,214,235,.22)',
  boxShadow:'0 28px 64px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.04) inset, 0 1px 0 rgba(255,255,255,.12) inset',
  boxSizing:'border-box',
  padding:14,
  overflow:'hidden',
  backdropFilter:'blur(18px)',
  WebkitBackdropFilter:'blur(18px)',
 }}>
  <div style={{
   position:'relative',width:'100%',height:'100%',borderRadius:14,overflow:'hidden',
   background:'radial-gradient(ellipse at 50% 30%,rgba(20,28,48,.35) 0%,rgba(8,10,18,.55) 100%)',
  }}>
   {children}
  </div>
  <GlassLightFx/>
 </div>
</>);


const ROWS=[{k:'一梯两户',v:'选东户 / 选西户'},{k:'7–11 层',v:'扬灰层，不能买'},{k:'槽钢层 · 腰线层',v:'一定漏水'}];
const Cross:React.FC<{p:number}>=({p})=>{
 const a=Math.min(1,p*2),b=Math.max(0,p*2-1);
 const bar=(len:number,rot:number)=><div style={{position:'absolute',left:'50%',top:'50%',width:150*len,height:14,marginLeft:-75,marginTop:-7,borderRadius:7,background:'linear-gradient(90deg,#ff5a5f,#e2373f)',boxShadow:'0 0 18px rgba(255,80,90,.55)',transform:`rotate(${rot}deg)`,transformOrigin:'0 50%',translate:`${-75*(1-len)}px 0`}}/>;
 return <div style={{position:'absolute',right:34,top:'50%',width:150,height:150,marginTop:-75,transform:`scale(${1+.5*Math.max(0,1-p*1.6)})`,opacity:p>0?1:0}}>
  <div style={{position:'absolute',left:-8,top:16,width:150,height:14,transformOrigin:'0 50%'}}/>
  <div style={{position:'absolute',inset:0}}>
   <div style={{position:'absolute',left:0,top:68,width:212*a,height:14,borderRadius:7,background:'linear-gradient(90deg,#ff6b6f,#e2373f)',boxShadow:'0 0 18px rgba(255,80,90,.55)',transform:'rotate(45deg)',transformOrigin:'0 50%',translate:'-30px -75px'}}/>
   <div style={{position:'absolute',left:150,top:68,width:212*b,height:14,borderRadius:7,background:'linear-gradient(90deg,#ff6b6f,#e2373f)',boxShadow:'0 0 18px rgba(255,80,90,.55)',transform:'rotate(135deg)',transformOrigin:'0 50%',translate:'30px -75px'}}/>
  </div>
 </div>;
};

export const EpisodeOpening:React.FC=()=>{
 useFonts();
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),t=config.timingMs;
 const f=(ms:number)=>Math.round(ms*fps/1000);
 const tween=(start:number,duration:number,easing=ease)=>interpolate(frame,[f(start),f(start+duration)],[0,1],{...clamp,easing});
 const enter=(start:number,duration=140)=>tween(start,duration);
 const pulse=(ms:number,len=.3)=>frame<f(ms)?0:Math.exp(-(frame-f(ms))/(len*fps));
 const beat=Math.min(1,pulse(t.slam)+pulse(t.tilt,.4)*.7+pulse(t.x0)*.5+pulse(t.x1)*.5+pulse(t.x2)*.5+pulse(t.title,.5));
 const sweep=tween(t.title-40,620,Easing.bezier(.45,0,.15,1));
 const settle=tween(t.tilt,900);
 const drift=(a:number,sp:number,ph:number)=>a*Math.sin((frame/fps)*sp+ph);
 // 卡片：砸入（过冲回弹）→ 照着挑房：倾斜+推近 → 带偏：轻微抖动
 // 砸入：自由落体 → 弹簧过冲回弹（Q 弹）
 // 单一连续下落：第 0 帧起从上方 ease 到位（slam+8 帧落地），落地后只有一次 ≤3px 的轻微沉降，无二次弹跳
 const fallP=interpolate(frame,[0,f(t.slam)+8],[0,1],{...clamp,easing:Easing.bezier(.42,0,.2,1)});
 const settleSp=spring({frame:Math.max(0,frame-f(t.slam)-8),fps,config:{damping:26,stiffness:170,mass:0.7}});
 const slam=0.74+0.26*fallP;
 const slamY=-420*(1-fallP)+(frame>f(t.slam)+8?3*Math.sin(Math.PI*Math.min(1,settleSp)):0);
 const app=interpolate(frame,[0,f(t.slam)],[0,1],clamp);
 const cardO=frame<f(t.slam)?0.15+0.85*app:1;
 const camIn=1.06-0.06*interpolate(frame,[0,f(t.slam)+20],[0,1],{...clamp,easing:Easing.out(Easing.cubic)});
 const tilt=tween(t.tilt,480,Easing.bezier(.3,0,.2,1));
 const shake=pulse(t.title,.18)*8*Math.sin(frame*2.3);
 const pre=enter(0,300);
 const titleSp=spring({frame:Math.max(0,frame-f(t.title)),fps,config:{damping:12,stiffness:160,mass:0.75}});
 const titleIn=frame<f(t.title)?1.28:1.28-0.28*Math.min(titleSp,1.15);
 const pickSp=spring({frame:Math.max(0,frame-f(t.tilt)),fps,config:{damping:14,stiffness:140,mass:0.8}});
 const maybeSp=spring({frame:Math.max(0,frame-f(t.x0)),fps,config:{damping:14,stiffness:150,mass:0.8}});
 return <AbsoluteFill style={{background:config.colors.background,overflow:'hidden'}}><AbsoluteFill style={{transform:`scale(${camIn})`}}>

  {/* —— 大厂深空底：冷色空气感 —— */}
  <AbsoluteFill data-layer="深空底" style={{
   background:`linear-gradient(168deg,#07090f 0%,#0a0e18 28%,#0c1220 55%,#0b101c 78%,#09101a 100%)`,
  }}/>

  {/* 主环境光：左上冷青蓝 + 右下靛紫（克制 soft glow） */}
  <AbsoluteFill data-layer="环境光" style={{pointerEvents:'none'}}>
   <div style={{
    position:'absolute',left:'-8%',top:'-18%',width:'62%',height:'78%',
    background:`radial-gradient(ellipse at 40% 35%,rgba(90,150,255,${0.16+.06*beat}) 0%,rgba(70,120,220,.07) 32%,transparent 68%)`,
    transform:`translate(${drift(10,.22,0)}px,${drift(8,.18,1.2)}px)`,
   }}/>
   <div style={{
    position:'absolute',right:'-12%',bottom:'-22%',width:'58%',height:'70%',
    background:`radial-gradient(ellipse at 55% 60%,rgba(120,90,220,${0.11+.04*beat}) 0%,rgba(80,70,180,.05) 36%,transparent 70%)`,
    transform:`translate(${drift(12,.16,2.1)}px,${drift(9,.2,.6)}px)`,
   }}/>
   {/* 中央冷白提亮，制造空气感 */}
   <div style={{
    position:'absolute',left:'28%',top:'18%',width:'46%',height:'52%',
    background:`radial-gradient(ellipse at 50% 45%,rgba(220,235,255,${0.045+.025*settle}) 0%,transparent 65%)`,
   }}/>
  </AbsoluteFill>

  {/* 极淡网格（产品页质感） */}
  <AbsoluteFill data-layer="网格" style={{
   opacity:.045+.02*settle,
   backgroundImage:`
    linear-gradient(rgba(170,190,230,.55) 1px, transparent 1px),
    linear-gradient(90deg, rgba(170,190,230,.55) 1px, transparent 1px)
   `,
   backgroundSize:'80px 80px',
   maskImage:'radial-gradient(ellipse at 50% 45%,#000 20%,transparent 78%)',
   WebkitMaskImage:'radial-gradient(ellipse at 50% 45%,#000 20%,transparent 78%)',
  }}/>

  {/* 金色斜高光扫（标题落版）（玻璃/金属感，换位时） */}
  <AbsoluteFill data-layer="斜高光扫" style={{pointerEvents:'none',overflow:'hidden',mixBlendMode:'screen'}}>
   <div style={{
    position:'absolute',
    left:`${-30+145*sweep}%`,
    top:'-20%',
    width:220,
    height:'140%',
    background:'linear-gradient(90deg,transparent 0%,rgba(200,220,255,.0) 20%,rgba(255,232,180,.30) 48%,rgba(232,200,130,.32) 55%,transparent 100%)',
    transform:'skewX(-18deg)',
    opacity:Math.sin(Math.PI*sweep)*.85,
    filter:'blur(1.5px)',
   }}/>
  </AbsoluteFill>

  {/* 极薄低对比冷色块（大留白，平滑缓动，非剪纸） */}
  <AbsoluteFill data-layer="薄色层" style={{pointerEvents:'none',overflow:'hidden'}}>
   <div style={{
    position:'absolute',left:-100+drift(14,.25,0),top:0,
    width:280+60*settle,height:'100%',
    background:'linear-gradient(90deg,rgba(40,60,100,.22) 0%,transparent 100%)',
    opacity:.7,
   }}/>
   <div style={{
    position:'absolute',right:-80,bottom:-60+drift(10,.2,1.5),
    width:640,height:280,
    background:'linear-gradient(200deg,transparent 0%,rgba(70,50,140,.12) 50%,rgba(50,80,140,.08) 100%)',
    borderRadius:'50% 20% 0 40%',
    opacity:.85,
   }}/>
  </AbsoluteFill>

  {/* 软暗角（克制） */}
  <AbsoluteFill data-layer="暗角" style={{
   background:'radial-gradient(ellipse at 50% 48%,transparent 42%,rgba(4,6,12,.55) 100%)',
   pointerEvents:'none',
  }}/>

  
  {/* 口诀表卡片 */}
  <div data-layer="口诀表" style={{position:'absolute',left:150,top:150,width:860,height:760,perspective:1600,opacity:cardO}}>
   <div style={{position:'absolute',inset:0,transform:`translate(${shake}px,${slamY}px) scale(${slam*(1+.06*tilt)}) rotateY(${14*tilt}deg) rotateZ(${-3.5*tilt}deg)`,transformOrigin:'40% 50%'}}>
    <GlassCard width={860} height={760} opacity={1}>
     <div style={{position:'absolute',left:56,top:46,right:56}}>
      <div style={{display:'flex',alignItems:'center',gap:14}}>
       <span style={{width:10,height:10,borderRadius:99,background:'#7aa2ff',boxShadow:'0 0 12px rgba(122,162,255,.7)'}}/>
       <span style={{fontFamily:'Text',fontSize:28,letterSpacing:4,color:'rgba(180,196,220,.85)'}}>看房前收藏 · 速查</span>
      </div>
      <div style={{fontFamily:'Support',fontSize:76,color:'#eef3fb',marginTop:14,letterSpacing:2}}>选楼层口诀表</div>
      <div style={{height:2,marginTop:18,background:'linear-gradient(90deg,rgba(122,162,255,.8),rgba(122,162,255,0))'}}/>
     </div>
     {ROWS.map((r,i)=>{const p=enter(t.slam+120+i*70,160);const x=tween([t.x0,t.x1,t.x2][i],190);
      return <div key={i} style={{position:'absolute',left:56,right:56,top:252+i*150,height:124,borderRadius:16,background:`rgba(255,255,255,${.05-.03*x})`,border:'1px solid rgba(200,214,235,.16)',opacity:p,transform:`translateX(${40*(1-p)}px)`}}>
       <div style={{position:'absolute',left:30,top:18,fontFamily:'Text',fontSize:30,color:'rgba(168,180,200,.9)',letterSpacing:2}}>{r.k}</div>
       <div style={{position:'absolute',left:30,top:56,fontFamily:'Support',fontSize:46,color:`rgba(238,243,251,${1-.45*x})`}}>{r.v}</div>
       <div style={{position:'absolute',left:24,top:84,height:4,width:`${(r.v.length*46+20)*x}px`,background:'rgba(255,90,95,.85)',borderRadius:2}}/>
       <Cross p={x}/>
      </div>;})}
    </GlassCard>
   </div>
  </div>

  {/* 右侧标题 */}
  <div data-layer="照着挑房" style={{position:'absolute',left:1110,top:250,opacity:Math.min(1,pickSp),transform:`translateY(${28*(1-pickSp)}px) scale(${0.94+0.06*Math.min(1.1,pickSp)})`}}>
   <Display size={120} style={{left:0,top:0}}>照着挑房</Display>
  </div>
  <div data-layer="很可能" style={{position:'absolute',left:1116,top:430,opacity:Math.min(1,maybeSp),transform:`translateY(${18*(1-maybeSp)}px)`}}>
   <Display size={92} style={{left:0,top:0}}>很可能</Display>
  </div>
  <div data-layer="把你带偏" style={{position:'absolute',left:1100,top:560,opacity:enter(t.title-200,120),transform:`scale(${titleIn})`,transformOrigin:'0 50%'}}>
   <Display size={96} style={{left:6,top:20}}>把你</Display>
   <Display size={210} warm style={{left:200,top:-40,opacity:enter(t.title,100)}}>带偏</Display>
  </div>
  <div style={{position:'absolute',left:1110,top:858,width:520*tween(t.title,300),height:3,background:'linear-gradient(90deg,#e8c882,rgba(232,200,130,0))',boxShadow:'0 0 14px rgba(232,200,130,.6)'}}/>

  {/* 玻璃胶囊身份条：细线+冷灰字 */}
  <div data-layer="身份条" style={{
   position:'absolute',right:88,top:40,
   display:'flex',alignItems:'center',gap:12,
   opacity:pre,
   padding:'9px 16px 9px 14px',
   borderRadius:999,
   background:'linear-gradient(135deg,rgba(255,255,255,.08) 0%,rgba(255,255,255,.03) 100%)',
   border:'1px solid rgba(180,200,230,.18)',
   boxShadow:'0 8px 24px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.08) inset',
   backdropFilter:'blur(12px)',
   WebkitBackdropFilter:'blur(12px)',
  }}>
   <span style={{
    width:6,height:6,borderRadius:999,
    background:'linear-gradient(135deg,#a8c4ff,#7aa2ff)',
    boxShadow:'0 0 10px rgba(122,162,255,.55)',
    flexShrink:0,
   }}/>
   <span style={{
    fontFamily:'Text',fontSize:26,letterSpacing:1.4,
    color:'rgba(180,196,220,.88)',
    fontWeight:400,
   }}>{config.text.identity}</span>
  </div>
 </AbsoluteFill></AbsoluteFill>;
};
