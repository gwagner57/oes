import numpy as np
from scipy.stats import pareto
b = 0.9
np.random.seed(seed=233423)
print (pareto.rvs(b, loc=0, scale=1, size=5))