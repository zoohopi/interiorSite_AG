import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.mp4':'video/mp4'};
http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403).end();return;}
  const info=await stat(file);if(!info.isFile()){res.writeHead(404).end();return;}
  let start=0,end=info.size-1,status=200;
  const headers={'Content-Type':types[extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
  if(req.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end();return;}
   if(!match[1])start=Math.max(0,info.size-Number(match[2]));
   else {start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}
   if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end();return;}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
  }
  headers['Content-Length']=end-start+1;res.writeHead(status,headers);
  if(req.method==='HEAD'){res.end();return;}
  createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);
 }catch{res.writeHead(404).end('Not found');}
}).listen(4175,'127.0.0.1',()=>console.log('ver3: http://127.0.0.1:4175'));
