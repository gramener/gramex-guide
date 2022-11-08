# Add guide-specific dependencies
conda install -y -q -c r rpy2 r-ggplot2
pip install -r requirements.txt

# Set up apps
# -----------

# Build the iris model one-time on install
python modelhandler/iris.py
