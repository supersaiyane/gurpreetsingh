#!/usr/bin/env python3
import json,subprocess
from urllib.parse import urlparse,unquote
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'versions.json').read_text())
versions=manifest['versions']
assert len(versions)==8
assert len({v['id'] for v in versions})==8
assert len({v['branch'] for v in versions})==8
for version in versions:
 entry=ROOT/version['entry'];assert entry.is_file(),version['branch']
 sha=subprocess.check_output(['git','rev-parse','origin/'+version['branch']],cwd=ROOT,text=True).strip()
 assert version['commit']==sha,version['branch']+' snapshot is stale'
 source=sha+(':dist/index.html' if (entry.parent/'incident.mjs').exists() else ':index.html')
 original=subprocess.check_output(['git','show',source],cwd=ROOT)
 assert entry.read_bytes()==original,version['branch']+' HTML changed during packaging'
class Parse(HTMLParser):
 def __init__(self):super().__init__();self.scripts=[];self.inscript=False
 def handle_starttag(self,tag,attrs):
  if tag=='script':self.inscript=True
 def handle_endtag(self,tag):
  if tag=='script':self.inscript=False
 def handle_data(self,data):
  if self.inscript:self.scripts.append(data)
parser=Parse();parser.feed((ROOT/'index.html').read_text())
js='\n'.join(parser.scripts)
result=subprocess.run(['node','--check','--input-type=commonjs'],input=js,cwd=ROOT,text=True,capture_output=True)
assert result.returncode==0,result.stderr
assert '/*__VERSIONS__*/' not in (ROOT/'index.html').read_text()
class AssetLinks(HTMLParser):
 def __init__(self):super().__init__();self.paths=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag in ['img','script','source','video','audio'] and d.get('src'):self.paths.append(d['src'])
  if tag=='link' and d.get('rel') in ['stylesheet','icon']:self.paths.append(d.get('href',''))
for version in versions:
 entry=ROOT/version['entry'];links=AssetLinks();links.feed(entry.read_text())
 for url in links.paths:
  parsed=urlparse(url)
  if parsed.scheme or parsed.netloc or not parsed.path:continue
  assert (entry.parent/unquote(parsed.path)).exists(),version['branch']+' missing asset: '+url
print('PASS: 8 unique snapshots match source HTML and commits; referenced local assets exist; preview JavaScript syntax is valid.')
