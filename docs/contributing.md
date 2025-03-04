# Contributing

## Development server

When developing, run the following from the root-level directory:

```bash
npm install
npm run build
npm start
```

All packages will be live-built, and a live development server showcasing components with hot reload enabled will then run at [localhost:8080](http://localhost:8080).

## Coding style

All the JavaScript code in this project conforms to the [prettier](https://github.com/prettier/prettier) coding style. Code is automatically prettified upon commit using precommit hooks.

## Documentation

We use [mkdocs](https://www.mkdocs.org/) to build our documentation. To run documentation locally, run:

```bash
pip install -r requirements.docs.txt
mkdocs serve
```

Documentation will be served on [localhost:8000](http://localhost:8000).

## Tests

```bash
npm test
```

### Code coverage

Code coverage reports are currently available only for the `@rjsf/core` package. They are generated using [nyc](https://github.com/istanbuljs/nyc) each time the `npm test-coverage` script is run.
The full report can be seen by opening `./coverage/lcov-report/index.html`.


## Releasing

To release, go to the master branch and then create a new branch with the version number (with an `rc` prefix instead of `v`):

```bash
git checkout -b rc5.0.1
git push
npx lerna version
```

Make sure you use [semver](https://semver.org/) for version numbering when selecting the version.
The command above will create a new version tag and push it to GitHub.

Note that if you are releasing a new major version, you should bump the peer dependency `@rjsf/core` in the `package.json` files of other packages accordingly.

Then, make a PR to master. Merge the PR into master -- make sure you use "merge commit", not squash and merge, so that
the original commit where the tag was based on is still present in the master branch.

Then, create a release in the Github "Releases" tab, select the new tag that you have added,
and add a description of the changes in the new release. You can copy
the latest changelog entry in `CHANGELOG.md` to make the release notes, and update as necessary.

This will trigger a GitHub Actions pipeline that will build and publish all packages to npm.

The package is published through an automation token belonging to the
[rjsf-bot](https://www.npmjs.com/~rjsf-bot) user on npm. This token
is stored as the `NPM_TOKEN` secret on GitHub Actions.

### Releasing docs

Docs are automatically published using [Read The Docs](https://readthedocs.org/) upon a new Release.

You can also publish the latest release of the docs by running the [Release Latest Documentation](https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow#running-a-workflow) workflow on GitHub Actions.

### Releasing the playground

The playground automatically gets deployed from GitHub Pages.

If you need to manually publish the latest playground to [https://rjsf-team.github.io/react-jsonschema-form/](https://rjsf-team.github.io/react-jsonschema-form/), though, run:

```bash
cd packages/playground
npm run publish-to-gh-pages
```
