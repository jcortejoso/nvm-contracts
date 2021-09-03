from pathlib import Path

def get_artifacts_path():
    return (Path(__file__).parent / 'artifacts').as_posix()


def get_artifact_path(contract_name, network_name):
    return (Path(__file__).parent / f'artifacts/{contract_name}.{network_name}.json').as_posix()
