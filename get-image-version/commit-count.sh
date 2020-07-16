#!/bin/bash
set -eou pipefail

baseBranch=$1

commitCount=''

baseBranchPath=$(git branch -r | grep "$baseBranch" | xargs)

commitCount=$(git rev-list --count "$baseBranch")

echo '{"commitCount": "'"$commitCount"'"}'
