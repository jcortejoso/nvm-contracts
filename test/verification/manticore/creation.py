
def create_did_registry(m, owner_account, DID_REGISTRY_LIBRARY_JSON_PATH, DID_REGISTRY_JSON_PATH):
    with open(DID_REGISTRY_LIBRARY_JSON_PATH) as f:
        library_json = f.read()
    library_account = m.json_create_contract(library_json, owner=owner_account, name='did_registry_library_account')
    print(f'[+] Created contract {DID_REGISTRY_LIBRARY_JSON_PATH}')

    with open(DID_REGISTRY_JSON_PATH) as f:
        contract_json = f.read()
    contract_json = contract_json.replace("__DIDRegistryLibrary____________________", hex(library_account.address).replace("0x",""))

    contract_account = m.json_create_contract(contract_json, owner=owner_account, name='did_registry_account')
    print(f'[+] Created contract {DID_REGISTRY_JSON_PATH}')

    return (library_account, contract_account)

def create_condition_store_manager(m, owner_account, EPOCH_LIBRARY_JSON_PATH, CONDITION_STORE_MANAGER_JSON_PATH):
    with open(EPOCH_LIBRARY_JSON_PATH) as f:
        library_json = f.read()
    library_account = m.json_create_contract(library_json, owner=owner_account, name='epoch_library_account')
    print(f'[+] Created contract {EPOCH_LIBRARY_JSON_PATH}')

    with open(CONDITION_STORE_MANAGER_JSON_PATH) as f:
        contract_json = f.read()
    contract_json = contract_json.replace("__EpochLibrary__________________________", hex(library_account.address).replace("0x",""))

    contract_account = m.json_create_contract(contract_json, owner=owner_account, name='condition_store_manager_account')
    print(f'[+] Created contract {CONDITION_STORE_MANAGER_JSON_PATH}')

    return (library_account, contract_account)

def create_template_store_manager(m, owner_account, TEMPLATE_STORE_MANAGER_JSON_PATH):

    with open(TEMPLATE_STORE_MANAGER_JSON_PATH) as f:
        contract_json = f.read()

    contract_account = m.json_create_contract(contract_json, owner=owner_account, name='template_store_manager_account')
    print(f'[+] Created contract {TEMPLATE_STORE_MANAGER_JSON_PATH}')

    return contract_account

def create_agreement_store_manager(m, owner_account, AGREEMENT_STORE_MANAGER_JSON_PATH):

    with open(AGREEMENT_STORE_MANAGER_JSON_PATH) as f:
        contract_json = f.read()
    contract_account = m.json_create_contract(contract_json, owner=owner_account, name='agreement_store_manager_account')
    print(f'[+] Created contract {AGREEMENT_STORE_MANAGER_JSON_PATH}')

    return contract_account

