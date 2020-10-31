import time
import json
import tornado
from gramex.transforms import handler
from math import factorial
from numpy import prod
from typing import List


def total(*items):
    '''Calculate total of all items'''
    return sum(float(item) for item in items)


def add(handler):
    '''Add all values of ?x='''
    args = handler.argparse(x={'nargs': '*', 'type': float})
    return sum(args.x)


def slow(handler):
    '''Show values of ?x=1 with a 1-second delay'''
    args = handler.argparse(x={'nargs': '*'})
    for value in args.x:
        time.sleep(1)
        yield 'Calculated: %s\n' % value


async_http_client = tornado.httpclient.AsyncHTTPClient()


@tornado.gen.coroutine
def fetch_body(url):
    '''Fetches the body of a URL. As a coroutine, this returns a Future'''
    result = yield async_http_client.fetch(url)
    raise tornado.gen.Return(result.body)


def fetch(handler):
    '''Yields a series of Futures that resolve to httpbin URLs'''
    args = handler.argparse(x={'nargs': '*'})
    # Initiate the requests
    futures = [fetch_body('https://httpbin.org/delay/%s' % x) for x in args.x]
    # Yield the futures one by one
    for future in futures:
        yield future


@handler
def combinations(n:int, k:int) -> int:
    '''combinations(10, 4) -> no. of ways to pick 4 objects from 10 ignoring order'''
    return factorial(n) / factorial(k) / factorial(n - k)


@handler
def multiply(v: List[int]):
    return prod(v)
