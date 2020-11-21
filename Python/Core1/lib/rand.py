#!/usr/bin/env python -W ignore::DeprecationWarning
import math
import random
from random import seed
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
sns.set( color_codes=True )
# settings for seaborn plot sizes
sns.set(rc={'figure.figsize':(5,5)})

class Rand:
   seed = 0
   def __init__( rand, seed_value = random.random() ):
         rand.seed = seed_value
         # print("seed_value: ", seed_value)
      
   def exponential( self, lambda1 ):
      data_expon = expon.rvs( scale=1/lambda1,loc=0,size=1000, random_state=Rand.seed )
      return data_expon

   def gamma( self, shape, scale ):
      data_gamma = gamma.rvs( a=shape, scale=scale, size=10000, random_state=Rand.seed )
      return data_gamma

   def normal( self, mean, stdDev ):
      data_normal = norm.rvs( size=10000,loc=mean,scale=stdDev, random_state=Rand.seed )
      return data_normal

   def uniform( self, lowerBound, upperBound ):
      data_uniform = uniform.rvs( size=10000, loc = lowerBound, scale=upperBound, random_state=Rand.seed )
      return data_uniform

   def uniformInt( self,lowerBound, upperBound ):
      data_uniformInt = randint.rvs( high = upperBound, low = lowerBound , loc = 0, size=1000, random_state=Rand.seed )
      return data_uniformInt

   def triangular( self, lowerBound, upperBound, mode ):
      data_triangular = triang.rvs( size=10000, c=mode, loc = lowerBound, scale=upperBound, random_state=Rand.seed )
      return data_triangular

   def pareto( self, shape ):
      data_pareto  = pareto.rvs( size=10000, b=shape, random_state=Rand.seed )
      return data_pareto

   def weibull( self,shape,scale ):
      data_weibull = weibull_max.rvs( c=shape, scale=scale, size=10000, random_state=Rand.seed  )
      return data_weibull
   
   def frequency( self, frequencyMap ):
      arrayOfkeys = []
      weights = []
      for key in frequencyMap:
         arrayOfkeys.append(int(key))
         weights.append(frequencyMap[key])
      cumcout, lowerlimit, binsize, extrapoints = stats.cumfreq( arrayOfkeys, numbins = 4, weights = weights )
      return cumcout

   def pertdist( self, minimum, most_likely, maximum ):
      pert = PERT( minimum, most_likely, maximum )
      pert = sns.kdeplot( pert.rvs( 10000, random_state = Rand.seed ) )


