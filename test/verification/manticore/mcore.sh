#!/usr/bin/env bash
DIR="$(cd "$(dirname "$0")" && pwd)"
ulimit -s 65532
TESTS="AgreementStoreManager.initialize.py ConditionStoreManager.Unfulfilled.py LockRewardCondition.initialize.py TemplateStoreManager.initialize.py \
ConditionStoreManager.initialize.py EscrowReward.initialize.py OceanToken.initialize.py \
ConditionStoreManager.typeRef.py DIDRegistry.initialize.py HashLockCondition.initialize.py SignCondition.initialize.py"

rm -Rf "$DIR/results"
mkdir -p "$DIR/results"

for t in $TESTS; do
  echo "Testing $t (output saved in $DIR/results/$t.out)"
  python3 "$DIR/$t" &> "$DIR/results/$t.out"
  if [ "$?" == 0 ]; then 
    echo "PASS"
  else
    echo "FAIL"
  fi
done
