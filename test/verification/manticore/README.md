# Symbolic analysis with Manticore
## Preliminaries

- Install Docker-Engine, find more information [here]()
- Pull manticore docker image as follows:

```bash
$ docker pull oceanprotocol/manticore:solc-0.5.6
```

Keep in mind that symbolic execution can have high requirements of memory and CPU: in particular, these tests will use up to 10 cores at the same time and a few GBs of memory. 

## Run

```bash
$ cd ../../../ 
$ npm run test:manticore
```

## Results

If you don't want to wait for the tests to run, you can take a look to a sample of the output produced by the tests in the [`results`](test/verification/manticore/results) directory.
