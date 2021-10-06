# Add guide-specific dependencies
conda install -y -q -c r rpy2 r-ggplot2 r-rmarkdown
pip install boto3 markdown-customblocks mdx_truly_sane_lists nltk textblob

# Set up apps
# -----------

# Build the iris model one-time on install
python modelhandler/iris.py

# Brackets indicate that we run in a subshell. So after the subshell exits,
# the current directory is retained.
(cd uifactory/editor/ && npm install)
