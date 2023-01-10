import gramex.ml


def autolyse_add(data):
    cols = ['Maths %', 'Reading %', 'Science %', 'Social %']
    data[cols] = data[cols].fillna(data[cols].mean()).round(2)
    data['Total %'] = data[cols].mean(1).round(2)
    return data


def autolyse(data, handler):
    args = handler.argparse(
        groups={'nargs': '*', 'default': []},
        numbers={'nargs': '*', 'default': []},
        cutoff={'type': float, 'default': 0.01},
        quantile={'type': float, 'default': 0.95},
        minsize={'type': float, 'default': None},
        weight={'type': float, 'default': None},
    )
    return gramex.ml.groupmeans(
        data, args.groups, args.numbers, args.cutoff, args.quantile, args.weight
    )
