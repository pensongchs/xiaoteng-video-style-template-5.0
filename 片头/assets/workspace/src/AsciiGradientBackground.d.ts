import type {FC,CSSProperties} from 'react';
export interface AsciiGradientBackgroundProps {renderTime:number;colors?:string[];shape?:'horizon'|'pinch'|'rise'|'eclipse';characters?:string;cellSize?:number;density?:number;glyphOpacity?:number;glow?:number;depthOfField?:number;flicker?:number;softness?:number;scale?:number;flow?:number;speed?:number;gradientOpacity?:number;grain?:number;variation?:number;mouseInteraction?:boolean;scrambleRadius?:number;clickEffect?:'none'|'wave'|'burst';intro?:boolean;lightMode?:boolean;fontFamily?:string;dpr?:number;className?:string;style?:CSSProperties;}
declare const AsciiGradientBackground:FC<AsciiGradientBackgroundProps>;
export default AsciiGradientBackground;
