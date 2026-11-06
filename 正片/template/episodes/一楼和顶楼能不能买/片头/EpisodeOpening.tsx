// 本期片头：一楼 vs 顶楼 真实照片对撞（第 1 帧即有画面），推近+视差贯穿，单次弹入无二次回弹
import React,{useEffect,useState} from 'react';
import {AbsoluteFill,OffthreadVideo,cancelRender,continueRender,delayRender,Easing,Img,interpolate,spring,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {episodeOpeningConfig as config} from './episodeOpeningConfig';
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const useFonts=()=>{const [h]=useState(()=>delayRender('fonts'));useEffect(()=>{Promise.all([
 new FontFace('Headline',`url(${staticFile('fonts/JiangChengLvDongSong.ttf')})`).load(),
 new FontFace('Support',`url(${staticFile('fonts/AlibabaHealth-Bold.ttf')})`,{weight:'700'}).load(),
 new FontFace('Black',`url(${staticFile('fonts/AlibabaPuHuiTi-Black.woff2')})`).load(),
 new FontFace('Text',`url(${staticFile('fonts/AlibabaHealth-Regular.ttf')})`).load(),
]).then(fs=>{fs.forEach(f=>document.fonts.add(f));continueRender(h);}).catch(cancelRender);},[h]);};
const SUBS:[number,number,string][]=[[0,1750,'买房有个很奇怪的现象'],[1829,5250,'一楼，很多人嫌它潮湿、吵闹、没隐私'],[5359,8880,'顶楼，很多人又怕它漏水、暴晒、夏天像蒸笼']];
const L_CHIPS:[number,string][]=[[3180,'潮湿'],[4020,'吵闹'],[4560,'没隐私']];
const R_CHIPS:[number,string][]=[[6720,'漏水'],[7340,'暴晒'],[8180,'像蒸笼']];
export const EpisodeOpening:React.FC=()=>{
 useFonts();
 const frame=useCurrentFrame(),{fps,durationInFrames}=useVideoConfig();
 const ms=frame*1000/fps; const f=(m:number)=>Math.round(m*fps/1000);
 const sp=(m:number,cfg={damping:15,stiffness:170,mass:.7})=>spring({frame:Math.max(0,frame-f(m)),fps,config:cfg});
 const one=(m:number)=>spring({frame:Math.max(0,frame-f(m)),fps,config:{damping:26,stiffness:190,mass:.8}}); // 无回弹
 // 对撞：两图从两侧已在画面内，第0帧起向中缝合拢
 const hit=one(0);
 // 焦点：一楼段左侧扩，顶楼段右侧扩
 const focusL=interpolate(ms,[1829,2300,5200,5600],[0,1,1,0],{...clamp,easing:Easing.bezier(.3,0,.2,1)});
 const focusR=interpolate(ms,[5359,5800],[0,1],{...clamp,easing:Easing.bezier(.3,0,.2,1)});
 const split=50+12*focusL-12*focusR; // 中缝位置%
 const push=interpolate(frame,[0,durationInFrames],[1.10,1.26]);
 const t=frame/fps;
 const titleIn=sp(80,{damping:13,stiffness:200,mass:.7});
 const titleUp=interpolate(ms,[1700,2200],[0,1],{...clamp,easing:Easing.bezier(.3,0,.2,1)});
 const flash=Math.exp(-frame/(.18*fps));
 const cur=SUBS.find(([a,b])=>ms>=a&&ms<b);
 const Panel=({src,side,dim}:{src:string;side:'L'|'R';dim:number})=>{const vs=src.replace('yl_yard.jpg','v_yard.mp4').replace('yl_terrace.jpg','v_terrace.mp4');
  const clip=side==='L'?`polygon(0 0, calc(${split}% + 60px) 0, calc(${split}% - 60px) 100%, 0 100%)`:`polygon(calc(${split}% + 60px) 0, 100% 0, 100% 100%, calc(${split}% - 60px) 100%)`;
  const dx=(side==='L'?-1:1)*(160*(1-hit))+(side==='L'?-1:1)*18*Math.sin(t*.9);
  return <AbsoluteFill style={{clipPath:clip,WebkitClipPath:clip}}>
   <OffthreadVideo muted src={staticFile(vs)} style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover',transform:`translateX(${dx}px) scale(${push})`,transformOrigin:side==='L'?'35% 60%':'65% 45%',filter:`brightness(${1-.38*dim}) saturate(${1-.3*dim})`}}/>
  </AbsoluteFill>;};
 const chip=(m:number,txt:string,i:number,side:'L'|'R')=>{const p=sp(m);if(ms<m)return null;
  return <div key={txt} style={{transform:`scale(${.4+.6*p}) translateY(${(1-p)*30}px)`,opacity:Math.min(1,p*1.6),padding:'14px 34px',borderRadius:999,fontFamily:'Support',fontSize:52,color:'#fff',
   background:side==='L'?'rgba(40,52,70,.62)':'rgba(70,40,30,.58)',border:'1.5px solid rgba(255,255,255,.75)',backdropFilter:'blur(14px)',boxShadow:'0 12px 34px rgba(0,0,0,.35)'}}>{txt}</div>;};
 const tag=(txt:string,side:'L'|'R',act:number)=><div style={{position:'absolute',top:250,[side==='L'?'left':'right']:110,fontFamily:'Headline',fontSize:84+26*act,color:side==='L'?'#DFF7EC':'#E3F1FF',
  textShadow:'0 6px 24px rgba(0,0,0,.6)',opacity:act>0?1:0,transform:`translateX(${(side==='L'?-1:1)*40*(1-hit)}px)`}}>{txt}</div>;
 return <AbsoluteFill style={{background:'#0b0f16',overflow:'hidden'}}>
  <Panel src="yl/yl_yard.jpg" side="L" dim={focusR}/>
  <Panel src="yl/yl_terrace.jpg" side="R" dim={focusL}/>
  {/* 中缝亮线 + 撞击闪光 */}
  <AbsoluteFill style={{pointerEvents:'none'}}>
   <svg width="1920" height="1080" style={{position:'absolute'}}><line x1={1920*split/100+60} y1={0} x2={1920*split/100-60} y2={1080} stroke="#fff" strokeWidth={6+10*flash} opacity={.9}/></svg>
   <div style={{position:'absolute',left:`${split}%`,top:'50%',width:900,height:900,marginLeft:-450,marginTop:-450,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,255,255,.85),transparent 60%)',opacity:flash}}/>
  </AbsoluteFill>
  <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(0,0,0,.35) 0%,transparent 30%,transparent 62%,rgba(0,0,0,.55) 100%)'}}/>
  {tag('一楼',  'L',focusL)}{tag('顶楼','R',focusR)}
  <div style={{position:'absolute',left:110,top:420,display:'flex',flexDirection:'column',gap:22,alignItems:'flex-start'}}>{L_CHIPS.map(([m,x],i)=>chip(m,x,i,'L'))}</div>
  <div style={{position:'absolute',right:110,top:420,display:'flex',flexDirection:'column',gap:22,alignItems:'flex-end'}}>{R_CHIPS.map(([m,x],i)=>chip(m,x,i,'R'))}</div>
  <Title ms={ms} frame={frame} fps={fps} up={titleUp}/>
  {cur&&<div style={{position:'absolute',left:0,right:0,bottom:70,textAlign:'center'}}><span style={{fontFamily:'Support',fontSize:54,color:'#fff',padding:'10px 30px',borderRadius:18,background:'rgba(10,14,22,.5)',textShadow:'0 2px 8px rgba(0,0,0,.6)'}}>{cur[2]}</span></div>}
  <div style={{position:'absolute',left:60,bottom:28,fontFamily:'Text',fontSize:24,color:'rgba(255,255,255,.75)'}}>{config.text.identity} · 概念图</div>
 </AbsoluteFill>;
};

