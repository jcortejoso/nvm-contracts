import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(os.path.join(SCRIPT_DIR, os.pardir, os.pardir, os.pardir)))
BUILD_DIR = os.path.join(ROOT_DIR, 'build', 'contracts')

EPOCH_LIBRARY_JSON_PATH = os.path.join(BUILD_DIR, 'EpochLibrary.json')
CONDITION_STORE_MANAGER_JSON_PATH = os.path.join(BUILD_DIR, 'ConditionStoreManager.json')

if not (os.path.exists(EPOCH_LIBRARY_JSON_PATH) and os.path.exists(CONDITION_STORE_MANAGER_JSON_PATH)):
    sys.stderr.write('''Error: It does not appear as if the project is compiled!
Please do so before running the Manticore tests.
''')
    sys.exit(1)

################ Script #######################

if __name__ == '__main__':
    from manticore.ethereum import ManticoreEVM
    from creation           import create_condition_store_manager
    from manticore.core.smtlib import Operators

    m = ManticoreEVM()

    owner_account = m.create_account(balance=1000, name='owner_account')
    print(f'[+] Created owner account ', owner_account.name_)

    creator_account = m.create_account(balance=1000, name='creator_owner_account')
    print(f'[+] Created creator account ',creator_account.name_)

    _, contract_account = create_condition_store_manager(m, owner_account, EPOCH_LIBRARY_JSON_PATH, CONDITION_STORE_MANAGER_JSON_PATH)

    contract_account.initialize(owner_account, creator_account, caller=owner_account, value=0, signature='(address,address)')
    print(f'[+] Initialized contract ', CONDITION_STORE_MANAGER_JSON_PATH[len(ROOT_DIR):])

    condition_owner_account = m.create_account(balance=1000, name='condition_owner_account')
    print(f'[+] Created condition owner account ',condition_owner_account.name_)

    symbolic_value_1 = m.make_symbolic_value()
    symbolic_value_2 = m.make_symbolic_value()

    contract_account.createCondition(
        "condition1",
        condition_owner_account,
        symbolic_value_1,
        symbolic_value_2,
        signature='(bytes32,address,uint256,uint256)',
        caller=creator_account,
        value=0
    )

    running_states = list(m.running_states)
    if not (len(running_states) > 0):
        raise AssertionError()

    contract_account.getConditionState("condition1", caller=creator_account, value=0)
    UNFULFILLED = 1

    for state in running_states:
        tx = state.platform.human_transactions[-1]
        ret = tx.return_data
        ret = Operators.CONCAT(256, *ret)
        #print(ret)
        if m.generate_testcase(running_states[0], '', only_if=(ret != UNFULFILLED)):
            raise AssertionError()

    attacker_account = m.create_account(balance=1000, name='attacker_account')
    print(f'[+] Created attacker account ',attacker_account.name_)

    symbolic_value_1 = m.make_symbolic_value()
    contract_account.updateConditionState("condition1", symbolic_value_1, caller=attacker_account)

    running_states = list(m.running_states)
    if not (len(running_states) == 0):
        raise AssertionError()

    m.finalize()
    print(f"[+] Look for results in ", m.workspace)

