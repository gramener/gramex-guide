import os
import pandas as pd
from gramex.ml import Classifier


folder = os.path.dirname(os.path.abspath(__file__))
source = os.path.join(folder, 'iris.csv')
target = os.path.join(folder, 'iris.pkl')
# Read the data into a Pandas DataFrame
data = pd.read_csv(source, encoding='utf-8')

# Construct the model. The model only accepts a path where it should be saved
model = Classifier(
    model_class='sklearn.svm.SVC',  # Any sklearn model works
    model_kwargs={'kernel': 'sigmoid'},  # Optional model parameters
    url=source,
    # Input column names in data
    input=['sepal_length', 'sepal_width', 'petal_length', 'petal_width'],
    output='species',
)
# Train the model
model.train(data)  # DataFrame with input & output columns
# Once the model is trained, save it (path was specified in the constructor)
if os.path.exists(target):
    os.remove(target)
model.save(target)
