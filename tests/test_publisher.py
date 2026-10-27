import importlib.util,json,subprocess,tempfile,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('publisher',Path(__file__).parents[1]/'scripts/prepare_pages.py')
publisher=importlib.util.module_from_spec(spec);spec.loader.exec_module(publisher)
class PublisherTests(unittest.TestCase):
 def fixture(self,root,dist=False,missing=False):
  subprocess.run(['git','init','-q',str(root)],check=True)
  base=root/'dist' if dist else root;base.mkdir(exist_ok=True)
  (base/'index.html').write_text('<html><script src="scripts/main.js"></script></html>')
  if not missing:
   (base/'scripts').mkdir();(base/'scripts/main.js').write_text('/* legacy runtime */')
  if dist:(root/'index.html').write_text('WRONG ROOT')
  (root/'.github').mkdir();(root/'.github/private.txt').write_text('not an artifact')
  subprocess.run(['git','add','.'],cwd=root,check=True)
  subprocess.run(['git','-c','user.name=Publisher Test','-c','user.email=test@example.invalid','commit','-qm','fixture'],cwd=root,check=True)
  subprocess.run(['git','update-ref','refs/remotes/origin/design/test','HEAD'],cwd=root,check=True)
  return root
 def test_dist_takes_precedence_and_metadata_is_excluded(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=self.fixture(Path(tmp),dist=True);out=root/'artifact';meta=publisher.prepare(root,'design/test',out)
   self.assertEqual(meta['source_directory'],'dist');self.assertNotIn('WRONG ROOT',(out/'index.html').read_text());self.assertFalse((out/'.github').exists());self.assertTrue((out/'.nojekyll').exists())
 def test_root_layout_preserves_runtime_scripts(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=self.fixture(Path(tmp));out=root/'artifact';meta=publisher.prepare(root,'design/test',out)
   self.assertEqual(meta['source_directory'],'.');self.assertTrue((out/'scripts/main.js').is_file())
 def test_non_design_refs_are_rejected(self):
  for branch in ['refs/heads/main','ops/pages-publisher','deploy/blueprint-portfolio','design/../../main','design/a;echo x']:
   with self.assertRaises(ValueError):publisher.validate_branch(branch)
 def test_main_packages_without_modifying_source(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=self.fixture(Path(tmp))
   subprocess.run(['git','update-ref','refs/remotes/origin/main','HEAD'],cwd=root,check=True)
   before=publisher.git(root,'rev-parse','refs/remotes/origin/main')
   meta=publisher.prepare(root,'main',root/'artifact')
   self.assertEqual(meta['source_branch'],'main')
   self.assertTrue((root/'artifact/scripts/main.js').is_file())
   self.assertEqual(publisher.git(root,'rev-parse','refs/remotes/origin/main'),before)
 def test_supported_source_names(self):
  for branch in ['main','design/systems-architect','experiment/bootstrap-career-timeline','preview']:
   self.assertEqual(publisher.validate_branch(branch),branch)
 def test_missing_runtime_asset_blocks_publication(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=self.fixture(Path(tmp),missing=True)
   with self.assertRaisesRegex(ValueError,'Missing local asset'):publisher.prepare(root,'design/test',root/'artifact')
 def test_output_cannot_replace_repository(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=self.fixture(Path(tmp))
   with self.assertRaises(ValueError):publisher.prepare(root,'design/test',root)
   self.assertTrue((root/'index.html').exists())
if __name__=='__main__':unittest.main()
