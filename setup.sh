# Add guide-specific dependencies
conda install -y -q -c r rpy2 r-ggplot2 r-rmarkdown
pip install --ignore-installed 'openpyxl>=3.0.4' markdown-customblocks mdx_truly_sane_lists

# Set up apps
python modelhandler/iris.py
