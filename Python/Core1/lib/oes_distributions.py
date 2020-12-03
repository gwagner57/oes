
# still working need to implement UniformInt 

"""
Create random number streams

from numpy.random import default_rng
seed1 = 1
gen1 = default_rng( seed1)
seed2 = 2
gen2 = default_rng( seed2)
rns1_1 = gen1.rand()
rns1_2 = gen1.rand()
rns2_1 = gen2.rand()
rns2_2 = gen2.rand()
"""

from numpy.random import default_rng
from pert import PERT
from scipy import stats
import plots 
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
   def __init__( self, seed ):
      self.rng = default_rng( seed )  # RNG initialization

   def exponential( self, event_rate, size ):
      return  self.rng.exponential( scale = 1 / event_rate, size = 10000  )

   def gamma( self, alpha, beta, size ):
    return self.rng.gamma ( shape = alpha , scale = beta , size = 10000 )

   def normal( self, mean, stdDev, size):
     return self.rng.normal( loc = mean , scale = stdDev , size = 10000 )

   def uniform( self, lowerBound , upperBound , size):
     return self.rng.uniform( low = lowerBound , high = upperBound , size = 10000 )

   def uniformInt( self, lowerBound, upperBound ) :
      return self.rng.randint( high = upperBound , low = lowerBound )

   def triangular( self, lowerBound, upperBound, mode , size ):
      return self.rng.triangular( left = lowerBound, mode = mode, right = upperBound , size = 10000 )

   def pareto( self, shape , size ):
      return self.rng.pareto( a = shape , size = 10000)

   def weibull( self, shape , size ):
      return self.rng.weibull( a = shape , size = 10000 )
   
   def frequency( self, frequencyMap ):
      arrayOfkeys = []
      weights = []
      for key in frequencyMap:
         arrayOfkeys.append( int( key) )
         weights.append( frequencyMap[key] )
      cumcout, lowerlimit, binsize, extrapoints = stats.cumfreq( arrayOfkeys, numbins = 10, weights = weights )
      return cumcout

   def pertdist( self, minimum, most_likely, maximum ):
      pert = PERT( minimum, most_likely, maximum )
      return pert

if __name__ == "__main__":
   seed = 1234567  # test seed
   rand = Rand( seed )
   exponential_value = rand.exponential( 0.5, 10000 )
   gamma_value = rand.gamma( 1.0, 2.0 , 1000)
   normal_value = rand.normal( 1.5, 0.5 , 10000)
   uniform_value = rand.uniform( 0.5, 1.5 , 10000 )
   # uniformInt_value = rand.uniformInt( 1, 40 )
   triangular_value = rand.triangular( 0.5, 1.5, 1.0 , 1000 )
   pareto_value = rand.pareto( 2.0 , 10000 )
   weibull_value = rand.weibull( 0.5 , 10000 )
   frequency_value = rand.frequency( { "20":1.4, "30":2.6 , "60":3.8, "80":1.9 } )
   pert_value = rand.pertdist( 10, 190, 200 )
  

   plots.plot_exponential( "Exponential", exponential_value )
   plots.plot_gamma( "Gamma", gamma_value , 1.0 , 2.0 )
   plots.plot_normal( "Normal", normal_value , 1.5, 0.5 )
   plots.plot_uniform( "Uniform", uniform_value )
   # plots.plot_uniformInt( "UniformInt", uniformInt_value )
   plots.plot_triangle( "Triangular", triangular_value  )
   plots.plot_pareto( "Pareto", pareto_value , 2.0 ,0 )
   plots.plot_weibull( "Weibull", weibull_value  )
   plots.plot_frequency( "Frequency", frequency_value )
   plots.plot_pert( "PertDistributiion", pert_value , 10 , 190 , 200 )