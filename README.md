# @dojo/web-editor

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

This package is inteded to be integrated into a website which would provide a more rich user interface to allow editing and running
the project in a browser.  There is a minimal API implemented in `examples/index.html` which allows the loading of example projects
that are included in this package in `projects`.

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
* `.getFileNames(...types: ProjectFileType[]): string[]` - Returns an array of strings that represent the files that can be edited
  in the project.  This is useful for populating a user interface element of files.  By default, it will include all the files
  in the project, but you can specify as many different file types as arguments and only those types of files will be returned.
* `.get(): ProjectJson | undefined` - Returns the object representation of the project JSON, including any changes that have been made
  while the project has been loaded.

### Editor

### Runner

### worker-proxy

### Supporting Modules

### external/postcss-bundle

### support/providers/amdRequire

### support/css

### support/json

### support/postcss, support/postcssCssnext, support/postcssModules

## Installation

## Licensing Information

© 2017 [JS Foundation](https://js.foundation/). [New BSD](http://opensource.org/licenses/BSD-3-Clause) license.
