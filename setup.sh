# Ignore conda dependencies. These take too long to re-run on production
# conda install -y -q -c r rpy2 r-ggplot2

# Add guide-specific dependencies
pip install -r requirements.txt

# Set up apps
# -----------

# Build the iris model one-time on install
python modelhandler/iris.py
