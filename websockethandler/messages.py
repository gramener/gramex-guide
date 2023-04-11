from blinker import signal


def open(handler):
    signal('msg-queue').connect(handler.write_message)


def on_message(handler, message):
    signal('msg-queue').send(message)
