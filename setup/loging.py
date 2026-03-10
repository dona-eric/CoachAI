import logging


"""This module sets up logging for the application. It configures a logger that writes logs to both the console and a file. The log level is set to DEBUG, which means that all messages of level DEBUG and above will be logged.
The log format includes the timestamp, log level, and message. The log file is named 'app.log' and is located in the same directory as this script.
"""

def logging_setup():
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('app.log'),
            logging.StreamHandler()
        ]
    )


if __name__ == "__main__":
    logging_setup()
    logging.debug("Logging setup complete.")