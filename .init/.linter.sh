#!/bin/bash
cd /home/kavia/workspace/code-generation/simple-calculator-web-app-252594-253075/react_calculator_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

