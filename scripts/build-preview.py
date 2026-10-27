#!/usr/bin/env python3
"""Rebuild pinned website snapshots without checking out or modifying source branches."""
import io,json,shutil,subprocess,tarfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
VERSIONS=[
 ('original','main','Original site','Original published portfolio'),
 ('classic','design/bootstrap-resume-classic','Classic resume','Bootstrap resume, skills and testimonials'),
 ('timeline','experiment/bootstrap-career-timeline','Career timeline','Experimental Bootstrap career timeline'),
 ('creative-cv','design/creative-cv-now-ui','Creative CV','Creative CV with Now UI Kit and parallax header'),
 ('resilience','design/resilience-incident-lab','Resilience lab','Dark reliability portfolio and incident simulation'),
 ('blueprint','design/refero-portfolio-concepts','Blueprint','Architecture flow and serif leadership design'),
 ('immersive','design/immersive-operations','Immersive','Technical hero, interactive assembly and guided incidents'),
 ('systems-architect','design/systems-architect','Systems Architect','Fresh, restrained design with systems sculpture and project studies'),
]
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT)
def build():
 out=ROOT/'sites';out.mkdir(exist_ok=True)
 records=[]
 for slug,branch,label,description in VERSIONS:
  sha=git('rev-parse','origin/'+branch).decode().strip()
  files=git('ls-tree','-r','--name-only',sha).decode().splitlines()
  source=sha+':dist' if 'dist/index.html' in files else sha
  destination=out/slug
  if destination.exists():shutil.rmtree(destination)
  destination.mkdir()
  archive=git('archive','--format=tar',source)
  count=0
  with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
   for member in tar.getmembers():
    relative=Path(member.name)
    if not member.isfile() or relative.is_absolute() or '..' in relative.parts:continue
    if any(part.startswith('.') for part in relative.parts):continue
    if member.name.startswith(('design/','docs/','tests/','work/','outputs/')):continue
    if relative.name.lower() in ['readme.md','package.json','package-lock.json']:continue
    target=destination/relative
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_bytes(tar.extractfile(member).read());count+=1
  if not (destination/'index.html').is_file():raise RuntimeError('Missing entry for '+branch)
  records.append(dict(id=slug,branch=branch,label=label,description=description,commit=sha,entry='sites/'+slug+'/index.html',files=count))
 manifest={'repository':'https://github.com/supersaiyane/gurpreetsingh','versions':records}
 (ROOT/'versions.json').write_text(json.dumps(manifest,indent=2)+'\n')
 template=(ROOT/'scripts/preview-shell.html').read_text()
 (ROOT/'index.html').write_text(template.replace('/*__VERSIONS__*/',json.dumps(manifest).replace('</','<\\/')))
 print('\n'.join(f"{r['branch']} -> {r['entry']} ({r['commit'][:7]}, {r['files']} files)" for r in records))
if __name__=='__main__':build()
