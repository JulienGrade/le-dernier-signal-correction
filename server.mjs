// Sert la version compilée sans dépendance externe.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript', '.css':'text/css','.glb':'model/gltf-binary','.ttf':'font/ttf','.png':'image/png'};
http.createServer(async (req,res) => {
  try {
    const relative = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const target = path.resolve(root,'.'+(relative==='/'?'/index.html':relative));
    if (!target.startsWith(root+path.sep)) {res.writeHead(403);res.end();return;}
    const bytes = await readFile(target);
    res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'});res.end(bytes);
  } catch {res.writeHead(404);res.end('Fichier introuvable.');}
}).listen(Number(process.env.PORT || 4173),'0.0.0.0',()=>console.log('Le dernier signal : http://localhost:'+(process.env.PORT || 4173)));