/* ===== 标题包装：分色渐变字 + 描边辉光 + VS 徽章 + 逐字弹入 + 扫光 ===== */
const ACC={L:['#F4FFFA','#A8EBCD','#3FB68B'],R:['#F5FAFF','#B7DCFF','#4A8FEF']};
const Title:React.FC<{ms:number;frame:number;fps:number;up:number}>=({ms,frame,fps,up})=>{
 const f=(m:number)=>Math.round(m*fps/1000);
 const ch=(m:number)=>spring({frame:Math.max(0,frame-f(m)),fps,config:{damping:12,stiffness:230,mass:.6}});
 const plate=spring({frame,fps,config:{damping:22,stiffness:160,mass:.8}});
 const sweep=interpolate(ms,[520,1250],[-40,140],clamp); const sweep2=interpolate(ms,[6000,6800],[-40,140],clamp);
 const sw=ms<3000?sweep:sweep2;
 const ring=frame*1.6;
 const Glyph=({c,i,side,m}:{c:string;i:number;side:'L'|'R';m:number})=>{const p=ch(m);const a=ACC[side];
  return <span style={{position:'relative',display:'inline-block',transform:`translateY(${(1-p)*-90}px) scale(${1.9-0.9*p})`,opacity:Math.min(1,p*2),filter:`blur(${Math.max(0,(1-p)*10)}px)`}}>
   <span style={{position:'absolute',inset:0,color:'transparent',WebkitTextStroke:'10px rgba(8,16,28,.55)',filter:'blur(6px)'}}>{c}</span>
   <span style={{position:'relative',background:`linear-gradient(180deg,${a[0]} 8%,${a[1]} 52%,${a[2]} 100%)`,WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent',WebkitTextStroke:'2px rgba(255,255,255,.85)',
    textShadow:'none',filter:`drop-shadow(0 0 18px ${a[2]}aa) drop-shadow(0 10px 22px rgba(0,0,0,.45))`}}>{c}</span>
   <span style={{position:'absolute',inset:0,background:`linear-gradient(105deg,transparent ${sw-18}%,rgba(255,255,255,.95) ${sw}%,transparent ${sw+18}%)`,WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent',mixBlendMode:'screen'}}>{c}</span>
  </span>;};
 const vs=ch(300);
 const sc=(0.82+0.18*plate)*(1-.42*up);
 const top=interpolate(up,[0,1],[330,40]);
 const lineW=interpolate(ms,[350,900],[0,1],clamp);
 return <div style={{position:'absolute',left:0,right:0,top,display:'flex',justifyContent:'center',transform:`scale(${sc})`,transformOrigin:'50% 0%'}}>
  <div style={{position:'relative',padding:'34px 80px 40px',borderRadius:48,background:'linear-gradient(180deg,rgba(255,255,255,.20),rgba(255,255,255,.06))',border:'1.5px solid rgba(255,255,255,.45)',
   backdropFilter:'blur(18px) saturate(1.3)',WebkitBackdropFilter:'blur(18px) saturate(1.3)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.6), 0 30px 80px rgba(0,10,30,.45)',opacity:Math.min(1,plate*1.5)}}>
   {/* 角标装饰 */}
   {[[0,0],[1,0],[0,1],[1,1]].map(([x,y],i)=><div key={i} style={{position:'absolute',[x?'right':'left']:18,[y?'bottom':'top']:18,width:34,height:34,borderColor:'rgba(255,255,255,.8)',borderStyle:'solid',borderWidth:`${y?0:3}px ${x?3:0}px ${y?3:0}px ${x?0:3}px`,opacity:lineW}}/>)}
   <div style={{display:'flex',justifyContent:'space-between',fontFamily:'Support',fontSize:26,letterSpacing:8,color:'rgba(255,255,255,.85)',marginBottom:6,opacity:lineW}}>
    <span style={{color:'#E8FFF4',background:'rgba(30,110,80,.55)',padding:'2px 16px',borderRadius:999}}>GROUND FLOOR · 带院</span><span style={{color:'#EEF6FF',background:'rgba(40,90,170,.55)',padding:'2px 16px',borderRadius:999}}>TOP FLOOR · 露台</span></div>
   <div style={{display:'flex',alignItems:'center',gap:26,fontFamily:'Black',fontSize:196,lineHeight:1.05,letterSpacing:2}}>
    <span>{['一','楼'].map((c,i)=><Glyph key={c} c={c} i={i} side="L" m={60+i*70}/>)}</span>
    <div style={{position:'relative',width:150,height:150,transform:`scale(${vs}) rotate(${(1-vs)*-90}deg)`,opacity:Math.min(1,vs*2)}}>
     <svg width="150" height="150" style={{position:'absolute',inset:0,transform:`rotate(${ring}deg)`}}><defs><linearGradient id="vsg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#A8EBCD"/><stop offset="1" stopColor="#7DB8FF"/></linearGradient></defs>
      <circle cx="75" cy="75" r="68" fill="none" stroke="url(#vsg)" strokeWidth="5" strokeDasharray="300 128" strokeLinecap="round"/></svg>
     <div style={{position:'absolute',inset:16,borderRadius:'50%',background:'linear-gradient(145deg,rgba(255,255,255,.95),rgba(214,230,245,.85))',boxShadow:'0 10px 30px rgba(0,0,0,.35), inset 0 -4px 10px rgba(80,110,150,.25)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <span style={{fontFamily:'Black',fontSize:44,lineHeight:1,background:'linear-gradient(90deg,#2F9C74,#3D7FE0)',WebkitBackgroundClip:'text',color:'transparent'}}>VS</span>
      <span style={{fontFamily:'Support',fontSize:24,color:'#2a3a4e',marginTop:2}}>还是</span></div>
    </div>
    <span>{['顶','楼','？'].map((c,i)=><Glyph key={c} c={c} i={i} side="R" m={340+i*70}/>)}</span>
   </div>
   <div style={{position:'absolute',left:80,right:80,bottom:20,height:4,borderRadius:2,background:'linear-gradient(90deg,#3FB68B,rgba(255,255,255,.9) 50%,#4A8FEF)',transform:`scaleX(${lineW})`,boxShadow:'0 0 16px rgba(160,220,255,.8)'}}/>
  </div>
 </div>;
};
