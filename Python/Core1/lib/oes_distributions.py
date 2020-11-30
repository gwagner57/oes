"""
Create random number streams

import numpy as np
gen1 = np.random.RandomState()
gen2 = np.random.RandomState()
gen1.seed(1)
gen2.seed(2)
rns1_1 = gen1.rand()
rns1_2 = gen1.rand()
rns2_1 = gen2.rand()
rns2_2 = gen2.rand()
"""


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
    warnings.simplefilter( "ignore" )

import seaborn as sns
# settings for seaborn plotting style
sns.set( color_codes=True )
# settings for seaborn plot sizes
sns.set( rc = { 'figure.figsize':(5,5) } )

class Rand:
   @staticmethod
   def exponential( event_rate ):
      return  expon.rvs( scale = 1 / event_rate)


   def gamma( self, shape, scale ):
      if(self.seed is not None):
         data_gamma = gamma.rvs ( a = shape, scale = scale, size = 10000, random_state = self.seed )
      else:
         data_gamma = gamma.rvs ( a = shape, scale = scale, size = 10000 )
      return data_gamma

   def normal( self, mean, stdDev ):
      if(self.seed is not None):
         data_normal = norm.rvs ( size = 10000, loc = mean, scale = stdDev, random_state = self.seed )
      else:
         data_normal = norm.rvs ( size = 10000, loc = mean, scale = stdDev )
      return data_normal

   def uniform( self, lowerBound, upperBound ):
      if(self.seed is not None):
         data_uniform = uniform.rvs ( size = 10000, loc = lowerBound, scale = upperBound, random_state = self.seed )
      else:
         data_uniform = uniform.rvs ( size = 10000, loc = lowerBound, scale = upperBound )
      return data_uniform

   def uniformInt( self,lowerBound, upperBound ):
      if(self.seed is not None):
         data_uniformInt = randint.rvs ( high = upperBound, low = lowerBound , loc = 0, size = 1000, random_state = self.seed )
      else:
         data_uniformInt = randint.rvs ( high = upperBound, low = lowerBound , loc = 0, size = 1000)
      return data_uniformInt

   def triangular( self, lowerBound, upperBound, mode ):
      if(self.seed is not None):
         data_triangular = triang.rvs ( size = 10000, c = mode, loc = lowerBound, scale = upperBound, random_state = self.seed )
      else:
         data_triangular = triang.rvs ( size = 10000, c = mode, loc = lowerBound, scale = upperBound )
      return data_triangular

   def pareto( self, shape ):
      if(self.seed is not None):
         data_pareto  = pareto.rvs ( size = 10000, b = shape, random_state = self.seed )
      else:
         data_pareto  = pareto.rvs ( size = 10000, b = shape )
      return data_pareto

   def weibull( self,shape,scale ):
      if(self.seed is not None):
         data_weibull = weibull_max.rvs( c = shape, scale = scale, size = 10000, random_state = self.seed  )
      else:
         data_weibull = weibull_max.rvs( c = shape, scale = scale, size = 10000  )
      return data_weibull
   
   def frequency( self, frequencyMap ):
      arrayOfkeys = []
      weights = []
      for key in frequencyMap:
         arrayOfkeys.append( int(key) )
         weights.append( frequencyMap[key] )
      cumcout, lowerlimit, binsize, extrapoints = stats.cumfreq( arrayOfkeys, numbins = 4, weights = weights )
      return cumcout

   def pertdist( self, minimum, most_likely, maximum ):
      pert = PERT( minimum, most_likely, maximum )
      if(self.seed is not None):
         pert = sns.kdeplot( pert.rvs( 10000, random_state = self.seed ) )
      else:
         pert = sns.kdeplot( pert.rvs( 10000) )


if __name__ == "__main__":
   seed = 1234567  # test seed
   # RNG initialization with np.random.seed
   np.random.seed( seed)

   exponential_value = Rand.exponential( 0.5)
   make_plot("Exponential", exponential_value)


