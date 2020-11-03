# Add guide-specific dependencies
conda install -y -q -c r r-ggplot2 r-rmarkdown
pip install --upgrade openpyxl>=3.0.4

# Set up apps
python modelhandler/iris.py
