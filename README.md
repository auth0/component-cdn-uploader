# component-cdn-uploader

Tool to upload web widgets to Auth0 CDN via S3 bucket.

## Install

via yarn
```
yarn add @auth0/component-cdn-uploader --dev
```

via npm
```
npm install @auth0/component-cdn-uploader --save-dev
```

## Configuration

In your `package.json` add the following entry

```json
"ccu": {
  "cdn": "https://cdn.auth0.com",
  "mainBundleFile": "lock.min.js",
  "bucket": "mybucket",
  "remoteBasePath": "js"
}
```

where

- cdn: url where your CDN can be found so the lib checks if a version is already uploaded
- mainBundleFile: name of the file used when checking the CDN if a specific version is already uploaded
- bucket: name of the S3 bucket to upload to
- remoteBasePath: path in the bucket where to store the component.

You can also have the following entries

- name: name of the folder inside `remoteBasePath` that overrides the default from package's name.
- snapshotName: name of the snapshot version that will override the default `development`

## Usage

```
$ ccu [options] [directory ...]
```

options
  --type (string) type of upload flow to perform (one of 'default', 'release', 'snapshot')
  --only-full only upload full major-minor-patch version, ignored if type is 'snapshot'
  --dry perform a dry run
  --snapshot-name (string) name used for snapshot. Default is 'development'
  --silent run in silent mode
  --trace run with verbose log

### types

- default: will upload, if it does not exist in cdn (checking `mainBundleFile` existence), using full and major-minor tags (or full only if `only-full` is specified) or just the snapshot tag.
- release: will only upload, if it does not exist in cdn (checking `mainBundleFile` existence), using full and major-minor tags (or full only if `only-full` is specified) and no snaphost tag.
- snapshot: will always upload the snapshot tag.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
