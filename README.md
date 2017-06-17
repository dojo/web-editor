# @dojo/web-editor

[![Build Status](https://travis-ci.org/dojo/web-editor.svg?branch=master)](https://travis-ci.org/dojo/web-editor)
[![codecov.io](http://codecov.io/github/dojo/web-editor/coverage.svg?branch=master)](http://codecov.io/github/dojo/web-editor?branch=master)
[![npm version](https://badge.fury.io/js/%40dojo%2Fweb-editor.svg)](http://badge.fury.io/js/%40dojo%2Fweb-editor)

A package that provides editing and running of Dojo 2 projects in browser.

**WARNING** This is _alpha_ software. This is not yet production ready, so you should use at your own risk.

## Functionality

The `web-editor` provides three main errors of functionality:

* The ability to load a JSON file exported from a project using the Dojo 2 CLI command
  [`@dojo/cli-export-project`](https://github.com/dojo/cli-export-project) and provide the ability to transpile that project
  in the browser.
* Provide an abstraction API to allow editing of those project files in the [`monaco-editor`](https://github.com/Microsoft/monaco-editor)
  in a browser.
* Provide an API to allow the loaded project to be run in an `iframe`.
* A router which understands GitHub gists ID for being able to load a project from a gist.

This package is inteded to be integrated into a website which would provide a more rich user interface to allow editing and running
the project in a browser.  There is a minimal API implemented in `examples/index.html` which allows the loading of example projects
that are included in this package in `projects`.  This example is available at
[dojo.github.io/web-editor/](https://dojo.github.io/web-editor/)

### project

This is a singleton instance of a class which provides an API to load and manage a project.  A project file is a JSON file that
conforms to the interface described in
[`ProjectJson`](https://github.com/dojo/cli-export-project/blob/master/src/interfaces/project.json.d.ts#L6-L64) which is part of
the `@dojo/cli-export-project` package.

Because of the way the `monaco-editor` works, you can only have one *environment* per page, and `project` needs to interface with
this environment to instruct the TypeScript services what is available so the editors and the emit for the project work correctly.

There are several key methods of `project`:

* `.load(filename: string): Promise<void>` - An async function which will retrieve the specified project bundle and populate the
  environment with the information from the project.  It will resolve when the loading is complete.
* `.isLoaded(): boolean` - Returns `true` if the project is loaded, otherwise `false`.
* `.getFiles(...types: ProjectFileType[]): ProjectFile[]` - Returns object representations of the files that can be edited in the
  project.  By default, it will include all the files in the project, but you can specify as many different file types as arguments
  and only those types of files will be returned.
* `.getFileNames(...types: ProjectFileType[]): string[]` - Returns an array of strings that represent the files that can be edited
  in the project.  This is useful for populating a user interface element of files.  By default, it will include all the files
  in the project, but you can specify as many different file types as arguments and only those types of files will be returned.
* `.get(): ProjectJson | undefined` - Returns the object representation of the project JSON, including any changes that have been made
  while the project has been loaded.
* `.getProgram(): Promise<Program>` - Returns an object which contains the properties of `css`, `dependencies`, `html`, and `modules`
  which are designed to be used with the `Runner` widget as widget properties to specify the program to run.

#### Usage

Typical usage would be something like this:

```typescript
import project from '@dojo/web-editor/project';

(async () => {
    await project.load('some.project.json');
    console.log('Loaded!');
})();
```

### Editor

This is a widget which wraps `monaco-editor`, allowing the editor to seemlessly integrate with the project.  It will automatically
display files with the appropriate language intellisense as well as the file is edited, changes will automatically be sent to
the project to keep it updated.

The `Editor` has two key properties:

* `filename` - This is the name of the file in the project which the editor should be displaying.  Changing this property will cause the widget to change the file that is currently being displayed.
* `options` - Passed to the `monaco-editor` when it is created.  Needs to conform to the `monaco.editor.IEditorOptions` interface.

`Editor` is a themeable widget, with the only themeable class being `editor.base`.

#### Usage

Typical usage would be something like this:

```ts
import project from '@dojo/web-editor/project';
import Editor from '@dojo/web-editor/Editor';
import { v, w } from '@dojo/widget-core/d';
import Projector from '@dojo/widget-core/mixins/Projector';
import WidgetBase from '@dojo/widget-core/WidgetBase';

(async () => {
    await project.load('some.project.json');

    class App extends WidgetBase {
        render() {
            return v('div', [
                w(Editor, {
                    filename: './src/main.ts'
                })
            ]);
        }
    }

    const projector = new (Projector(App))();
    projector.append();
})();
```

### Runner

A widget _runs_ a program in an `iframe`.  Updating the properties related to the program on the widget will
cause it to re-render the program.

The `Runner` has several key properties which control its behaviour:

* `css`, `dependencies`, `html`, and `modules` - Properties that are part of a `Program` obtained from the returned promise of
  `project.getProgram()`.
* `loader` - An optional property which specifies the URI for the AMD loader to use with the program.  It defaults to the latest
  version of the `@dojo/loader`.
* `src` - An optional URI that will be the `src` of the `iframe` until a program is first run.  This needs to be a relative URI
  to the host in order to ensure that the run program is not impacted by cross-domain restrictions.
* `onError` - When a program is running and generates an error, this method would be called, passing a single argument of the error.
* `onInitIframe` - Called, with an argument of the `iframe` which is called when the `Runner` has configured the `iframe` in the DOM
* `onRun` - A method that is called when the `Runner` is finished standing up the program.  It does not reflect the actual state
  of the program.

`Runner` is a themeable widget, with the only themeable class being `runner.base`.

#### Usage

```ts
import { assign } from '@dojo/core/lang';
import project, { Program } from '@dojo/web-editor/project';
import Runner, { RunnerProperties } from '@dojo/web-editor/Runner';
import { v, w } from '@dojo/widget-core/d';
import { WidgetProperties } from '@dojo/widget-core/interfaces';
import Projector from '@dojo/widget-core/mixins/Projector';
import WidgetBase from '@dojo/widget-core/WidgetBase';

interface AppProperties extends WidgetProperties {
    program?: Program
}

(async () => {
    await project.load('some.project.json');

    class App extends WidgetBase<AppProperties> {
        render() {
            return v('div', [
                w(Runner, this.properties.program)
            ]);
        }
    }

    const projector = new (Projector(App))();
    projector.append();

    const program = await project.getProgram();
    project.setProperties({ program });
})();
```

### routing

This module wraps `@dojo/routing` in a way that works well for the `web-editor`.

The `web-editor` allows integration with GitHub's Gists, allowing storage of the `project.json` in a Gist which can then be used to load
the project into the editor.

#### setPath()

Set the path on the current page.  When a project is loaded, this is used to update the path to reflect the Gist's ID.

#### startGistRouter()

`startGistRouter()` is function that will configure and start the router, returning a pausable handle.  The function takes a single `options` argument which has two required properties:

* `onGist` - Called when the location is `/{id}`, intended to note a change in the Gist ID.
* `onRoot` - Called when the location is `/`, intended to note that no Gist has been loaded.

Typical usage would look like:

```ts
import { startGistRouter } from '@dojo/web-editor/routing';

startGistRouter({
    onGist(request) {
        // request.params.id contains the requested Gist ID
        // so if the project is not loaded, load the project with the supplied ID
    },

    onRoot() {
        // navigation has occured to the root, if the project is not loaded,
        // enable UI elements to allow a user to select a project
    }
});
```

### external/postcss-bundle

In order to properly transpile CSS that is part of a project, the web-editor needs to utilise postcss with additional plugins for this
purpose.  Because postcss is distributed as a NodeJS package, it is necessary to make this available in the browser with appropriate
fills of NodeJS functionality.  This is accomplished by creating a WebPack bundle of the modules and exporting the key modules as
globals.

This bundle needs to be loaded prior to loading the AMD loader, otherwise there will be conflicts between the WebPack `require()` and
the AMD `require()`.  It should look something like this:

```html
<!DOCTYPE html>
<html><title>Example</title></html>
<body>
    <script src="node_modules/@dojo/web-editor/external/postcss-bundle.js"></script>
    <script src="node_modules/@dojo/web-editor/node_modules/monaco-editor/min/vs/loader.js"></script>
    <script>
        window.MonacoEnvironment = {
            getWorkerUrl: function () {
                return '../worker-proxy.js';
            }
        };

        require.config({
            paths: {
                'vs': 'node_modules/@dojo/web-editor/node_modules/monaco-editor/min/vs',
                '@dojo': 'node_modules/@dojo'
            }
        });

        require([ './example' ], function () {});
    </script>
</body>
```

### Supporting Modules

There are several modules which are used to support the functionality of the web editor.

### support/providers/amdRequire

This module is used with `@dojo/core/require` to make it possible to retrieve inlined resources, like JSON, from a runner application.  This
will be injected, like the other transpiled modules, which resolve local resources via AMD and pass remote requests to
`@dojo/core/require/providers/xhr`.

### support/css

This module provides the transpilation of CSS for a runner application.  It provides the ability to run the CSS through CSSNext and also
provides the necessary information to allow CSS Modules to work in Dojo 2 applications.

### support/DOMParser

A module where the default export is a reference to the global `DOMParser`.

### support/gists

A module that provides tools for working with `project.json` files that are stored in GitHub Gists.

#### getById()

An async function that resolves to a description and a URL to a `package.json` for a given Gist ID.

An example of usage:

```ts
import { getById } from '@dojo/web-editor/support/gists';

(async () => {
    const gist = await getById(someId);
    await project.load(gist.projectJson);
})();
```

#### getByUsername()

An async function that resolves to an array of descriptions, IDs, and URLs to a `package.json` files stored in Gists for a given user.

An example of usage:

```ts
import { getByUsername } from '@dojo/web-editor/support/gists';

(async () => {
    const gists = await getById(someUsername);
    gists.forEach((gist) => {
        // populate a UI with available Gists
    });
})();
```

### support/json

This module provides the ability to _inline_ JSON to the AMD loader so that local project resources are available to the runner application.

### support/postcss, support/postcssCssnext, support/postcssModules

These are modules which export the exposed globals from the `postcss-bundle`.

### support/worker-proxy

This is script which will setup the `monaco-editor` web workers to be able to provide better performance when editing and running
projects.  This file should be configured up in the `monaco-editor` environment before attempting to load the rest of `monaco-editor`.

For example, you might have something like this in your web-editor page:

```html
<script>
    window.MonacoEnvironment = {
        getWorkerUrl: function () {
            return 'node_modules/@dojo/web-editor/support/worker-proxy.js';
        }
    };
</script>
```

## Installation

The package is typically instlaled using `npm`.  The distrubition though comes with a version of `monaco-editor` that uses the current
version of TypeScript.  Therefore it is often better to use that included version than the version that is currently available, as it
appears the general avaialable version lags behind in updating.

## Licensing Information

This package also includes the following libraries and their dependencies:

* [`monaco-editor`](https://github.com/Microsoft/monaco-editor) - © 2016 Microsoft Corporation. [MIT][MIT] license.
* [`postcss`](https://github.com/postcss/postcss) - © 2013 Andrey Sitnik. [MIT][MIT] license.
* [`postcss-cssnext`](https://github.com/MoOx/postcss-cssnext) - © 2014 Maxime Thirouin. [MIT][MIT] license.
* [`postcss-modules`](https://github.com/css-modules/postcss-modules) - © 2015 - 2016 Alexander Madyankin. [MIT][MIT] license.
* [`vscode-material-icon-theme`](https://github.com/PKief/vscode-material-icon-theme) - © 2015 Philipp Kief. [MIT][MIT] license.

© 2017 [JS Foundation](https://js.foundation/). [New BSD](http://opensource.org/licenses/BSD-3-Clause) license.

[MIT]: http://opensource.org/licenses/MIT
