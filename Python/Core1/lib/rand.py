#!/usr/bin/env python -W ignore::DeprecationWarning
import math
import random
from random import seed
import numpy as np
import math
from scipy.stats import expon
from scipy.stats import gamma
from scipy.stats import norm
from scipy.stats import uniform
from scipy.stats import triang
from scipy.stats import pareto
from scipy.stats import weibull_max
from scipy.stats import randint
from scipy.stats import cumfreq
from pert import PERT

from scipy import stats 
import numpy as np
import matplotlib.pyplot as plt
import sys
if not sys.warnoptions:
    import warnings
    warnings.simplefilter("ignore")

import seaborn as sns
# settings for seaborn plotting style
sns.set(color_codes=True)
# settings for seaborn plot sizes
sns.set(rc={'figure.figsize':(5,5)})

class Rand:
   seed_value = 200
   rng = 1
   def __init__(rand, seed_value):
      rand.rng = seed(seed_value)
      
   def exponential(self, lambda1):
      data_expon = expon.rvs(scale=1/lambda1,loc=0,size=1000, random_state=Rand.rng)
      print(data_expon)
      return data_expon

   def gamma1(self, shape, scale):
      data_gamma = gamma.rvs(a=shape, scale=scale, size=10000, random_state=Rand.rng)
      print( data_gamma)
      return data_gamma

   def normal(self, mean, stdDev):
      data_normal = norm.rvs(size=10000,loc=mean,scale=stdDev, random_state=Rand.rng)
      print( data_normal )
      return data_normal

   def uniform1(self, lowerBound, upperBound):
      data_uniform = uniform.rvs(size=10000, loc = lowerBound, scale=upperBound, random_state=Rand.rng)
      print(data_uniform)
      return data_uniform

   def uniformInt(self,lowerBound, upperBound):
      data_uniformInt = randint.rvs(low=1, high =31, loc=0, size=1000, random_state=Rand.rng)
      print(data_uniformInt)
      return data_uniformInt

   def triangular(self, lowerBound, upperBound, mode):
      data_triangular = triang.rvs(size=10000, c=mode, loc = lowerBound, scale=upperBound, random_state=Rand.rng)
      print(data_triangular)
      return data_triangular

   def pareto1(self, shape):
      data_pareto1 = pareto.rvs(size=10000, b=shape, random_state=Rand.rng)
      print(data_pareto1)
      return data_pareto1

   def weibull1(self,shape,scale):
      data_weibull1 = weibull_max.rvs(c=shape, scale=scale, size=10000, random_state=Rand.rng)
      print(data_weibull1)
      return data_weibull1
   
   def frequency1(self, frequencyMap):
      arrayOfkeys = []
      weights = []
      for key in frequencyMap:
         arrayOfkeys.append(int(key))
         weights.append(frequencyMap[key])
      cumcout, lowerlimit, binsize, extrapoints = stats.cumfreq(arrayOfkeys, numbins = 4, weights = weights)
      print(cumcout)
      return cumcout

   def pertdist1(self, minimum, most_likely, maximum):
      pert = PERT(minimum, most_likely, maximum)
      pert = sns.kdeplot(pert.rvs(10000, random_state = Rand.rng))

   #test code for frequency distribution
      # arr = [14, 31, 27, 27, 31, 13, 14, 13]  
      # print ("Itemfrequency : \n", stats.itemfreq(arr)) 
      # print ("\n\nBincount : \n", np.bincount(arr))
