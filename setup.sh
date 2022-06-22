# Add guide-specific dependencies
conda install -y -q -c r rpy2 r-ggplot2 r-rmarkdown
pip install boto3 markdown-customblocks mdx_truly_sane_lists nltk pygments textblob

# Set up apps
# -----------

# Build the iris model one-time on install
python modelhandler/iris.py
