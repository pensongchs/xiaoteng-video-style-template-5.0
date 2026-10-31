import {GlassBloom,GlassLightFx} from './GlassLight';
import React,{useEffect,useState} from 'react';
import {AbsoluteFill,cancelRender,continueRender,delayRender,Easing,Img,interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {openingConfig as config} from './openingConfig';

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

const YearRoll:React.FC<{swap:number}>=({swap})=>{
 const frame=useCurrentFrame();
 const roll=interpolate(frame,[0,4,9,15,22],[0,.15,1.3,2.4,3],clamp);
 const arc=Math.sin(Math.PI*swap);
 return <div data-layer="年份滚轮" data-year={frame>=22?'2027':'2024→2027'} style={{position:'absolute',left:130+910*swap,top:230-90*swap-120*arc,width:704,height:400,transform:`scale(${1-.59*swap})`,transformOrigin:'0 0'}}>
  {[2,0,2].map((n,i)=><Display key={i} size={340} name={`年份固定数字${i}`} style={{left:i*174,top:0,width:174,textAlign:'center',letterSpacing:0}}>{n}</Display>)}
  <div style={{position:'absolute',left:522,top:0,width:180,height:400,overflow:'hidden',maskImage:'linear-gradient(to bottom,transparent 0%,#000 7%,#000 91%,transparent 100%)'}}>
   <div style={{position:'absolute',left:0,top:-roll*400,width:180,height:1600}}>
    {[4,5,6,7].map((n,i)=><Display key={n} size={340} name={`年份末位${n}`} warm={n===7} style={{left:0,top:i*400,width:174,textAlign:'center',letterSpacing:0}}>{n}</Display>)}
   </div>
  </div>
 </div>;
};

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

export const Opening:React.FC=()=>{
 useFonts();
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),t=config.timingMs;
 const f=(ms:number)=>Math.round(ms*fps/1000);
 const tween=(start:number,duration:number,easing=ease)=>interpolate(frame,[f(start),f(start+duration)],[0,1],{...clamp,easing});
 const enter=(start:number,duration=140)=>tween(start,duration);
 const swap=tween(t.turn,580,Easing.bezier(.42,0,.18,1));
 const arc=Math.sin(Math.PI*swap);
 const resale=enter(t.resaleHouse,220);
 const newHouseExit=enter(t.resaleHouse,160);
 const newHouseColour='saturate(0.9) contrast(1.05) brightness(1.04)';
 const resaleColour='saturate(0.86) contrast(1.05) brightness(1.03)';
 const houseLeft=1080-990*swap,houseTop=125+45*swap+65*arc;
 const houseScale=1-.17*arc;
 const titleLeft=1040+630*(1-swap);
 const pulse=(ms:number,len=.38)=>frame<f(ms)?0:Math.exp(-(frame-f(ms))/(len*fps));
 const beat=Math.min(1,pulse(t.yearSettled)*.75+pulse(t.buy)*.5+pulse(t.turn,.55)+pulse(t.divide,.5)*.9+pulse(t.negation)*.4+pulse(t.resaleHouse,.45)*.55);
 const sweep=tween(t.turn-60,780,Easing.bezier(.45,0,.15,1));
 const settle=tween(t.divide,900);
 const drift=(a:number,sp:number,ph:number)=>a*Math.sin((frame/fps)*sp+ph);

 return <AbsoluteFill style={{background:config.colors.background,overflow:'hidden'}}>
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

  {/* 极细斜高光扫（玻璃/金属感，换位时） */}
  <AbsoluteFill data-layer="斜高光扫" style={{pointerEvents:'none',overflow:'hidden',mixBlendMode:'screen'}}>
   <div style={{
    position:'absolute',
    left:`${-30+145*sweep}%`,
    top:'-20%',
    width:120,
    height:'140%',
    background:'linear-gradient(90deg,transparent 0%,rgba(200,220,255,.0) 20%,rgba(200,220,255,.22) 48%,rgba(197,184,154,.12) 55%,transparent 100%)',
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

  {/* 玻璃卡片住宅 */}
  <div data-layer="住宅接力" style={{position:'absolute',left:houseLeft,top:houseTop,width:740,height:870,transform:`scale(${houseScale})`,transformOrigin:'50% 65%'}}>
   <GlassCard
    width={620} height={760}
    opacity={1-newHouseExit}
    translateX={-110*newHouseExit}
    scale={1+.02*enter(t.newHouse,260)-.12*newHouseExit}
   >
    <Img data-subject="现代住宅" src={staticFile(config.assets.newHouse)} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain',filter:newHouseColour}}/>
   </GlassCard>
   <GlassCard
    width={680} height={720}
    opacity={resale}
    translateX={145*(1-resale)-40}
    scale={.92+.08*resale}
   >
    <Img data-subject="成熟社区住宅" src={staticFile(config.assets.resaleHouse)} style={{position:'absolute',left:'-4%',top:'2%',width:'108%',height:'100%',objectFit:'contain',filter:resaleColour}}/>
   </GlassCard>
  </div>

  <YearRoll swap={swap}/>
  <div data-layer="年买房" style={{position:'absolute',left:150+1180*swap,top:655-482*swap-80*arc,transform:`scale(${1-.43*swap})`,transformOrigin:'0 0'}}>
   <Display size={170} style={{left:0,top:0,opacity:enter(t.yearSettled,120)}}>年</Display>
   <Display size={170} style={{left:183,top:0,opacity:enter(t.buy,160)}}>买房</Display>
  </div>

  <div data-layer="分水岭判断" style={{position:'absolute',left:titleLeft,top:0,opacity:enter(t.turn,180)}}>
   <Display name="真正的" size={124} style={{left:8,top:342}}>真正的</Display>
   <Display name="分水岭" size={224} warm style={{left:0,top:500,opacity:enter(t.divide,160)}}>分水岭</Display>
  </div>
  <div data-layer="否定与类别" style={{position:'absolute',left:1040,top:797,display:'flex',alignItems:'baseline',gap:11,fontFamily:'Headline',whiteSpace:'nowrap'}}>
   <Display name="不是" size={100} warm style={{position:'relative',opacity:enter(t.negation,140)}}>不是</Display>
   <Display name="新房" size={94} style={{position:'relative',opacity:enter(t.newHouse,140)}}>新房</Display>
   <Display name="和" size={77} style={{position:'relative',opacity:enter(t.and,100),margin:'0 2px'}}>和</Display>
   <Display name="二手房" size={94} warm style={{position:'relative',opacity:enter(t.resaleHouse,120)}}>二手房</Display>
  </div>

  {/* 玻璃胶囊身份条：细线+冷灰字 */}
  <div data-layer="身份条" style={{
   position:'absolute',right:88,top:40,
   display:'flex',alignItems:'center',gap:12,
   opacity:enter(0,200),
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
 </AbsoluteFill>;
};
