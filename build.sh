#!/bin/bash

set -Eeuxo pipefail
docker build -t localhost:32000/slashbot:latest .
