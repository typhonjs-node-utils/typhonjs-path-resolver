import path from 'path';
import os   from 'os';

/**
 * Provides a file path resolver that is NPM module aware.
 *
 * @example
 * const pathResolver = new PathResolver('.', 'foo/bar.js', 'foo-bar', 'foo/bar.js');
 * pathResolver.importPath;            // 'foo-bar'
 * pathResolver.filePath;              // 'foo/bar.js'
 * pathResolver.resolve('./baz.js');   // 'foo/baz.js'
 */
export default class PathResolver
{
   /**
    * Instantiate PathResolver.
    *
    * @param {string} rootPath - root directory path.
    *
    * @param {string} filePath - relative file path from root directory path.
    *
    * @param {string} [packageName] - npm package name.
    *
    * @param {string} [mainFilePath] - npm main file path.
    */
   constructor(rootPath, filePath, packageName = void 0, mainFilePath = void 0)
   {
      this.setPathData(rootPath, filePath, packageName, mainFilePath);
   }

   /**
    * Gets the absolute file path.
    *
    * @returns {string}
    */
   get absolutePath()
   {
      return this._slash(this._filePath);
   }

   /**
    * Gets the file path that is the relative path from the root dir.
    *
    * @returns {string}
    */
   get filePath()
   {
      const relativeFilePath = path.relative(this._rootPath, this._filePath);

      return this._slash(relativeFilePath);
   }

   /**
    * Gets import path that is considered package name or main file and path prefix.
    *
    * @returns {string}
    */
   get importPath()
   {
      const relativeFilePath = this.filePath;

      if (this._mainFilePath === path.resolve(relativeFilePath))
      {
         return this._packageName;
      }

      let filePath;

      // If the relative file path starts with an actual relative path outside of where TJSDoc is executed then
      // use the relative file path as is...
      if ((/^(?:\.\.)+/).test(relativeFilePath))
      {
         filePath = relativeFilePath;
      }
      else
      {
         // If the package name is available then construct the relative import to the package / NPM module.
         if (this._packageName)
         {
            filePath = path.normalize(`${this._packageName}${path.sep}${relativeFilePath}`);
         }
         else
         {
            // Consider the relative path as local source.
            filePath = `./${relativeFilePath}`;
         }
      }

      return this._slash(filePath);
   }

   /**
    * Resolves the given file path with the data initialized in PathResolver.
    *
    * @param {string} relativePath - relative path on this file.
    *
    * @returns {string}
    */
   resolve(relativePath)
   {
      if (typeof relativePath !== 'string') { throw new TypeError(`'relativePath' is not a 'string'.`); }

      const selfDirPath = path.dirname(this._filePath);
      const resolvedPath = path.resolve(selfDirPath, relativePath);
      const resolvedRelativePath = path.relative(this._rootPath, resolvedPath);

      return this._slash(resolvedRelativePath);
   }

   /**
    * Resolve absolute path given the file path on this file.
    *
    * @param {string} relativePath - relative path on this file.
    *
    * @returns {string}
    */
   resolveAbsolutePath(relativePath)
   {
      if (typeof relativePath !== 'string') { throw new TypeError(`'relativePath' is not a 'string'.`); }

      const selfDirPath = path.dirname(this._filePath);
      const resolvedPath = path.resolve(selfDirPath, relativePath);

      return this._slash(resolvedPath);
   }

   /**
    * Sets the given path data to this PathResolver.
    *
    * @param {string} rootPath - root directory path.
    *
    * @param {string} filePath - relative file path from root directory path.
    *
    * @param {string} [packageName] - npm package name.
    *
    * @param {string} [mainFilePath] - npm main file path.
    */
   setPathData(rootPath, filePath, packageName = void 0, mainFilePath = void 0)
   {
      if (typeof rootPath !== 'string') { throw new TypeError(`'rootPath' is not a 'string'.`); }
      if (typeof filePath !== 'string') { throw new TypeError(`'filePath' is not a 'string'.`); }

      if (typeof packageName !== 'undefined' && typeof packageName !== 'string')
      {
         throw new TypeError(`'packageName' is not a 'string'.`);
      }

      if (typeof mainFilePath !== 'undefined' && typeof mainFilePath !== 'string')
      {
         throw new TypeError(`'mainFilePath' is not a 'string'.`);
      }

      /**
       * @type {string}
       */
      this._rootPath = path.resolve(rootPath);

      /**
       * @type {string}
       */
      this._filePath = path.resolve(filePath);

      /**
       * @type {NPMPackageObject}
       */
      this._packageName = packageName;

      if (mainFilePath)
      {
         /**
          * @type {string}
          */
         this._mainFilePath = path.resolve(mainFilePath);
      }
   }

   /**
    * Converts 'back slash' to 'slash' as necessary if the OS platform is windows.
    *
    * @param {string} filePath - Target file path.
    *
    * @returns {string} converted path.
    * @private
    */
   _slash(filePath)
   {
      if (os.platform() === 'win32') { filePath = filePath.replace(/\\/g, '/'); }

      return filePath;
   }
}

/**
 * Wires up PathResolver on the plugin eventbus.
 *
 * @param {PluginEvent} ev - The plugin event.
 *
 * @ignore
 */
export function onPluginLoad(ev)
{
   const eventbus = ev.eventbus;

   eventbus.on('tjsdoc:create:path:resolver', (rootPath, filePath, packageName = void 0, mainFilePath = void 0) =>
   {
      return new PathResolver(rootPath, filePath, packageName, mainFilePath);
   });
}
