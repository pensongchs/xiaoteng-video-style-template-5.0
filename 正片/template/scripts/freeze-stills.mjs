// Approved default gallery + explicit archival material audit (archive is not recommendation).
import {mkdirSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';
import {GALLERY, ARCHIVE_GALLERY} from '../src/gallery/shots-mg-gallery.ts';
const out = resolve(process.argv[2] || '../../outputs/freeze-v6');
const serveUrl=await bundle({entryPoint:'src/index.ts'});
const composition=await selectComposition({serveUrl,id:'MgGallery',inputProps:{}});
const manifest=[];
for(const [kind,shots] of [['default',GALLERY],['archive',ARCHIVE_GALLERY]]) {
 mkdirSync(`${out}/${kind}`,{recursive:true});
 for(let i=0;i<shots.length;i++) {
  const file=`${kind}/${String(i+1).padStart(2,'0')}_${shots[i].layout}.png`;
  await renderStill({serveUrl,composition,inputProps:{archiveAudit:kind==='archive'},frame:i*150+140,output:`${out}/${file}`,chromiumOptions:{gl:'swangle'},timeoutInMilliseconds:120000});
  manifest.push({group:kind,layout:shots[i].layout,file,frame:i*150+140});console.log('✓',file);
 }
}
writeFileSync(`${out}/stills-manifest.json`,JSON.stringify(manifest,null,2)+'\n');
