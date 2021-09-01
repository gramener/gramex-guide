import os
import gramex.ml
import gramex.cache
import gramex.data
from gramex.transforms import handler

folder = os.path.dirname(os.path.abspath(__file__))
weight_file = os.path.join(folder, 'weight.csv')


@handler
def drivers():
    data = gramex.cache.open(weight_file)
    model = gramex.ml.TopCause()
    model.fit(data, data['weight'])
    return model.result_
