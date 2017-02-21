import { assert }    from 'chai';

import PathResolver  from '../../src/PathResolver.js';

describe('PathResolver:', () =>
{
   it('resolves paths:', () =>
   {
      const pathResolver = new PathResolver('.', 'foo/bar.js', 'foo-bar', 'foo/bar.js');

      assert.strictEqual(pathResolver.importPath, 'foo-bar');
      assert.strictEqual(pathResolver.filePath, 'foo/bar.js');
      assert.strictEqual(pathResolver.resolve('./baz.js'), 'foo/baz.js');

      assert.isTrue(pathResolver.absolutePath.endsWith('/typhonjs-path-resolver/foo/bar.js'));
      assert.isTrue(pathResolver.resolveAbsolutePath('../biz/bam.js').endsWith('/typhonjs-path-resolver/biz/bam.js'));
   });

   it('throws errors:', () =>
   {
      assert.throw(() => new PathResolver());

      const pathResolver = new PathResolver('.', 'foo/bar.js', 'foo-bar', 'foo/bar.js');

      assert.throw(() => pathResolver.resolve());
      assert.throw(() => pathResolver.resolveAbsolutePath());

      assert.throw(() => pathResolver.resolve(true));
      assert.throw(() => pathResolver.resolveAbsolutePath(true));
   });
});
