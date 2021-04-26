# Packaging

The following package describes how to package the Keeper Contracts in different formats.
It is helpful to distribute the compiled smart contracts ABI's in different "flavours".
It allows to import those ABI's from different languages enabling an easier interaction with the Keeper.

## Javascript (NPM)

NPM packages are published as part of the **Ocean Protocol** [NPM organization](https://www.npmjs.com/org/oceanprotocol).
**Travis** is configured to release a new version of the **@oceanprotocol/keeper-contracts** NPM library after tagging.

Versions of the library must be modified in the **package.json** file.

```json
{
  "name": "@oceanprotocol/keeper-contracts",
  "version": "0.0.2",

  ..

}
```

Typically you can't overwrite NPM already published versions of the libraries.
This package uses [Semantic Versioning](https://semver.org/), so if you are testing with new versions, it's recommended to play with the patch numbers.



If you need to build a local version of the package you need to run the following commands:

```bash
npm install
npm run build
```

If you need to release a new version of the library before tagging, you need to execute the following command:
```bash
npm publish --access public
```

To do that you need to be an authorized user in the NPM Ocean Protocol organization.

## Java

The projects includes a pom.xml file prepared to generate a JAR library. Maven packages can be generated using the following commands:

```bash
mvn package
```
