#!/usr/bin/env python3
"""Package a selected portfolio branch for GitHub Pages. Executes no source code."""
import argparse,io,json,re,shutil,subprocess,tarfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse,unquote

class AssetParser(HTMLParser):
 def __init__(self):super().__init__();self.paths=[]
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag in ('img','script','source','video','audio') and attrs.get('src'):self.paths.append(attrs['src'])
  if tag=='link' and attrs.get('rel') in ('stylesheet','icon'):self.paths.append(attrs.get('href',''))

def validate_branch(branch):
 if not isinstance(branch,str) or not re.fullmatch(r'(?:design/|experiment/)[A-Za-z0-9][A-Za-z0-9._/-]*|preview|main',branch):
  raise ValueError('Select main, a design/*, experiment/* or preview branch.')
 if '..' in branch or branch.endswith('/') or '/.' in branch:raise ValueError('Invalid source branch.')
 return branch

def git(repo,*args):return subprocess.check_output(['git',*args],cwd=repo)

def validate_artifact(output):
 entry=output/'index.html'
 if not entry.is_file():raise ValueError('The selected version has no index.html at its publishing root.')
 parser=AssetParser();parser.feed(entry.read_text())
 for url in parser.paths:
  parsed=urlparse(url)
  if parsed.scheme or parsed.netloc or not parsed.path:continue
  path=unquote(parsed.path)
  target=(output/path.lstrip('/')).resolve()
  if not target.is_relative_to(output.resolve()):raise ValueError('Asset escapes the publication root: '+path)
  if not target.exists():raise ValueError('Missing local asset: '+path)

def prepare(repo,branch,output,fetch=False):
 repo=Path(repo).resolve();output=Path(output).resolve();validate_branch(branch)
 if output==repo or not output.is_relative_to(repo) or '.git' in output.relative_to(repo).parts:
  raise ValueError('Artifact output must be a separate folder inside this checkout.')
 if fetch:
  subprocess.run(['git','fetch','--no-tags','--depth=1','origin','refs/heads/'+branch],cwd=repo,check=True)
  sha=git(repo,'rev-parse','FETCH_HEAD').decode().strip()
 else:sha=git(repo,'rev-parse','refs/remotes/origin/'+branch).decode().strip()
 files=git(repo,'ls-tree','-r','--name-only',sha).decode().splitlines()
 prefix='dist' if 'dist/index.html' in files else '.'
 if prefix=='.' and 'index.html' not in files:raise ValueError('No publishable root or dist/index.html exists.')
 archive=git(repo,'archive','--format=tar',sha+(':dist' if prefix=='dist' else ''))
 if output.exists():shutil.rmtree(output)
 output.mkdir(parents=True)
 with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
  for item in tar.getmembers():
   path=Path(item.name)
   if not item.isfile() or path.is_absolute() or '..' in path.parts:continue
   if any(part.startswith('.') for part in path.parts):continue
   if path.parts[0] in ('node_modules','tests','docs','work','outputs'):continue
   if path.name in ('package.json','package-lock.json','README.md'):continue
   target=output/path;target.parent.mkdir(parents=True,exist_ok=True)
   target.write_bytes(tar.extractfile(item).read())
 (output/'.nojekyll').touch()
 metadata={'source_branch':branch,'source_commit':sha,'source_directory':prefix}
 (output/'deployment.json').write_text(json.dumps(metadata,indent=2)+'\n')
 validate_artifact(output)
 entry_path='dist/index.html' if prefix=='dist' else 'index.html'
 if (output/'index.html').read_bytes()!=git(repo,'show',sha+':'+entry_path):
  raise ValueError('Entry HTML differs from selected source.')
 return metadata

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--config',default='publishing.json');parser.add_argument('--output',default='.pages-artifact');parser.add_argument('--fetch',action='store_true');args=parser.parse_args()
 config=json.loads(Path(args.config).read_text())
 if not isinstance(config.get('deploy'),bool):raise ValueError('deploy must be true or false.')
 result=prepare(Path.cwd(),config['source_branch'],Path(args.output),args.fetch)
 print(json.dumps({**result,'deploy':config['deploy']},indent=2))
 import os
 if os.environ.get('GITHUB_OUTPUT'):
  with open(os.environ['GITHUB_OUTPUT'],'a') as f:
   f.write('deploy='+str(config['deploy']).lower()+'\nsource_branch='+result['source_branch']+'\nsource_commit='+result['source_commit']+'\n')
 if os.environ.get('GITHUB_STEP_SUMMARY'):
  with open(os.environ['GITHUB_STEP_SUMMARY'],'a') as f:
   f.write('## Portfolio publishing\n\nSource: `'+result['source_branch']+'`\n\nCommit: `'+result['source_commit']+'`\n\nPublish folder: `'+result['source_directory']+'`\n\nDeployment enabled: '+str(config['deploy'])+'\n')
if __name__=='__main__':main()
