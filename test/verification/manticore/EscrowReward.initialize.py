import os
import sys

from manticore.ethereum import ManticoreEVM

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(os.path.join(SCRIPT_DIR, os.pardir, os.pardir, os.pardir)))
BUILD_DIR = os.path.join(ROOT_DIR, 'build', 'contracts')

ESCROWREWARD_JSON_PATH = os.path.join(BUILD_DIR, 'EscrowReward.json')
print(ESCROWREWARD_JSON_PATH)
if not (os.path.exists(ESCROWREWARD_JSON_PATH)):
    sys.stderr.write('''Error: It does not appear as if the project is compiled!
Please do so before running the Manticore tests.
''')
    sys.exit(1)

################ Script #######################

m = ManticoreEVM()

owner_account = m.create_account(balance=1000, name='owner_account')
print(f'[+] Created owner account ', owner_account.name_)

with open(ESCROWREWARD_JSON_PATH) as f:
    contract_json = f.read()

contract_account = m.json_create_contract(contract_json, owner=owner_account, name='contract_account')
print(f'[+] Created contract ', ESCROWREWARD_JSON_PATH[len(ROOT_DIR):])

symbolic_address_1 = m.make_symbolic_value()
#help(symbolic_address_1)
symbolic_address_2 = m.make_symbolic_value()
symbolic_address_3 = m.make_symbolic_value()

print(f'[+] Initialized contract ', ESCROWREWARD_JSON_PATH[len(ROOT_DIR):], 'with symbolic parameters')
contract_account.initialize(symbolic_address_1, symbolic_address_2, symbolic_address_3, caller=owner_account, value=0, signature='(address,address,address)')

running_states = list(m.running_states)

if not (len(running_states) == 1):
    raise AssertionError()

if m.generate_testcase(running_states[0], '', only_if=(symbolic_address_1 == 0)):
    raise AssertionError()

if m.generate_testcase(running_states[0], '', only_if=(symbolic_address_2 == 0)):
    raise AssertionError()
if m.generate_testcase(running_states[0], '', only_if=(symbolic_address_3 == 0)):
    raise AssertionError()

# At this point, it should not revert, unless one of these addresses is 0x0.

#print("[+] First symbolic transaction")
#symbolic_data = m.make_symbolic_buffer(320)
#symbolic_address = m.make_symbolic_value(name="ADDRESS1")
#symbolic_caller = m.make_symbolic_value(name="CALLER1")
#m.transaction(caller=symbolic_caller,
#                address=symbolic_address,
#                data=symbolic_data,
#                value=0 )

#print("[+] Second symbolic transaction")
#symbolic_data = m.make_symbolic_buffer(320)
#symbolic_address = m.make_symbolic_value(name="ADDRESS2")
#symbolic_caller = m.make_symbolic_value(name="CALLER2")
#m.transaction(caller=symbolic_caller,
#                address=symbolic_address,
#                data=symbolic_data,
#                value=0 )

symbolic_address_1 = m.make_symbolic_value()
symbolic_address_2 = m.make_symbolic_value()
symbolic_address_3 = m.make_symbolic_value()

attacker_account = m.create_account(balance=1000, name='attacker_account')
print(f'[+] Created attacker account ',attacker_account.name_)

contract_account.initialize(symbolic_address_1, symbolic_address_2, symbolic_address_3, caller=attacker_account, value=0, signature='(address,address,address)')

# At this point, all the transactions should revert.
if not (len(list(m.running_states)) == 0):
    raise AssertionError()

m.finalize()
print(f"[+] Look for results in ", m.workspace)

