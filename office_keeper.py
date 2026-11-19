#!/usr/bin/env python3
"""Run the Office keeper from anywhere: python3 /path/to/ai-office-kit/office_keeper.py --dry"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src'))
from ai_office.keeper import main  # noqa: E402

sys.exit(main())
