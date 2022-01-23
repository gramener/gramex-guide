# Add guide-specific dependencies
conda install -y -q -c r rpy2 r-ggplot2 r-rmarkdown
pip install 'openpyxl>=3.0.4' boto3 markdown-customblocks mdx_truly_sane_lists textblob

# Set up apps
# -----------

# Build the iris model one-time on install
python modelhandler/iris.py

# Brackets indicate that we run in a subshell. So after the subshell exits,
# the current directory is retained.
(cd uifactory/editor/ && npm install)
