from gramex.transforms import handler
from typing import List
from typing_extensions import Annotated


@handler
def compare(
    x: Annotated[List[float], 'First list'] = (),
    y: Annotated[List[float], 'Second list'] = (),
) -> bool:
    '''
    Return True if the first list (x) is larger than the second list (y)
    '''
    return sum(x) > sum(y)
