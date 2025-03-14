import time

def measure_time(func, *args, **kwargs):
    """
    Measures the time taken to execute a function.

    Parameters:
    - func: The function to be executed.
    - *args: Positional arguments to pass to the function.
    - **kwargs: Keyword arguments to pass to the function.

    Returns:
    - The result of the function execution.
    """
    start_time = time.time()  # Start timing
    result = func(*args, **kwargs)  # Execute the function
    end_time = time.time()  # End timing
    print(f"Total time taken: {end_time - start_time:.2f} seconds")  # Print time taken
    return result  # Return the result of the function