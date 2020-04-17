import os
import sys

from manticore.ethereum import ManticoreEVM

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(os.path.join(SCRIPT_DIR, os.pardir, os.pardir, os.pardir)))
BUILD_DIR = os.path.join(ROOT_DIR, 'build', 'contracts')

DISPENSER_JSON_PATH = os.path.join(BUILD_DIR, 'Dispenser.json')

if not (os.path.exists(DISPENSER_JSON_PATH)):
    sys.stderr.write('''Error: It does not appear as if the project is compiled!
Please do so before running the Manticore tests.
''')
    sys.exit(1)

################ Script #######################

m = ManticoreEVM()

token_contract = '''
contract Token {
  uint public decimals_state;
  constructor(uint _decimals) public {
      decimals_state = _decimals;
  }

  function decimals() public returns (uint) {
      return decimals_state;
  }
}
'''

token_owner_account = m.create_account(balance=1000, name='token_owner_account')
print(f'[+] Created token owner account ',token_owner_account.name_)

symbolic_value = m.make_symbolic_value(name="VALUE1")
token_account = m.solidity_create_contract(token_contract, owner=token_owner_account, name='token_account', args=[symbolic_value])

owner_account = m.create_account(balance=1000, name='owner_account')
print(f'[+] Created owner account ',owner_account.name_)

with open(DISPENSER_JSON_PATH) as f:
    contract_json = f.read()

contract_account = m.json_create_contract(contract_json, owner=owner_account, name='contract_account')

symbolic_address_1 = m.make_symbolic_value(name="ADDRESS1")
contract_account.initialize(token_account.address, symbolic_address_1, caller=owner_account, value=0, signature='(address,address)')

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

#symbolic_address_3 = m.make_symbolic_value(name="ADDRESS3")
#symbolic_address_4 = m.make_symbolic_value(name="ADDRESS4")

#attacker_account = m.create_account(balance=1000, name='attacker_account')
#print(f'[+] Created minter account "{attacker_account.name_}"')

#contract_account.initialize(symbolic_address_3, symbolic_address_4, caller=attacker_account, value=0, signature='(address,address)')

# At this point, all the transactions should revert.

m.finalize()
print(f"[+] Look for results in ",m.workspace)

